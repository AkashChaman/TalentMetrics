// src/pages/AuthPage.jsx — TalentMetrics Auth Page
// Real Firebase Email/Password Authentication
// Two tabs: Sign In · Create Account
// Role picker: Candidate | Recruiter

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';

// Map Firebase error codes → human-readable messages
const FB_ERRORS = {
  'auth/email-already-in-use':  'This email is already registered. Please sign in instead.',
  'auth/invalid-email':          'Invalid email address format.',
  'auth/weak-password':          'Password must be at least 6 characters.',
  'auth/user-not-found':         'No account found with this email. Please register first.',
  'auth/wrong-password':         'Incorrect password. Please try again.',
  'auth/invalid-credential':     'Invalid email or password. Please check and retry.',
  'auth/too-many-requests':      'Too many failed attempts. Please wait before trying again.',
  'auth/network-request-failed': 'Network error. Check your internet connection.',
};

function getErrorMsg(err) {
  return FB_ERRORS[err?.code] || err?.error || err?.message || 'Something went wrong. Please try again.';
}

export default function AuthPage() {
  const [tab,     setTab]    = useState('login');
  const [role,    setRole]   = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState('');

  // Login fields
  const [lEmail, setLEmail] = useState('');
  const [lPass,  setLPass]  = useState('');

  // Register fields
  const [rName,  setRName]  = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPass,  setRPass]  = useState('');

  const { signIn, signUp } = useAuth();
  const navigate           = useNavigate();

  // ── LOGIN ────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    if (!lEmail.trim() || !lPass) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const user = await signIn(lEmail.trim(), lPass);
      toast(`Welcome back, ${user.name?.split(' ')[0]}! 👋`, 'success');
      navigate(user.role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }

  // ── REGISTER ─────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    if (!rName.trim() || !rEmail.trim() || !rPass) { setError('Please fill in all fields.'); return; }
    if (rPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await signUp(rName.trim(), rEmail.trim(), rPass, role);
      toast(`Account created! Welcome to TalentMetrics, ${rName.split(' ')[0]}! 🎉`, 'success');
      navigate(role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t) { setTab(t); setError(''); }

  return (
    <div className="auth-page">

      {/* ── LEFT PANEL ────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-geo">
          <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(22,163,74,.12),transparent 65%)' }} />
          <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle,rgba(212,160,23,.10),transparent 65%)' }} />
        </div>
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <div className="nav-logo-mark" style={{ width:'44px', height:'44px', fontSize:'20px' }}>T</div>
            <div className="nav-logo-name" style={{ color:'#fff', fontSize:'24px' }}>
              Talent<em>Metrics</em>
            </div>
          </div>
          <div className="auth-quote">
            "The right hire starts<br />with the <em>right screen.</em>"
          </div>
          <div className="auth-quote-sub">
            TalentMetrics gives every candidate a fair, data-driven first-round interview —
            and every recruiter the clarity to act fast. Powered by real Firebase Authentication.
          </div>
          <div className="auth-stats">
            <div>
              <div className="auth-stat-val">94%</div>
              <div className="auth-stat-lbl">Screening time saved</div>
            </div>
            <div>
              <div className="auth-stat-val">3×</div>
              <div className="auth-stat-lbl">Faster time-to-hire</div>
            </div>
            <div>
              <div className="auth-stat-val">500+</div>
              <div className="auth-stat-lbl">Companies using it</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-box">

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login'    ? 'on' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
            <button className={`auth-tab ${tab === 'register' ? 'on' : ''}`} onClick={() => switchTab('register')}>Create Account</button>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ background:'var(--red-pale)', border:'1px solid var(--red)', borderRadius:'var(--r-sm)', padding:'12px 16px', marginBottom:'16px', fontSize:'13.5px', color:'var(--red)', fontWeight:'500', display:'flex', gap:'8px', alignItems:'flex-start' }}>
              <span style={{ flexShrink:0 }}>⚠</span><span>{error}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="auth-form-title">Welcome back</div>
              <div className="auth-form-sub">Sign in to your TalentMetrics account</div>
              <div className="auth-form-fields">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@company.com"
                    value={lEmail}
                    onChange={e => setLEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={lPass}
                    onChange={e => setLPass(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <div
                    className="form-hint"
                    style={{ textAlign:'right', cursor:'pointer', color:'var(--emerald)' }}
                    onClick={() => navigate('/auth?reset=true')}
                  >
                    Forgot password?
                  </div>
                </div>
                <button className="btn btn-forest btn-lg" style={{ width:'100%' }} type="submit" disabled={loading}>
                  {loading ? '⏳ Signing in…' : 'Sign In →'}
                </button>
                <div style={{ textAlign:'center', fontSize:'12px', color:'var(--slate-4)', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  🔐 Secured by Firebase Authentication
                </div>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="auth-form-title">Create your account</div>
              <div className="auth-form-sub">Join TalentMetrics — it's free</div>
              <div className="auth-form-fields">

                {/* Role picker */}
                <div className="form-group">
                  <label className="form-label">I am a…</label>
                  <div className="role-picker">
                    <div
                      className={`role-opt ${role === 'candidate' ? 'on' : ''}`}
                      onClick={() => setRole('candidate')}
                    >
                      <div className="role-opt-icon">👤</div>
                      <div className="role-opt-name">Candidate</div>
                      <div style={{ fontSize:'11px', color:'var(--slate-6)', marginTop:'3px' }}>Taking interviews</div>
                    </div>
                    <div
                      className={`role-opt ${role === 'recruiter' ? 'on' : ''}`}
                      onClick={() => setRole('recruiter')}
                    >
                      <div className="role-opt-icon">🏢</div>
                      <div className="role-opt-name">Recruiter</div>
                      <div style={{ fontSize:'11px', color:'var(--slate-6)', marginTop:'3px' }}>Reviewing candidates</div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Your full name"
                    value={rName}
                    onChange={e => setRName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={rEmail}
                    onChange={e => setREmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={rPass}
                    onChange={e => setRPass(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button className="btn btn-forest btn-lg" style={{ width:'100%' }} type="submit" disabled={loading}>
                  {loading ? '⏳ Creating account…' : 'Create Account →'}
                </button>
                <div style={{ textAlign:'center', fontSize:'12px', color:'var(--slate-4)', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  🔐 Your data is stored securely in Firebase
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
