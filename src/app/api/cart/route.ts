import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Cart, { ICartItem } from '@/models/Cart';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET /api/cart - Fetch user's cart items
export async function GET() {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions) as any;
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Find or create cart for user using upsert to avoid duplicate key errors
    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { $setOnInsert: { userId: session.user.id, items: [] } },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    )
    .populate({
      path: 'items.productId',
      model: 'Product',
      select: 'title images price stock description slug'
    })
    .populate('items.supplierId', 'name companyName')
    .lean() as any;


    // Calculate totals
    const totalItems = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    const totalAmount = cart?.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0;

    // Format response
    const formattedItems = cart?.items?.map((item: any) => ({
      id: item._id?.toString() || '',
      type: item.type,
      productId: item.productId?._id || item.productId,
      name: item.productName,
      image: item.productImage || (item.productId?.images?.[0] || ''),
      price: item.unitPrice,
      quantity: item.quantity,
      total: item.totalPrice,
      supplier: item.supplierName,
      supplierId: item.supplierId?._id || item.supplierId,
      isBulkOrder: item.isBulkOrder,
      minOrderQuantity: item.minOrderQuantity,
      maxOrderQuantity: item.maxOrderQuantity,
      addedAt: item.addedAt,
      // Bid-specific fields
      ...(item.type === 'bid' && {
        isBid: true,
        originalPrice: item.originalPrice,
        discountPercent: item.discountPercent,
        requestId: item.requestId
      }),
      // Regular product fields
      ...(item.type === 'regular' && {
        variantId: item.variantId,
        variantName: item.variantName,
        color: item.color,
        size: item.size,
        material: item.material,
        style: item.style,
        variationAttributes: item.variationAttributes
      })
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: cart?._id?.toString() || '',
        items: formattedItems,
        totalItems,
        totalAmount,
        createdAt: cart?.createdAt,
        updatedAt: cart?.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching cart:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch cart' 
    }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as any;
  
  if (!session?.user?.id) {
    return NextResponse.json({ 
      success: false,
      error: 'Not authenticated' 
    }, { status: 401 });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    await dbConnect();
    
    const requestBody = await req.json();
    
    const { 
      type = 'regular', // 'regular' or 'bid'
      productId, 
      quantity = 1, 
      variantId, 
      variantName,
      color,
      size,
      material,
      style,
      variationAttributes,
      isBulkOrder = false,
      // Tier-based pricing
      tierPrice,
      // Bid-specific fields
      bidId,
      requestId,
      originalPrice,
      discountPercent,
      bidPrice
    } = requestBody;
    

    // Common validation
    if (!productId) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Product ID is required' 
      }, { status: 400 });
    }

    // Get product details
    const product = await Product.findById(productId).session(dbSession);
    if (!product) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Get supplier details - handle both ObjectId and populated supplier
    const supplierId = product.supplier?._id || product.supplier?.id || product.supplier;
    const supplier = await User.findById(supplierId).session(dbSession);
    if (!supplier) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Supplier not found' 
      }, { status: 404 });
    }

    let cartItem: Partial<ICartItem>;
    
    if (type === 'bid') {
      // Handle bid items
      if (!bidId || !requestId || originalPrice === undefined || !bidPrice) {
        await dbSession.abortTransaction();
        return NextResponse.json({ 
          success: false,
          error: 'Bid details are required' 
        }, { status: 400 });
      }
      
      cartItem = {
        type: 'bid',
        productId: product._id,
        productName: product.title,
        productImage: Array.isArray(product.images) ? product.images[0] : '',
        quantity: Math.max(1, quantity),
        unitPrice: bidPrice, // Use the accepted bid price
        totalPrice: bidPrice * Math.max(1, quantity),
        supplierId: supplier._id,
        supplierName: supplier.name || supplier.companyName || 'Supplier',
        addedAt: new Date(),
        isBulkOrder: true,
        minOrderQuantity: quantity, // Minimum is the accepted quantity
        requestId: new mongoose.Types.ObjectId(requestId),
        originalPrice: originalPrice,
        discountPercent: discountPercent || 0
      };
    } else {
      // Handle regular products
      // Use tier price if provided, otherwise fall back to product price
      const finalPrice = tierPrice || product.price;
      
      cartItem = {
        type: 'regular',
        productId: product._id,
        productName: product.title,
        productImage: Array.isArray(product.images) ? product.images[0] : '',
        quantity: Math.max(1, quantity),
        unitPrice: finalPrice,
        totalPrice: finalPrice * Math.max(1, quantity),
        supplierId: supplier._id,
        supplierName: supplier.name || supplier.companyName || 'Supplier',
        addedAt: new Date(),
        isBulkOrder: isBulkOrder,
        minOrderQuantity: product.minOrderQuantity || 1,
        maxOrderQuantity: product.maxOrderQuantity,
        bulkDiscount: product.bulkDiscount,
        variantId,
        variantName,
        // Individual variation attributes
        color: color || undefined,
        size: size || undefined,
        material: material || undefined,
        style: style || undefined,
        // Variation combination details
        variationAttributes: variationAttributes || []
      };
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId: session.user.id }).session(dbSession);
    
    if (!cart) {
      // Create new cart with the item
      cart = new Cart({
        userId: session.user.id,
        items: [cartItem]
      });
    } else {
      // Add to existing cart or update quantity
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === product._id.toString() &&
               item.variantId === variantId &&
               item.color === color &&
               item.size === size &&
               item.material === material &&
               item.style === style
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
      } else {
        // Add new item
        cart.items.push(cartItem);
      }
    }

    await cart.save({ session: dbSession });

    await dbSession.commitTransaction();
    
    return NextResponse.json({ 
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cartId: cart._id,
        item: cartItem
      }
    });

  } catch (error) {
    await dbSession.abortTransaction();
    console.error('Add to cart error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to add item to cart' 
    }, { status: 500 });
  } finally {
    dbSession.endSession();
  }
}

