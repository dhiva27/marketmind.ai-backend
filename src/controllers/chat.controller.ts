// src/controllers/chat.controller.ts
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { generateChatResponse } from '../services/openai.service';

// @desc    Post a new user message and get AI response
// @route   POST /api/chat
// @access  Private (JWT)
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId; // set by authMiddleware
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    res.status(400);
    throw new Error('chatId and content are required');
  }

  // Save user message
  const userMessage = await Message.create({
    userId,
    chatId,
    role: 'user',
    content,
  });

  // Prepare history for OpenAI (you could fetch previous messages, simplified here)
  const messagesForAi = [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content },
  ];

  const aiReply = await generateChatResponse(messagesForAi);

  // Save AI response
  const aiMessage = await Message.create({
    userId,
    chatId,
    role: 'assistant',
    content: aiReply,
  });

  res.json({ userMessage, aiMessage });
});
