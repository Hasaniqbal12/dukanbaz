import mongoose from 'mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';

type AddToCartParams = {
  userId: string | mongoose.Types.ObjectId;
  productId: string | mongoose.Types.ObjectId;
  quantity: number;
  type: 'regular' | 'bid';
  variantId?: string;
  variantName?: string;
  isBulkOrder?: boolean;
  // Bid-specific fields
  bidId?: string | mongoose.Types.ObjectId;
  requestId?: string | mongoose.Types.ObjectId;
  originalPrice?: number;
  discountPercent?: number;
  bidPrice?: number;
};

export async function addToCart(params: AddToCartParams, session: mongoose.ClientSession) {
  const {
    userId,
    productId,
    quantity = 1,
    type = 'regular',
    variantId,
    variantName,
    isBulkOrder = false,
    // Bid-specific fields
    bidId,
    requestId,
    originalPrice,
    discountPercent = 0,
    bidPrice
  } = params;

  // Get product details
  const product = await Product.findById(productId).session(session);
  if (!product) {
    throw new Error('Product not found');
  }

  // Get supplier details
  const supplier = await User.findById(product.supplier).session(session);
  if (!supplier) {
    throw new Error('Supplier not found');
  }

  let cartItem: any;
  
  if (type === 'bid') {
    // Validate required bid fields
    if (!bidId || !requestId || originalPrice === undefined || bidPrice === undefined) {
      throw new Error('Missing required bid information');
    }
    
    cartItem = {
      type: 'bid',
      productId: product._id,
      productName: product.name,
      productImage: product.images?.[0],
      quantity: Math.max(1, quantity),
      unitPrice: bidPrice,
      totalPrice: bidPrice * Math.max(1, quantity),
      supplierId: supplier._id,
      supplierName: supplier.name || supplier.companyName || 'Supplier',
      addedAt: new Date(),
      isBulkOrder: true,
      minOrderQuantity: quantity, // Minimum is the accepted quantity
      requestId: new mongoose.Types.ObjectId(requestId),
      originalPrice,
      discountPercent
    };
  } else {
    // Regular product
    cartItem = {
      type: 'regular',
      productId: product._id,
      productName: product.name,
      productImage: product.images?.[0],
      quantity: Math.max(1, quantity),
      unitPrice: product.price,
      totalPrice: product.price * Math.max(1, quantity),
      supplierId: supplier._id,
      supplierName: supplier.name || supplier.companyName || 'Supplier',
      addedAt: new Date(),
      isBulkOrder,
      minOrderQuantity: product.minOrderQuantity || 1,
      maxOrderQuantity: product.maxOrderQuantity,
      bulkDiscount: product.bulkDiscount,
      variantId,
      variantName
    };
  }

  // Update or create cart
  const cart = await Cart.findOneAndUpdate(
    { 
      userId,
      // For regular products, don't add duplicates
      ...(type === 'regular' && { 'items.productId': { $ne: product._id } })
    },
    {
      $push: { items: cartItem },
      $setOnInsert: { 
        userId,
        createdAt: new Date()
      }
    },
    { 
      new: true, 
      upsert: true, 
      session
    }
  );

  return {
    cartId: cart._id,
    item: cartItem
  };
}

export async function updateCartItemQuantity(
  userId: string | mongoose.Types.ObjectId,
  itemId: string | mongoose.Types.ObjectId,
  quantity: number,
  session: mongoose.ClientSession
) {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  // Find the cart and item
  const cart = await Cart.findOne({ 
    userId,
    'items._id': itemId 
  }).session(session);

  if (!cart) {
    throw new Error('Item not found in cart');
  }

  // Get the item to check min/max quantities
  const item = cart.items.find((i: any) => i._id.toString() === itemId.toString());
  if (!item) {
    throw new Error('Item not found in cart');
  }

  // Validate quantity against min/max
  const newQuantity = Math.max(1, Math.floor(quantity));
  
  if (item.minOrderQuantity && newQuantity < item.minOrderQuantity) {
    throw new Error(`Minimum order quantity is ${item.minOrderQuantity}`);
  }
  
  if (item.maxOrderQuantity && newQuantity > item.maxOrderQuantity) {
    throw new Error(`Maximum order quantity is ${item.maxOrderQuantity}`);
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
    { session }
  );

  return {
    itemId,
    quantity: newQuantity,
    totalPrice: item.unitPrice * newQuantity
  };
}

export async function removeCartItem(
  userId: string | mongoose.Types.ObjectId,
  itemId: string | mongoose.Types.ObjectId,
  session: mongoose.ClientSession
) {
  // Remove the item from the cart
  const result = await Cart.updateOne(
    { userId },
    { 
      $pull: { 
        items: { _id: new mongoose.Types.ObjectId(itemId) } 
      } 
    },
    { session }
  );

  if (result.matchedCount === 0) {
    throw new Error('Cart not found');
  }

  if (result.modifiedCount === 0) {
    throw new Error('Item not found in cart');
  }

  return { success: true };
}
