import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/messages - Fetch user's recent messages
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

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    // Generate realistic message data based on user role
    // In production, this would fetch from Messages collection
    const messages = [
      {
        id: 1,
        senderId: 'user_ahmed_electronics',
        senderName: 'Ahmed Electronics',
        senderInitials: 'AE',
        senderColor: 'bg-blue-500',
        message: 'Hi, is the laptop still available?',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        unread: true,
        conversationId: 'conv_001'
      },
      {
        id: 2,
        senderId: 'user_karachi_supplies',
        senderName: 'Karachi Supplies',
        senderInitials: 'KS',
        senderColor: 'bg-purple-500',
        message: 'Your order has been shipped!',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        unread: true,
        conversationId: 'conv_002'
      },
      {
        id: 3,
        senderId: 'user_lahore_textiles',
        senderName: 'Lahore Textiles',
        senderInitials: 'LT',
        senderColor: 'bg-green-500',
        message: 'Thank you for your order!',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        unread: false,
        conversationId: 'conv_003'
      },
      {
        id: 4,
        senderId: 'user_islamabad_tech',
        senderName: 'Islamabad Tech',
        senderInitials: 'IT',
        senderColor: 'bg-indigo-500',
        message: 'Can we schedule a call to discuss bulk pricing?',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        unread: true,
        conversationId: 'conv_004'
      },
      {
        id: 5,
        senderId: 'user_faisalabad_cotton',
        senderName: 'Faisalabad Cotton Mills',
        senderInitials: 'FC',
        senderColor: 'bg-yellow-500',
        message: 'New cotton shipment arrived. Interested?',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        unread: true,
        conversationId: 'conv_005'
      }
    ];

    const unreadCount = messages.filter(msg => msg.unread).length;

    return NextResponse.json({ 
      success: true,
      data: {
        messages: messages.slice(0, 5), // Return only recent 5 messages for homepage
        unreadCount,
        totalMessages: messages.length
      }
    });

  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch messages' 
    }, { status: 500 });
  }
}

// POST /api/messages - Send a new message
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions) as any;
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const { recipientId, message, conversationId } = await req.json();

    if (!recipientId || !message) {
      return NextResponse.json({ 
        success: false,
        error: 'Recipient ID and message are required' 
      }, { status: 400 });
    }

    // In production, this would save to Messages collection
    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully',
      data: {
        id: Date.now(),
        senderId: session.user.id,
        recipientId,
        message,
        conversationId: conversationId || `conv_${Date.now()}`,
        timestamp: new Date().toISOString(),
        unread: true
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to send message' 
    }, { status: 500 });
  }
}
