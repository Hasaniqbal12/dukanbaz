import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/profile/avatar - Upload profile avatar
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const data = await req.json();
    const { avatar } = data;

    if (!avatar) {
      return NextResponse.json({ 
        success: false,
        error: 'Avatar data is required' 
      }, { status: 400 });
    }

    // For now, we'll accept base64 data URLs or external URLs
    // In production, you'd want to validate file type, size, and upload to cloud storage
    let avatarUrl = avatar;

    // Basic validation for data URLs or HTTP URLs
    if (!avatar.startsWith('data:image/') && !avatar.startsWith('http')) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid avatar format. Please provide a valid image URL or base64 data.' 
      }, { status: 400 });
    }

    // Update user avatar
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          avatar: avatarUrl,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: updatedUser.avatar,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update avatar' 
    }, { status: 500 });
  }
}

// DELETE /api/profile/avatar - Remove profile avatar
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Remove user avatar
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $unset: { avatar: "" },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Avatar removed successfully',
      data: {
        avatar: null,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Avatar removal error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to remove avatar' 
    }, { status: 500 });
  }
}
