// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK (singleton)
let adminApp: App;
if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'marketmindai-eba97',
  });
} else {
  adminApp = getApps()[0];
}

const adminAuth = getAuth(adminApp);

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No auth header — allow as guest/default user for demo
    req.userId = 'user_default';
    req.userEmail = 'guest@marketmind.ai';
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email || 'unknown@marketmind.ai';
    next();
  } catch (error: any) {
    console.warn('[authMiddleware] Firebase token verification failed:', error.message);
    // Fallback: use a truncated token as user identifier (for development/testing)
    req.userId = token.substring(0, 28) || 'user_default';
    req.userEmail = 'unverified@marketmind.ai';
    next();
  }
};
