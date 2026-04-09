/**
 * auth.js — Authentication Middleware
 * TalentMetrics Backend
 *
 * Verifies Firebase ID tokens on every protected route.
 * Frontend sends: Authorization: Bearer <firebase-id-token>
 */

const { getAuth } = require('../config/firebase');

/**
 * verifyToken — Required auth guard
 * Returns 401 if token is missing or invalid
 */
async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or malformed Authorization header. Expected: Bearer <token>',
      });
    }

    const idToken = header.split('Bearer ')[1];
    const decoded = await getAuth().verifyIdToken(idToken);

    // Attach decoded user to request object
    req.user = {
      uid:   decoded.uid,
      email: decoded.email,
      role:  decoded.role || 'candidate', // custom claim set at register
    };

    next();
  } catch (err) {
    console.error('❌  Token verification failed:', err.message);
    return res.status(401).json({
      error: 'Invalid or expired token. Please sign in again.',
    });
  }
}

/**
 * requireRole — Role-based access guard (use AFTER verifyToken)
 * Usage: router.get('/admin-only', verifyToken, requireRole('recruiter'), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
