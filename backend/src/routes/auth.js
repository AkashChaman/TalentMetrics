/**
 * auth.js — Authentication Routes
 * TalentMetrics Backend
 *
 * POST /api/auth/register  — creates Firestore profile + sets role claim
 * POST /api/auth/login     — verifies token + returns Firestore profile
 * GET  /api/auth/me        — returns current user's profile
 */

const express            = require('express');
const router             = express.Router();
const { getDB, getAuth, admin } = require('../config/firebase');
const { verifyToken }    = require('../middleware/auth');

/* ─────────────────────────────────────────────────────
   POST /api/auth/register
   Called AFTER Firebase client-side signup.
   Body: { uid, name, email, role }
   Sets custom claim + writes Firestore user doc
───────────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { uid, name, email, role } = req.body;

    if (!uid || !name || !email || !role) {
      return res.status(400).json({ error: 'uid, name, email, and role are all required.' });
    }

    if (!['candidate', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "candidate" or "recruiter".' });
    }

    const db = getDB();

    // Prevent duplicate registration
    const existing = await db.collection('users').doc(uid).get();
    if (existing.exists) {
      return res.status(409).json({ error: 'User profile already exists.' });
    }

    // Set Firebase custom claim so role is embedded in the ID token
    await getAuth().setCustomUserClaims(uid, { role });

    // Write user profile to Firestore
    const userDoc = {
      uid,
      name:                name.trim(),
      email:               email.toLowerCase().trim(),
      role,
      createdAt:           admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:           admin.firestore.FieldValue.serverTimestamp(),
      completedInterviews: [],
    };

    await db.collection('users').doc(uid).set(userDoc);

    console.log(`✅  Registered: ${email} as ${role}`);
    return res.status(201).json({
      message: 'User registered successfully.',
      user:    { uid, name: userDoc.name, email: userDoc.email, role },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

/* ─────────────────────────────────────────────────────
   POST /api/auth/login
   Called after client-side Firebase signIn.
   Header: Authorization: Bearer <idToken>
   Returns: enriched profile from Firestore
───────────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const db = getDB();

    // Find user by email
    const snapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const userDoc = snapshot.docs[0].data();

    return res.json({
      message: 'Login successful.',
      user: {
        uid: userDoc.uid,
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

/* ─────────────────────────────────────────────────────
   GET /api/auth/me
   Returns current user profile from Firestore
───────────────────────────────────────────────────── */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const doc = await getDB().collection('users').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'Profile not found.' });

    const d = doc.data();
    return res.json({
      uid:                 d.uid,
      name:                d.name,
      email:               d.email,
      role:                d.role,
      completedInterviews: d.completedInterviews || [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
