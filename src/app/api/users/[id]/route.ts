import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import type { Session } from 'next-auth';

// GET - Fetch specific user
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
    
    const user = await User.findById(params.id).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    const isAdmin = extendedSession?.user?.role === 'admin';
    const isOwnProfile = session.user.id === params.id;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view this user' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update specific user
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
    
    const userData = await request.json();

    // Check authorization
    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    const isAdmin = extendedSession?.user?.role === 'admin';
    const isOwnProfile = session.user.id === params.id;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this user' },
        { status: 403 }
      );
    }

    // Find user
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updates: Record<string, unknown> = {};

    // Fields that can be updated by user or admin
    if (userData.name !== undefined) updates.name = userData.name;
    if (userData.phone !== undefined) updates.phone = userData.phone;

    // Fields that can only be updated by admin
    if (isAdmin) {
      if (userData.role !== undefined) updates.role = userData.role;
      if (userData.verified !== undefined) updates.verified = userData.verified;
      if (userData.email !== undefined) {
        // Check if new email already exists
        const existingUser = await User.findOne({ 
          email: userData.email, 
          _id: { $ne: params.id } 
        });
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Email already exists' },
            { status: 409 }
          );
        }
        updates.email = userData.email;
      }
    }

    // Password update (with current password verification for non-admin)
    if (userData.password) {
      if (!isAdmin && userData.currentPassword) {
        const isCurrentPasswordValid = await bcrypt.compare(userData.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return NextResponse.json(
            { success: false, error: 'Current password is incorrect' },
            { status: 400 }
          );
        }
      }
      
      if (!isAdmin && !userData.currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      updates.password = await bcrypt.hash(userData.password, 12);
    }

    // Profile setup and other fields
    if (userData.profileSetupCompleted !== undefined) {
      updates.profileSetupCompleted = userData.profileSetupCompleted;
    }
    
    if (userData.address !== undefined) {
      updates.address = userData.address;
    }
    
    if (userData.businessInfo !== undefined) {
      updates.businessInfo = userData.businessInfo;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password').lean();

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (Admin only, cannot delete self)
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

    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    if (extendedSession?.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (session.user.id === params.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive instead of hard delete
    // This preserves data integrity for orders, products, etc.
    const deletedUser = await User.findByIdAndUpdate(
      params.id,
      { 
        isActive: false,
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
      },
      { new: true }
    ).select('-password').lean();

    return NextResponse.json({
      success: true,
      data: deletedUser,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 