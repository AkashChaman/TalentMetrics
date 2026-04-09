/**
 * firebase.js — Firebase Admin SDK Initialization
 * TalentMetrics Backend
 *
 * SETUP GUIDE:
 * 1. Firebase Console → Project Settings → Service Accounts
 * 2. "Generate New Private Key" → download JSON file
 * 3. Copy each value into your .env file
 */

const admin = require('firebase-admin');
require('dotenv').config();

let db, auth;

function initFirebase() {
  if (admin.apps.length > 0) {
    db   = admin.firestore();
    auth = admin.auth();
    return;
  }

  const serviceAccount = {
    type:            'service_account',
    project_id:      process.env.FIREBASE_PROJECT_ID,
    private_key_id:  process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key:     (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email:    process.env.FIREBASE_CLIENT_EMAIL,
    client_id:       process.env.FIREBASE_CLIENT_ID,
    auth_uri:        'https://accounts.google.com/o/oauth2/auth',
    token_uri:       'https://oauth2.googleapis.com/token',
  };

  admin.initializeApp({
    credential:  admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  db   = admin.firestore();
  auth = admin.auth();

  console.log('✅  Firebase Admin SDK ready — Project:', process.env.FIREBASE_PROJECT_ID);
}

initFirebase();

module.exports = {
  admin,
  getDB:   () => db   || admin.firestore(),
  getAuth: () => auth || admin.auth(),
};
