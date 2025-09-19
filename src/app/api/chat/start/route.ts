import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dbConnect } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Conversation from '../../../../models/Conversation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { receiverId } = body;
    const senderId = (session.user as any).id;

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate('participants', 'name email role company');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [senderId, receiverId],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await conversation.save();
      
      // Populate participants
      await conversation.populate('participants', 'name email role company');
    }

    return NextResponse.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 