// PATCH /api/cart - Update cart item quantity
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions) as any;
  
  if (!session?.user?.id) {
    return NextResponse.json({ 
      success: false,
      error: 'Not authenticated' 
    }, { status: 401 });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    await dbConnect();
    
    const { itemId, quantity } = await req.json();

    if (!itemId || quantity === undefined || quantity < 1) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Valid item ID and quantity are required' 
      }, { status: 400 });
    }

    // Find the cart and item
    const cart = await Cart.findOne({ 
      userId: session.user.id,
      'items._id': itemId 
    }).session(dbSession);

    if (!cart) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Item not found in cart' 
      }, { status: 404 });
    }

    // Get the item to check min/max quantities
    const item = cart.items.find((i: any) => i._id.toString() === itemId);
    if (!item) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Item not found in cart' 
      }, { status: 404 });
    }

    // Validate quantity against min/max
    const newQuantity = Math.max(1, Math.floor(quantity));
    
    if (item.minOrderQuantity && newQuantity < item.minOrderQuantity) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: `Minimum order quantity is ${item.minOrderQuantity}`
      }, { status: 400 });
    }
    
    if (item.maxOrderQuantity && newQuantity > item.maxOrderQuantity) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: `Maximum order quantity is ${item.maxOrderQuantity}`
      }, { status: 400 });
    }

    // Update the quantity
    await Cart.updateOne(
      { 
        _id: cart._id,
        'items._id': itemId 
      },
      { 
        $set: { 
          'items.$.quantity': newQuantity,
          'items.$.totalPrice': item.unitPrice * newQuantity
        } 
      },
      { session: dbSession }
    );

    await dbSession.commitTransaction();
    
    return NextResponse.json({ 
      success: true,
      message: 'Cart item updated successfully',
      data: {
        itemId,
        quantity: newQuantity,
        totalPrice: item.unitPrice * newQuantity
      }
    });

  } catch (error) {
    await dbSession.abortTransaction();
    console.error('Update cart item error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update cart item' 
    }, { status: 500 });
  } finally {
    dbSession.endSession();
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions) as any;
  
  if (!session?.user?.id) {
    return NextResponse.json({ 
      success: false,
      error: 'Not authenticated' 
    }, { status: 401 });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Item ID is required' 
      }, { status: 400 });
    }

    // Remove the item from the cart
    const result = await Cart.updateOne(
      { userId: session.user.id },
      { 
        $pull: { 
          items: { _id: new mongoose.Types.ObjectId(itemId) } 
        } 
      },
      { session: dbSession }
    );

    if (result.matchedCount === 0) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Cart not found' 
      }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      await dbSession.abortTransaction();
      return NextResponse.json({ 
        success: false,
        error: 'Item not found in cart' 
      }, { status: 404 });
    }

    await dbSession.commitTransaction();
    
    return NextResponse.json({ 
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    await dbSession.abortTransaction();
    console.error('Remove from cart error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to remove item from cart' 
    }, { status: 500 });
  } finally {
    dbSession.endSession();
  }
}
