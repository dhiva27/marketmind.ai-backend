// src/config/firebaseAdmin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

let adminAuth: Auth;

if (!getApps().length) {
  let app: App;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      app = initializeApp({ credential: cert(serviceAccount) });
      console.log('✅ Firebase Admin initialized via service account JSON');
    } catch (e) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'marketmindai-73278',
      });
    }
  } else {
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'marketmindai-73278',
    });
    console.log('✅ Firebase Admin initialized with project ID only');
  }

  adminAuth = getAuth(app);
} else {
  adminAuth = getAuth();
}

export { adminAuth };
