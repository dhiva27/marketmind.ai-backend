// src/routes/chat.routes.ts
import { Router } from 'express';
import { chat, getChatHistory, getChatMessages, renameChat, deleteChat } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All chat endpoints require authentication
router.post('/', authMiddleware, chat);
router.get('/history', authMiddleware, getChatHistory);
router.get('/:chatId', authMiddleware, getChatMessages);
router.put('/:chatId/title', authMiddleware, renameChat);
router.delete('/:chatId', authMiddleware, deleteChat);

export default router;

