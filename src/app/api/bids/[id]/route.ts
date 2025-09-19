import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { dbConnect } from '../../../../lib/mongodb';
import Bid from '../../../../models/Bid';
import Request from '../../../../models/Request';
import Cart, { IBidCartItem } from '../../../../models/Cart';
import User from '../../../../models/User';
import Product from '../../../../models/Product';

// GET /api/bids/[id] - Get a specific bid
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const bid = await Bid.findById(params.id)
      .populate('supplier', 'name email profileImage companyName verified')
      .populate('product', 'name images price category description')
      .populate('request', 'productName quantity targetPrice maxBudget buyerId');

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: bid
    });

  } catch (error) {
    console.error('Error fetching bid:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bid' },
      { status: 500 }
    );
  }
}

// PATCH /api/bids/[id] - Accept or reject a bid
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const action: 'accept' | 'reject' = body?.action;

    if (!action || (action !== 'accept' && action !== 'reject')) {
      return NextResponse.json(
        { error: 'Invalid action. Must be either "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Ensure params is available
    const { id } = await params;
    
    // Get the bid
    const bid = await Bid.findById(id).populate('request');
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Get the buyer
    const buyer = await User.findOne({ email: session.user.email });
    if (!buyer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the buyer is the owner of the request
    if (bid.request.buyerId !== buyer._id.toString()) {
      return NextResponse.json(
        { error: 'You can only manage bids on your own requests' },
        { status: 403 }
      );
    }

    // Check if bid is still pending
    if (bid.status !== 'pending') {
      return NextResponse.json(
        { error: 'This bid has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Accept the bid and create an order
      await acceptBid(bid, buyer);
    } else {
      // Reject the bid
      bid.status = 'rejected';
      bid.rejectedAt = new Date();
      await bid.save();
    }

    // Populate the updated bid
    await bid.populate('supplier', 'name email profileImage companyName verified');
    await bid.populate('product', 'name images price category');

    return NextResponse.json({
      success: true,
      message: `Bid ${action}ed successfully`,
      data: bid
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing bid action:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to process bid action' },
      { status: 500 }
    );
  }
}

// Helper function to accept a bid and add product to cart
async function acceptBid(bid: any, buyer: any) {
  // Start a session for transaction
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // 1. Accept the bid
      bid.status = 'accepted';
      bid.acceptedAt = new Date();
      await bid.save({ session });

      // 2. Reject all other bids for this request
      await Bid.updateMany(
        { 
          request: bid.request._id, 
          _id: { $ne: bid._id },
          status: 'pending' 
        },
        { 
          status: 'rejected',
          rejectedAt: new Date()
        },
        { session }
      );

      // 3. Update request status to fulfilled
      await Request.findByIdAndUpdate(
        bid.request._id,
        {
          status: 'fulfilled',
          acceptedBid: bid._id,
          acceptedAt: new Date()
        },
        { session }
      );

      // 4. Get supplier and product details
      const supplier = await User.findById(bid.supplier._id || bid.supplier)
        .select('name companyName')
        .session(session);
        
      const product = await Product.findById(bid.product._id || bid.product)
        .select('name images price')
        .session(session);

      if (!supplier || !product) {
        throw new Error('Supplier or product not found');
      }

      // 5. Create cart item (without bid ID)
      const cartItem: IBidCartItem = {
        type: 'bid',
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0],
        quantity: bid.quantity,
        unitPrice: bid.bidPrice, // The accepted bid price
        totalPrice: bid.bidPrice * bid.quantity,
        supplierId: supplier._id,
        supplierName: supplier.name || supplier.companyName || 'Supplier',
        addedAt: new Date(),
        isBulkOrder: true,
        minOrderQuantity: bid.quantity, // Minimum is the accepted quantity
        requestId: bid.request._id,
        originalPrice: product.price, // Original product price for reference
        discountPercent: Math.round(((product.price - bid.bidPrice) / product.price) * 100)
      };

      // 6. Find or create cart for user and add item
      await Cart.findOneAndUpdate(
        { userId: buyer._id, 'items.productId': { $ne: product._id } },
        {
          $push: { 
            items: cartItem 
          },
          $setOnInsert: { 
            userId: buyer._id,
            createdAt: new Date()
          }
        },
        { 
          upsert: true,
          new: true,
          session,
          setDefaultsOnInsert: true
        }
      );
    });

  } finally {
    await session.endSession();
  }
}

// DELETE /api/bids/[id] - Withdraw a bid (supplier only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get the supplier
    const supplier = await User.findOne({ email: session.user.email });
    if (!supplier) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the bid
    const bid = await Bid.findById(params.id);
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Check if the supplier owns this bid
    if (bid.supplier.toString() !== supplier._id.toString()) {
      return NextResponse.json(
        { error: 'You can only withdraw your own bids' },
        { status: 403 }
      );
    }

    // Check if bid can be withdrawn
    if (bid.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending bids can be withdrawn' },
        { status: 400 }
      );
    }

    // Withdraw the bid
    bid.status = 'withdrawn';
    await bid.save();

    // Update request bid count
    await Request.findByIdAndUpdate(bid.request, {
      $inc: { bidCount: -1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Bid withdrawn successfully'
    });

  } catch (error) {
    console.error('Error withdrawing bid:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw bid' },
      { status: 500 }
    );
  }
}
