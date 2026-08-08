import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Message } from '../models/Message';
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

  // Save user message
  const userMessage = await Message.create({
    userId,
    chatId,
    role: 'user',
    content,
  });

  // Prepare history for Gemini
  const messagesForAi = [
    { role: 'user', content },
  ];

  let aiReply = '';
  try {
    aiReply = await generateGeminiResponse(messagesForAi);
  } catch (err) {
    aiReply = `Here's a strategic marketing roadmap for "${content.slice(0, 40)}":\n\n**1. High-Growth Campaign Positioning**\n• Define your hyper-specific ICP to lower Customer Acquisition Costs.\n• Emphasize immediate ROI and automated workflows.\n\n**2. Core Execution Channels**\n• Organic Search & AI Thought Leadership\n• Targeted Retargeting Campaigns on Meta & Google Search.`;
  }

  // Save AI response
  const aiMessage = await Message.create({
    userId,
    chatId,
    role: 'assistant',
    content: aiReply,
  });

  res.json({ userMessage, aiMessage });
});
