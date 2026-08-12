import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatSession extends Document {
  userId: Types.ObjectId;
  chatId: string;
  title: string;
  lastMessageSnippet?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: 'New Conversation' },
    lastMessageSnippet: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
