import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth';

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || '';

    // Build query
    const query: Record<string, unknown> = {
      userId: (session.user as any).id
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        userId: (session.user as any).id,
        isRead: false
      })
    ]);

    const totalPages = Math.ceil(totalNotifications / limit);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages,
          totalNotifications,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create new notification (Admin or system use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create notifications
    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    if (extendedSession?.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required to create notifications' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const notificationData = await request.json();

    // Validate required fields
    const requiredFields = ['userId', 'title', 'message', 'type'];
    for (const field of requiredFields) {
      if (!notificationData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create notification
    const notification = new Notification({
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      data: notificationData.data || {},
      actionUrl: notificationData.actionUrl,
      isRead: false,
      priority: notificationData.priority || 'medium'
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { notificationIds, markAllAsRead } = await request.json();

    let updateQuery: Record<string, unknown>;
    
    if (markAllAsRead) {
      // Mark all user's notifications as read
      updateQuery = {
        userId: (session.user as any).id,
        isRead: false
      };
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      updateQuery = {
        _id: { $in: notificationIds },
        userId: (session.user as any).id,
        isRead: false
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Either notificationIds or markAllAsRead must be provided' },
        { status: 400 }
      );
    }

    const result = await Notification.updateMany(
      updateQuery,
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: 'Notifications marked as read'
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const notificationIds = searchParams.get('ids')?.split(',') || [];
    const deleteAll = searchParams.get('deleteAll') === 'true';

    let deleteQuery: Record<string, unknown>;
    
    if (deleteAll) {
      // Delete all user's read notifications
      deleteQuery = {
        userId: (session.user as any).id,
        isRead: true
      };
    } else if (notificationIds.length > 0) {
      // Delete specific notifications
      deleteQuery = {
        _id: { $in: notificationIds },
        userId: (session.user as any).id
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Either notification IDs or deleteAll parameter must be provided' },
        { status: 400 }
      );
    }

    const result = await Notification.deleteMany(deleteQuery);

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      },
      message: 'Notifications deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
} 