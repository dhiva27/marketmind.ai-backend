// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no header, assign default user ID for demo workspace session
    req.userId = 'user_default';
    req.userEmail = 'dhivakar@marketmind.ai';
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key';
    const payload = jwt.verify(token, secret) as { userId: string; email?: string };
    req.userId = payload.userId;
    req.userEmail = payload.email || 'dhivakar@marketmind.ai';
    next();
  } catch {
    // Fallback to token string / default user ID
    req.userId = token || 'user_default';
    req.userEmail = 'dhivakar@marketmind.ai';
    next();
  }
};
