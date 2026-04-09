// src/context/AuthContext.js
// Real Firebase Authentication Context — TalentMetrics
// Provides: currentUser, userProfile, signUp, signIn, logOut, loading

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading,     setLoading]     = useState(true);

  // ── Sign Up (Firebase Auth + backend profile) ──────────
  async function signUp(name, email, password, role) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await authAPI.register({ uid: cred.user.uid, name, email, role });
    await cred.user.getIdToken(true); // force token refresh to pick up role claim
    return cred.user;
  }

  // ── Sign In ────────────────────────────────────────────
  async function signIn(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const data = await authAPI.login(cred.user.email);
    setUserProfile(data.user);
    return data.user;
  }

  // ── Sign Out ───────────────────────────────────────────
  async function logOut() {
    await signOut(auth);
    setUserProfile(null);
  }

  // ── Reset Password ─────────────────────────────────────
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // ── Listen for Firebase auth state changes ─────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await authAPI.me();
          setUserProfile(profile);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    logOut,
    resetPassword,
    isRecruiter: userProfile?.role === 'recruiter',
    isCandidate: userProfile?.role === 'candidate',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
