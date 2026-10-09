import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import env from './env';

let firebaseAdmin: typeof admin | null = null;

if (!env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT_PATH not set — Admin SDK not initialized');
} else {
  const serviceAccountPath = path.isAbsolute(env.FIREBASE_SERVICE_ACCOUNT_PATH)
    ? env.FIREBASE_SERVICE_ACCOUNT_PATH
    : path.resolve(__dirname, '../..', env.FIREBASE_SERVICE_ACCOUNT_PATH);

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn(`[Firebase] Service account file not found at ${serviceAccountPath} — Admin SDK not initialized`);
  } else {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('[Firebase] Admin SDK initialized');
    firebaseAdmin = admin;
  }
}

export = firebaseAdmin;
