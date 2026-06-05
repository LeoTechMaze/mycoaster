const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const env = require('./env');

if (!env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT_PATH not set — Admin SDK not initialized');
  module.exports = null;
} else {
  const serviceAccountPath = path.isAbsolute(env.FIREBASE_SERVICE_ACCOUNT_PATH)
    ? env.FIREBASE_SERVICE_ACCOUNT_PATH
    : path.resolve(__dirname, '../../..', env.FIREBASE_SERVICE_ACCOUNT_PATH);

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn(`[Firebase] Service account file not found at ${serviceAccountPath} — Admin SDK not initialized`);
    module.exports = null;
  } else {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('[Firebase] Admin SDK initialized');
    module.exports = admin;
  }
}
