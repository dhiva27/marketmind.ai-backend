// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebaseAdmin';

export interface AuthRequest extends Request {
  userId?: string;       // Firebase UID
  userEmail?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(token);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    next();
  } catch (err: any) {
    console.warn('[authMiddleware] Token verification failed:', err?.message || err);
    return res.status(401).json({ message: 'Invalid or expired token. Please sign in again.' });
  }
};
