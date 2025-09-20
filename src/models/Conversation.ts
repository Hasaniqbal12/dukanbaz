import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  participantDetails: {
    userId: mongoose.Types.ObjectId;
    unreadCount: number;
    lastReadAt?: Date;
    isArchived: boolean;
    isMuted: boolean;
  }[];
  lastMessage?: mongoose.Types.ObjectId;
  conversationType: 'direct' | 'group';
  title?: string; // For group conversations
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  participantDetails: [{
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    unreadCount: { 
      type: Number, 
      default: 0 
    },
    lastReadAt: { 
      type: Date 
    },
    isArchived: { 
      type: Boolean, 
      default: false 
    },
    isMuted: { 
      type: Boolean, 
      default: false 
    }
  }],
  lastMessage: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  conversationType: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  title: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ 'participantDetails.userId': 1 });
ConversationSchema.index({ isActive: 1 });

// Method to add participant
ConversationSchema.methods.addParticipant = function(userId: mongoose.Types.ObjectId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.participantDetails.push({
      userId,
      unreadCount: 0,
      isArchived: false,
      isMuted: false
    });
  }
};

// Method to get unread count for a user
ConversationSchema.methods.getUnreadCount = function(userId: mongoose.Types.ObjectId) {
  const participant = this.participantDetails.find(
    (p: { userId: mongoose.Types.ObjectId; unreadCount: number }) => p.userId.toString() === userId.toString()
  );
  return participant ? participant.unreadCount : 0;
};

// Method to mark as read for a user
ConversationSchema.methods.markAsRead = function(userId: mongoose.Types.ObjectId) {
  const participant = this.participantDetails.find(
    (p: { userId: mongoose.Types.ObjectId; unreadCount: number; lastReadAt: Date }) => p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.unreadCount = 0;
    participant.lastReadAt = new Date();
  }
};

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema); 