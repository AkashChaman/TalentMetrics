// src/utils/firebase.js — Firebase Client SDK Initialization
// TalentMetrics Frontend
//
// SETUP:
// 1. Firebase Console → Your Project → Project Settings → Your Apps → Add Web App
// 2. Copy the firebaseConfig values into your .env file

import { initializeApp }  from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
