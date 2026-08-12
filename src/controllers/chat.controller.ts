import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { ChatSession } from '../models/ChatSession';
import { generateGeminiResponse } from '../services/gemini.service';

// @desc    Post a new user message and get AI response using Google Gemini API
// @route   POST /api/chat
// @access  Private (JWT)
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    res.status(400);
    throw new Error('chatId and content are required');
  }

  // Find or create chat session record
  let chatSession = await ChatSession.findOne({ userId, chatId });
  const isNewSession = !chatSession;

  if (!chatSession) {
    const generatedTitle = content.length > 30 ? content.slice(0, 30) + '...' : content;
    chatSession = await ChatSession.create({
      userId,
      chatId,
      title: generatedTitle,
      lastMessageSnippet: content.slice(0, 60),
    });
  } else {
    chatSession.lastMessageSnippet = content.slice(0, 60);
    if (chatSession.title === 'New Conversation') {
      chatSession.title = content.length > 30 ? content.slice(0, 30) + '...' : content;
    }
    chatSession.updatedAt = new Date();
    await chatSession.save();
  }

  // Save user message in DB
  const userMessage = await Message.create({
    userId,
    chatId,
    role: 'user',
    content,
  });

  // Retrieve previous conversation messages for multi-turn Gemini context memory
  const previousMessages = await Message.find({ userId, chatId })
    .sort({ createdAt: 1 })
    .limit(16);

  const messagesForAi = previousMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let aiReply = '';
  try {
    aiReply = await generateGeminiResponse(messagesForAi);
  } catch (err) {
    console.error('Gemini API call failed, providing fallback:', err);
    aiReply = `Here is a strategic growth plan for "${content.slice(0, 40)}":\n\n**1. Market Positioning & Core Offer**\n• Define your Ideal Customer Profile (ICP) and unique value proposition.\n• Focus on solving high-friction pain points to drive conversions.\n\n**2. Core Acquisition Channels**\n• Organic content & AI-assisted SEO\n• Targeted retargeting ads and high-converting lead magnets.`;
  }

  // Save AI response in DB
  const aiMessage = await Message.create({
    userId,
    chatId,
    role: 'assistant',
    content: aiReply,
  });

  res.json({ userMessage, aiMessage, chatSession });
});

// @desc    Get all chat history sessions for logged-in user
// @route   GET /api/chat/history
// @access  Private (JWT)
export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });
  res.json(sessions);
});

// @desc    Get all messages for a specific chat conversation
// @route   GET /api/chat/:chatId
// @access  Private (JWT)
export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { chatId } = req.params;

  const messages = await Message.find({ userId, chatId }).sort({ createdAt: 1 });
  res.json(messages);
});

// @desc    Rename a chat conversation title
// @route   PUT /api/chat/:chatId/title
// @access  Private (JWT)
export const renameChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { chatId } = req.params;
  const { title } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const session = await ChatSession.findOneAndUpdate(
    { userId, chatId },
    { title },
    { new: true }
  );

  if (!session) {
    res.status(404);
    throw new Error('Chat session not found');
  }

  res.json(session);
});

// @desc    Delete a chat conversation and all its messages
// @route   DELETE /api/chat/:chatId
// @access  Private (JWT)
export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { chatId } = req.params;

  await ChatSession.deleteOne({ userId, chatId });
  await Message.deleteMany({ userId, chatId });

  res.json({ message: 'Chat conversation deleted successfully', chatId });
});

