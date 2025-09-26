import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import Order from '../../../models/Order';
import Cart from '../../../models/Cart';
import User from '../../../models/User';
import { sendNotification } from '../../../lib/notificationService';
import type { Session } from 'next-auth';

// Type definitions
interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    phone?: string;
  };
}

interface PopulatedProduct {
  _id: string;
  title: string;
  images: string[];
  price: {
    selling?: number;
    wholesale?: number;
  };
  supplier: string;
}

interface PopulatedSupplier {
  _id: string;
  name: string;
  email: string;
}

interface CartItem {
  _id: string;
  productId: PopulatedProduct;
  supplierId: PopulatedSupplier;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  type?: string;
  variantId?: string;
  variantName?: string;
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  variationAttributes?: Array<{ name: string; value: string }>;
}

interface PopulatedCart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can checkout' }, { status: 403 });
    }
    
    const { shippingAddress, shippingMethod, notes, isDropshipping, customerAddress, dropshippingInstructions } = await req.json();
    
    // Validate required fields
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }
    
    if (!shippingMethod) {
      return NextResponse.json({ error: 'Shipping method is required' }, { status: 400 });
    }
    
    // Get user for membership validation
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate dropshipping data if enabled
    if (isDropshipping) {
      // Check if user has dropshipping access
      if (!user.hasDropshippingAccess || !user.hasDropshippingAccess()) {
        return NextResponse.json({ 
          error: 'Premium membership required for dropshipping. Please upgrade your account.',
          requiresUpgrade: true 
        }, { status: 403 });
      }

      if (!customerAddress || !customerAddress.name || !customerAddress.phone || 
          !customerAddress.street || !customerAddress.city || !customerAddress.state || 
          !customerAddress.postalCode || !customerAddress.country) {
        return NextResponse.json({ error: 'Customer address is required for dropshipping orders' }, { status: 400 });
      }
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: session.user.id })
      .populate({
        path: 'items.productId',
        model: 'Product',
        select: 'title images price supplier'
      })
      .populate('items.supplierId', 'name email')
      .lean() as PopulatedCart | null;
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    // Group items by supplier
    const itemsBySupplier: Record<string, CartItem[]> = {};
    cart.items.forEach((item) => {
      const supplierId = item.supplierId._id.toString();
      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = [];
      }
      itemsBySupplier[supplierId].push(item);
    });
    
    // Create orders for each supplier
    const orders = [];
    for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
      const supplier = items[0].supplierId;
      
      // Calculate total amount for this supplier's items
      const totalAmount = items.reduce((sum: number, item) => sum + (item.unitPrice * item.quantity), 0);
      
      // Format products for order
      const orderProducts = items.map((item) => ({
        productId: item.productId._id,
        productName: item.productName,
        productImage: item.productImage || item.productId.images?.[0] || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        specifications: item.type === 'bid' ? 'From accepted bid' : undefined,
        // Preserve variation data from cart
        variantId: item.variantId || '',
        variantName: item.variantName || '',
        color: item.color || '',
        size: item.size || '',
        material: item.material || '',
        style: item.style || '',
        variationAttributes: item.variationAttributes || []
      }));
      
      // Generate unique order number
      const orderNumber = `WH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create order
      const order = new Order({
        orderNumber,
        buyerId: session.user.id,
        buyerName: session.user.name,
        buyerEmail: session.user.email,
        buyerPhone: session.user.phone,
        supplierId,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        products: orderProducts,
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress,
        shippingMethod,
        estimatedDelivery: '5-7 business days',
        notes,
        isDropshipping: isDropshipping || false,
        customerAddress: isDropshipping ? customerAddress : undefined,
        dropshippingInstructions: isDropshipping ? dropshippingInstructions : undefined
      });
      
      await order.save();
      orders.push(order);
      
      // Send notification to supplier
      await sendNotification({
        userId: supplierId,
        type: 'order',
        title: 'New Order Received',
        message: `You have received a new order (${orderNumber}) from ${session.user.name}`,
        priority: 'high',
        actionUrl: `/dashboard/orders/${order._id}`
      });
    }
    
    // Clear the cart after successful checkout
    await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { items: [] },
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order(s) created successfully', 
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber
      }))
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
