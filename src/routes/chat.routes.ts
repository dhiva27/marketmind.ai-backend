// src/routes/chat.routes.ts
import { Router } from 'express';
import { chat } from '@/controllers/chat.controller';
import { authMiddleware } from '@/middlewares/authMiddleware';

const router = Router();

// All chat endpoints require authentication
router.post('/', authMiddleware, chat);

export default router;
