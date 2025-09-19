import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import Conversation from '../../../../models/Conversation';
import Message from '../../../../models/Message';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import type { Session } from 'next-auth';

// GET - Fetch user's conversations
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
    const archived = searchParams.get('archived') === 'true';

    // Build query
    const query = {
      participants: session.user.id,
      isActive: true
    };

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find(query)
      .populate({
        path: 'participants',
        select: 'name email avatar role company verified',
        model: 'User'
      })
      .populate({
        path: 'lastMessage',
        select: 'content messageType sender createdAt isRead',
        model: 'Message',
        populate: {
          path: 'sender',
          select: 'name avatar',
          model: 'User'
        }
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format conversations with additional info
    const formattedConversations = conversations.map((conv: any) => {
      // Get the other participant (for direct conversations)
      const otherParticipant = conv.participants.find(
        (p: any) => p._id.toString() !== session.user.id
      );

      // Get user-specific details
      const userDetails = conv.participantDetails?.find(
        (pd: any) => pd.userId.toString() === session.user.id
      );

      return {
        _id: conv._id,
        conversationType: conv.conversationType,
        title: conv.title || otherParticipant?.name || 'Unknown User',
        participants: conv.participants,
        otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: userDetails?.unreadCount || 0,
        isArchived: userDetails?.isArchived || false,
        isMuted: userDetails?.isMuted || false,
        lastReadAt: userDetails?.lastReadAt,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      };
    });

    // Get total count
    const totalConversations = await Conversation.countDocuments(query);
    const totalPages = Math.ceil(totalConversations / limit);

    return NextResponse.json({
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          currentPage: page,
          totalPages,
          totalConversations,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST - Create new conversation or start chat
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
    
    const { participantId, initialMessage, conversationType = 'direct' } = await request.json();

    // Validate participant
    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Check if participant exists
    const participant = await User.findById(participantId).select('name email');
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if conversation already exists (for direct conversations)
    let conversation;
    if (conversationType === 'direct') {
      conversation = await Conversation.findOne({
        conversationType: 'direct',
        participants: { $all: [session.user.id, participantId] },
        isActive: true
      }).populate('participants', 'name email avatar role company verified');

      if (conversation) {
        return NextResponse.json({
          success: true,
          data: conversation,
          message: 'Conversation already exists'
        });
      }
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [session.user.id, participantId],
      participantDetails: [
        {
          userId: session.user.id,
          unreadCount: 0,
          isArchived: false,
          isMuted: false
        },
        {
          userId: participantId,
          unreadCount: initialMessage ? 1 : 0,
          isArchived: false,
          isMuted: false
        }
      ],
      conversationType,
      isActive: true,
      createdBy: session.user.id
    });

    await conversation.save();

    // Send initial message if provided
    let firstMessage = null;
    if (initialMessage) {
      firstMessage = new Message({
        conversationId: conversation._id,
        sender: session.user.id,
        receiver: participantId,
        content: initialMessage,
        messageType: 'text',
        isRead: false
      });

      await firstMessage.save();

      // Update conversation with last message
      conversation.lastMessage = firstMessage._id;
      await conversation.save();
    }

    // Populate and return the conversation
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar role company verified')
      .populate({
        path: 'lastMessage',
        select: 'content messageType sender createdAt isRead',
        populate: {
          path: 'sender',
          select: 'name avatar'
        }
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedConversation,
      message: 'Conversation created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
} 
 
 
 
 
 