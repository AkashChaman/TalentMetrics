/**
 * index.js — TalentMetrics Express Server
 *
 * API Routes:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *   POST /api/interview/start-interview
 *   POST /api/interview/submit-answers
 *   GET  /api/interview/get-results/:resultId
 *   GET  /api/interview/get-ranking/:jobId
 *   GET  /api/interview/my-results
 *   GET  /api/interview/all-candidates
 *   GET  /api/health
 */

require('dotenv').config();

// Initialize Firebase Admin before any routes
require('./config/firebase');

const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes      = require('./routes/auth');
const interviewRoutes = require('./routes/interview');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://talent-metrics.vercel.app',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ].filter(Boolean),
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));

// ── BODY PARSING ──────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── RATE LIMITING ─────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      150,
  message:  { error: 'Too many requests, please try again later.' },
}));

// ── ROUTES ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TalentMetrics Backend Running',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/register, /api/auth/login, /api/auth/me',
      interview: '/api/interview/start-interview, /api/interview/submit-answers, /api/interview/get-results/:resultId, /api/interview/get-ranking/:jobId, /api/interview/my-results, /api/interview/all-candidates',
      health: '/api/health'
    }
  });
});

app.use('/api/auth',      authRoutes);
app.use('/auth',          authRoutes);   // Allow non-prefixed path for local frontend compatibility
app.use('/api/interview', interviewRoutes);
app.use('/interview',     interviewRoutes); // Allow non-prefixed path for local frontend compatibility

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'TalentMetrics API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── START ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║     TalentMetrics API Server         ║');
    console.log(`║     http://localhost:${PORT}           ║`);
    console.log('╚══════════════════════════════════════╝\n');
  });
}

module.exports = app;
