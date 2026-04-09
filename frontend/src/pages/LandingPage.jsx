// src/pages/LandingPage.jsx — TalentMetrics Landing Page
// Hero · Features · How It Works · CTA · Footer

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate            = useNavigate();
  const { currentUser, isRecruiter } = useAuth();

  function handleGetStarted() {
    if (currentUser) navigate(isRecruiter ? '/recruiter' : '/dashboard');
    else navigate('/auth');
  }

  const features = [
    { icon: '🤖', bg: '#dcfce7', title: 'AI-Powered Evaluation',   desc: 'Every answer scored in real-time. MCQ precision + open-answer depth analysis. No human bias — just clean data.' },
    { icon: '⚡', bg: '#fef9e7', title: 'Instant Auto-Ranking',    desc: 'Candidates ranked the moment they submit. Live leaderboard updates. Recruiters see top performers immediately.' },
    { icon: '🎯', bg: '#dbeafe', title: 'Role-Specific Questions',  desc: 'Curated technical + behavioural questions for each role. MCQ, written, and scenario-based formats.' },
    { icon: '📊', bg: '#ede9fe', title: 'Recruiter Analytics',     desc: 'Score distributions, completion rates, funnel metrics, and side-by-side candidate comparison.' },
    { icon: '🔐', bg: '#fce7f3', title: 'Firebase Authentication', desc: 'Real Firebase Auth with Email & Password. Role-based workspaces — candidates and recruiters fully separated.' },
    { icon: '📱', bg: '#dcfce7', title: 'Fully Responsive',        desc: 'Candidates can interview on any device. Pixel-perfect on mobile, tablet, and desktop.' },
  ];

  const steps = [
    ['01', 'Candidate Registers',  'Signs up with Firebase Auth, picks a role, and enters the interview queue.'],
    ['02', 'AI Interview Runs',    'Timed questions — MCQ and written — served securely from the Express backend.'],
    ['03', 'AI Scores & Ranks',    'Every answer evaluated, scored, broken down by skill, and ranked live.'],
    ['04', 'Recruiter Decides',    'Views leaderboard, filters by score, and shortlists top candidates in one click.'],
  ];

  return (
    <div>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero">
        <nav className="hero-nav">
          <div className="nav-logo">
            <div className="nav-logo-mark">T</div>
            <div className="nav-logo-name">Talent<em>Metrics</em></div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost-white btn-sm" onClick={() => navigate('/auth')}>Log In</button>
            <button className="btn btn-gold btn-sm"        onClick={() => navigate('/auth')}>Get Started →</button>
          </div>
        </nav>

        {/* Background geometry */}
        <div className="hero-geo">
          <div className="geo-grid" />
          <div className="geo-circle" style={{ width: '600px', height: '600px', top: '-150px', left: '-100px' }} />
          <div className="geo-circle" style={{ width: '400px', height: '400px', bottom: '0', right: '20%' }} />
          <div className="geo-glow" />
        </div>

        <div className="hero-body">
          {/* Left — copy */}
          <div className="hero-left">
            <div className="hero-eyebrow">✦ AI-Powered Hiring Platform</div>
            <h1 className="hero-title">
              Automating<br />
              First-Round <em>Interviews</em><br />
              with AI — <span className="hl">Screening,</span><br />
              <span className="hl">Scoring, and Ranking</span><br />
              Candidates Efficiently.
            </h1>
            <p className="hero-sub">
              TalentMetrics automates your entire first-round screening process — from candidate
              registration to AI evaluation, real-time leaderboards, and recruiter shortlisting.
              Powered by Firebase Authentication and a Node.js + Express backend.
            </p>
            <div className="hero-actions">
              <button className="btn btn-gold btn-lg" onClick={handleGetStarted}>
                Get Started Free →
              </button>
              <button
                className="btn btn-ghost-white btn-lg"
                onClick={() => document.getElementById('features-sec')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How It Works
              </button>
            </div>
            <div className="hero-proof">
              {[['94%','Time Saved'],['12K+','Screened'],['3×','Faster Hiring'],['99%','Accuracy']].map(([num, lbl], i) => (
                <React.Fragment key={lbl}>
                  {i > 0 && <div className="hero-proof-divider" />}
                  <div>
                    <div className="proof-stat-num">{num}</div>
                    <div className="proof-stat-lbl">{lbl}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right — floating preview card */}
          <div className="hero-right">
            <div className="hero-card">
              <div className="hc-header">
                <div className="hc-title">Live Leaderboard</div>
                <div className="hc-badge">● AI Scoring</div>
              </div>
              <div className="hc-score-row">
                <div className="hc-score-num">87</div>
                <div className="hc-score-info">
                  <div className="hc-score-label">Top Candidate Score</div>
                  <div className="hc-score-bar">
                    <div className="hc-score-fill" style={{ width: '87%' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', marginTop: '6px' }}>
                    Out of 100 pts · Ranked #1
                  </div>
                </div>
              </div>
              <div className="hc-candidates">
                <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: '8px' }}>
                  Recent Candidates
                </div>
                {[
                  ['A', 'Arjun Sharma', '87%', '#22c55e', '#0a3d2b'],
                  ['P', 'Priya Nair',   '81%', '#22c55e', '#1e40af'],
                  ['R', 'Rahul Verma',  '74%', '#f0c040', '#7c3aed'],
                  ['S', 'Sneha Patel',  '66%', '#f59e0b', '#b45309'],
                ].map(([init, name, score, col, bg]) => (
                  <div className="hc-cand" key={name}>
                    <div className="hc-cand-av" style={{ background: bg }}>{init}</div>
                    <span className="hc-cand-name">{name}</span>
                    <span className="hc-cand-score" style={{ color: col }}>{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="features-section" id="features-sec">
        <div className="features-header">
          <div className="eyebrow" style={{ marginBottom: '14px' }}>Platform Capabilities</div>
          <h2 className="display-lg">Everything You Need<br />to Hire <em>Brilliantly</em></h2>
          <p className="body-lg" style={{ color: 'var(--slate-6)', marginTop: '16px' }}>
            A complete first-round interview automation suite for modern hiring teams.
          </p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div className="feat-card" key={f.title}>
              <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="hiw-section">
        <div className="hiw-header">
          <div className="eyebrow" style={{ color: 'var(--gold-light)', marginBottom: '14px' }}>Simple 4-Step Process</div>
          <h2 className="display-lg" style={{ color: 'var(--white)' }}>
            From Application<br />to <em>Decision</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.45)', marginTop: '16px', fontSize: '16px', lineHeight: '1.7' }}>
            From job posting to shortlisted candidates in hours, not weeks.
          </p>
        </div>
        <div className="hiw-steps">
          {steps.map(([num, title, desc]) => (
            <div className="hiw-step" key={num}>
              <div className="hiw-num">{num}</div>
              <div className="hiw-step-title">{title}</div>
              <div className="hiw-step-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="cta-section">
        <h2 className="cta-title">
          Ready to Automate Your<br /><em>First-Round Interviews?</em>
        </h2>
        <p className="cta-sub">
          Join 500+ companies saving time and making better hires with TalentMetrics.
        </p>
        <button className="btn btn-gold btn-lg" onClick={handleGetStarted}>
          Get Started — It's Free →
        </button>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="footer">
        <div className="footer-logo-name">Talent<em>Metrics</em></div>
        <div className="footer-copy">© 2025 TalentMetrics Inc. All rights reserved.</div>
        <div className="footer-links">
          <span className="footer-link">Privacy Policy</span>
          <span className="footer-link">Terms of Service</span>
          <span className="footer-link">Contact</span>
        </div>
      </footer>
    </div>
  );
}
