import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  userId: Types.ObjectId;
  chatId: string; // optional grouping identifier for a conversation
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chatId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], default: 'user' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
