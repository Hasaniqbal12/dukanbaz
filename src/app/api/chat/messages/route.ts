import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth';

// GET - Fetch messages for a conversation
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
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view this conversation' },
        { status: 403 }
      );
    }

    // Fetch messages with pagination (latest first)
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Reverse to show oldest first in the response
    const formattedMessages = messages.reverse();

    // Get total count
    const totalMessages = await Message.countDocuments({ conversationId });
    const totalPages = Math.ceil(totalMessages / limit);

    // Mark messages as read for the current user
    await Message.updateMany(
      {
        conversationId,
        receiver: session.user.id,
        isRead: false
      },
      { 
        isRead: true 
      }
    );

    // Update conversation unread count
    if (conversation.participantDetails) {
      const userDetails = conversation.participantDetails.find(
        (pd: any) => pd.userId.toString() === session.user.id
      );
      if (userDetails) {
        userDetails.unreadCount = 0;
        userDetails.lastReadAt = new Date();
        await conversation.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { 
      conversationId, 
      content, 
      messageType = 'text',
      fileUrl,
      fileName,
      fileSize 
    } = await request.json();

    // Validate required fields
    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to send message to this conversation' },
        { status: 403 }
      );
    }

    // Get receiver (other participant)
    const receiver = conversation.participants.find(
      (p: any) => p.toString() !== session.user.id
    );

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'Receiver not found' },
        { status: 400 }
      );
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: session.user.id,
      receiver: receiver,
      content,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      isRead: false
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    
    // Update unread count for receiver
    if (conversation.participantDetails) {
      const receiverDetails = conversation.participantDetails.find(
        (pd: any) => pd.userId.toString() === receiver.toString()
      );
      if (receiverDetails) {
        receiverDetails.unreadCount += 1;
      }
    }

    await conversation.save();

    // Populate message data for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedMessage,
      message: 'Message sent successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PUT - Mark messages as read
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
    
    const { conversationId, messageIds } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Build query
    const query: any = {
      conversationId,
      receiver: session.user.id,
      isRead: false
    };

    if (messageIds && messageIds.length > 0) {
      query._id = { $in: messageIds };
    }

    // Mark messages as read
    const result = await Message.updateMany(query, { isRead: true });

    // Update conversation unread count
    if (conversation.participantDetails) {
      const userDetails = conversation.participantDetails.find(
        (pd: any) => pd.userId.toString() === session.user.id
      );
      if (userDetails) {
        userDetails.unreadCount = 0;
        userDetails.lastReadAt = new Date();
        await conversation.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
} 
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth';

// GET - Fetch messages for a conversation
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
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view this conversation' },
        { status: 403 }
      );
    }

    // Fetch messages with pagination (latest first)
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Reverse to show oldest first in the response
    const formattedMessages = messages.reverse();

    // Get total count
    const totalMessages = await Message.countDocuments({ conversationId });
    const totalPages = Math.ceil(totalMessages / limit);

    // Mark messages as read for the current user
    await Message.updateMany(
      {
        conversationId,
        receiver: session.user.id,
        isRead: false
      },
      { 
        isRead: true 
      }
    );

    // Update conversation unread count
    if (conversation.participantDetails) {
      const userDetails = conversation.participantDetails.find(
        (pd: any) => pd.userId.toString() === session.user.id
      );
      if (userDetails) {
        userDetails.unreadCount = 0;
        userDetails.lastReadAt = new Date();
        await conversation.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { 
      conversationId, 
      content, 
      messageType = 'text',
      fileUrl,
      fileName,
      fileSize 
    } = await request.json();

    // Validate required fields
    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to send message to this conversation' },
        { status: 403 }
      );
    }

    // Get receiver (other participant)
    const receiver = conversation.participants.find(
      (p: any) => p.toString() !== session.user.id
    );

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'Receiver not found' },
        { status: 400 }
      );
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: session.user.id,
      receiver: receiver,
      content,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      isRead: false
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    
    // Update unread count for receiver
    if (conversation.participantDetails) {
      const receiverDetails = conversation.participantDetails.find(
        (pd: any) => pd.userId.toString() === receiver.toString()
      );
      if (receiverDetails) {
        receiverDetails.unreadCount += 1;
      }
    }

    await conversation.save();

    // Populate message data for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedMessage,
      message: 'Message sent successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PUT - Mark messages as read
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
    
    const { conversationId, messageIds } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Build query
    const query: any = {
      conversationId,
      receiver: session.user.id,
      isRead: false
    };

    if (messageIds && messageIds.length > 0) {
      query._id = { $in: messageIds };
    }

    // Mark messages as read
    const result = await Message.updateMany(query, { isRead: true });

    // Update conversation unread count
    if (conversation.participantDetails) {
      const userDetails = conversation.participantDetails.find(
        (pd: any) => pd.userId.toString() === session.user.id
      );
      if (userDetails) {
        userDetails.unreadCount = 0;
        userDetails.lastReadAt = new Date();
        await conversation.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
} 
 
 
 
 