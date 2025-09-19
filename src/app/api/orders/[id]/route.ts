import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import Order, { IOrder } from '../../../../models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import type { Session } from 'next-auth';

// GET - Fetch specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const order = await Order.findById(params.id).lean() as IOrder | null;

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const canView = session.user.role === 'admin' || 
                   order.buyerId === session.user.id ||
                   order.supplierId === session.user.id;

    if (!canView) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { status, paymentStatus, notes } = await request.json();

    const order = await Order.findById(params.id) as IOrder | null;

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const canUpdate = session.user.role === 'admin' || 
                     (session.user.role === 'supplier' && order.supplierId === session.user.id) ||
                     (session.user.role === 'buyer' && order.buyerId === session.user.id && status === 'cancelled');

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this order' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (status && !validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Cannot change status from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update order
    const updates: Record<string, unknown> = {};

    if (status && status !== order.status) {
      updates.status = status;
      
      // Special handling for certain statuses
      if (status === 'delivered') {
        updates.actualDelivery = new Date().toISOString();
      }
    }

    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    if (notes) {
      updates.notes = notes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    ).lean() as IOrder | null;

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const order = await Order.findById(params.id) as IOrder | null;

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization - only buyers can cancel their own pending orders
    if (session.user.role !== 'admin' && 
        !(session.user.role === 'buyer' && order.buyerId === session.user.id && order.status === 'pending')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to cancel this order' },
        { status: 403 }
      );
    }

    // Update order status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { 
        status: 'cancelled',
        notes: order.notes ? `${order.notes}\n\nOrder cancelled by ${session.user.role}` : `Order cancelled by ${session.user.role}`
      },
      { new: true }
    ).lean() as IOrder | null;

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
} 