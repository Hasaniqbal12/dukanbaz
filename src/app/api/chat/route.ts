import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (conversationId) {
      // Get messages for a specific conversation
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('sender', 'name email role')
        .populate('receiver', 'name email role');

      return NextResponse.json({
        success: true,
        messages: messages.reverse() // Reverse to show oldest first
      });
    } else {
      // Get all conversations for the user
      const userId = (session.user as any).id;
      const conversations = await Conversation.find({
        participants: userId
      })
        .populate('participants', 'name email role company')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

      return NextResponse.json({
        success: true,
        conversations
      });
    }
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { receiverId, message, messageType = 'text', fileUrl, fileName } = body;
    const senderId = (session.user as any).id;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await conversation.save();
    }

    // Create new message
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: message,
      messageType,
      fileUrl,
      fileName,
      isRead: false,
      createdAt: new Date()
    });

    await newMessage.save();

    // Update conversation with last message
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate the message before returning
    await newMessage.populate('sender', 'name email role');
    await newMessage.populate('receiver', 'name email role');

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { conversationId, markAsRead } = body;
    const userId = (session.user as any).id;

    if (markAsRead) {
      // Mark all messages in conversation as read
      await Message.updateMany(
        { 
          conversationId,
          receiver: userId,
          isRead: false 
        },
        { isRead: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Messages marked as read'
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Chat PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 