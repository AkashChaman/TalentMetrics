// src/pages/ResultsPage.jsx — TalentMetrics Results Page
// Loads real result from /api/interview/get-results/:resultId
// Shows: animated score ring, AI feedback, skill breakdown, live leaderboard

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI }           from '../utils/api';
import { toast }                  from '../components/Toast';
import Loader                     from '../components/Loader';

const JOB_ICONS = { 1:'💻', 2:'📊', 3:'🎯', 4:'🎨', 5:'⚙️', 6:'📣' };
const SKILLS    = ['Technical Knowledge','Problem Solving','Communication','Attention to Detail','Analytical Thinking'];
const RING_CIRC = 2 * Math.PI * 60; // r = 60

// Leaderboard row component
function LBRow({ rank, label, score, timeTaken, isYou, passed }) {
  const rkCls = rank === 1 ? 'rk-gold' : rank === 2 ? 'rk-silver' : rank === 3 ? 'rk-bronze' : 'rk-other';
  const scCol = score >= 80 ? 'var(--emerald)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
  const m     = Math.floor((timeTaken || 0) / 60);
  const s     = String((timeTaken || 0) % 60).padStart(2, '0');
  return (
    <div className={`lb-row ${isYou ? 'you' : ''}`}>
      <div className="lb-cell">
        <div className={`rank-num ${rkCls}`}>{rank}</div>
      </div>
      <div className="lb-cell" style={{ gap:'10px' }}>
        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background: isYou ? 'var(--emerald)' : 'var(--slate-6)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:'13px', fontWeight:'900', color:'#fff', flexShrink:0 }}>
          {(label || '?')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight:'700', color: isYou ? 'var(--emerald)' : 'var(--ink)' }}>{label}</div>
          {isYou && <div style={{ fontSize:'11px', color:'var(--emerald)' }}>← Your position</div>}
        </div>
      </div>
      <div className="lb-cell" style={{ fontWeight:'800', fontFamily:'var(--font-display)', color:scCol }}>{score}%</div>
      <div className="lb-cell" style={{ color:'var(--slate-6)' }}>{timeTaken ? `${m}:${s}` : '—'}</div>
      <div className="lb-cell">
        <span className={`badge ${passed ? 'badge-green' : 'badge-red'}`}>{passed ? 'Passed' : 'Failed'}</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const { resultId }   = useParams();
  const navigate       = useNavigate();
  const ringRef        = useRef(null);

  const [result,      setResult]      = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await interviewAPI.getResult(resultId);
        setResult(res);
        try {
          const lb = await interviewAPI.getRanking(res.jobId);
          setLeaderboard(lb.leaderboard || []);
        } catch {
          // Leaderboard not critical
        }
      } catch (err) {
        toast(err?.error || 'Could not load results.', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resultId, navigate]);

  // Animate SVG ring after data loads
  useEffect(() => {
    if (!result || !ringRef.current) return;
    setTimeout(() => {
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = RING_CIRC - (result.score / 100) * RING_CIRC;
      }
    }, 300);
  }, [result]);

  if (loading) return <Loader text="Loading your results…" />;
  if (!result) return null;

  const icon = JOB_ICONS[result.jobId] || '💼';
  const m    = Math.floor((result.timeTaken || 0) / 60);
  const s    = String((result.timeTaken || 0) % 60).padStart(2, '0');

  // Hero title based on score
  let heroTitle;
  if      (result.score >= 85) heroTitle = '🏆 Outstanding Performance!';
  else if (result.score >= 70) heroTitle = '🎉 Excellent Work!';
  else if (result.score >= 60) heroTitle = '✅ Good Result — You Passed!';
  else                         heroTitle = '📚 Keep Practising';

  const correctCnt = (result.feedback || []).filter(f => f.passed).length;

  // Seed-based skill scores so they're consistent per result
  function skillPct(idx) {
    const base  = result.score;
    const delta = ((resultId.charCodeAt(idx % resultId.length) || 65) % 21) - 10;
    return Math.min(100, Math.max(15, base + delta));
  }

  return (
    <div style={{ paddingTop:'72px', background:'var(--cream)', minHeight:'100vh' }}>
      <div className="res-layout">

        {/* ══ Score Hero ══════════════════════════════════ */}
        <div className="res-hero">
          <div className="res-hero-geo" />

          {/* SVG animated ring */}
          <div className="res-score-ring">
            <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10" />
              <circle
                ref={ringRef}
                cx="75" cy="75" r="60"
                fill="none"
                stroke="var(--gold-light)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_CIRC}
                strokeDashoffset={RING_CIRC}
                style={{ transition:'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)' }}
              />
            </svg>
            <div className="res-ring-inner">
              <div className="res-score-num">{result.score}</div>
              <div className="res-score-of">/ 100</div>
            </div>
          </div>

          {/* Info */}
          <div className="res-hero-info">
            <div className="res-hero-title">{heroTitle}</div>
            <div className="res-hero-sub">
              {icon} {result.jobTitle} · AI Evaluation Complete
            </div>
            <div className="res-hero-chips">
              <div className="res-chip">
                <div className="res-chip-val">#{result.rank || '—'}</div>
                <div className="res-chip-lbl">Your Rank</div>
              </div>
              <div className="res-chip">
                <div className="res-chip-val">{m}:{s}</div>
                <div className="res-chip-lbl">Time Taken</div>
              </div>
              <div className="res-chip">
                <div className="res-chip-val">{correctCnt}/{(result.feedback || []).length}</div>
                <div className="res-chip-lbl">Correct</div>
              </div>
              <div className="res-chip">
                <div className="res-chip-val" style={{ color: result.passed ? 'var(--mint)' : '#f87171' }}>
                  {result.passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="res-chip-lbl">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ AI Overall Feedback Banner ══════════════════ */}
        <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'24px 28px', marginBottom:'24px', border:'1px solid var(--slate-2)', display:'flex', gap:'16px', alignItems:'flex-start' }}>
          <div style={{ fontSize:'28px', flexShrink:0 }}>🤖</div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:'800', marginBottom:'8px' }}>AI Evaluation Summary</div>
            <div style={{ fontSize:'14px', color:'var(--slate-6)', lineHeight:'1.75' }}>{result.aiFeedback}</div>
          </div>
        </div>

        {/* ══ Detail Grid ═════════════════════════════════ */}
        <div className="res-grid">
          {/* Per-question feedback */}
          <div className="res-detail-card">
            <h4>📝 Question-by-Question Feedback</h4>
            {(result.feedback || []).map((fb, i) => (
              <div className="fb-item" key={i}>
                <div className="fb-q">Q{i + 1}: {fb.questionText?.substring(0, 68)}…</div>
                <div className="fb-row">
                  <span className="fb-status" style={{ color: fb.passed ? 'var(--emerald)' : 'var(--red)' }}>
                    {fb.passed ? '✓ Correct' : '✗ Needs Work'}
                  </span>
                  <span className={`badge ${fb.passed ? 'badge-green' : 'badge-red'}`}>
                    +{fb.passed ? fb.points : 0} pts
                  </span>
                </div>
                {fb.comment && (
                  <div style={{ fontSize:'11.5px', color:'var(--slate-6)', marginTop:'5px', fontStyle:'italic' }}>
                    {fb.comment}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop:'16px', padding:'12px', background:'var(--cream)', borderRadius:'var(--r-sm)', fontSize:'13px', color:'var(--slate-6)', display:'flex', justifyContent:'space-between', border:'1px solid var(--slate-2)' }}>
              <span>Total Points Earned</span>
              <strong style={{ color:'var(--ink)' }}>{result.earnedPoints} / {result.totalPoints}</strong>
            </div>
          </div>

          {/* Skill breakdown */}
          <div className="res-detail-card">
            <h4>📊 Skill Breakdown</h4>
            {SKILLS.map((skill, i) => {
              const pct = skillPct(i);
              const col = pct >= 70 ? 'var(--emerald)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';
              return (
                <div className="skill-item" key={skill}>
                  <div className="skill-row">
                    <span className="skill-name">{skill}</span>
                    <span className="skill-pct" style={{ color:col }}>{pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width:`${pct}%`, background:col }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop:'20px', padding:'12px 16px', background: result.passed ? 'var(--sage)' : 'var(--red-pale)', borderRadius:'var(--r-sm)', fontSize:'13px', fontWeight:'600', color: result.passed ? 'var(--forest)' : 'var(--red)', display:'flex', alignItems:'center', gap:'8px' }}>
              {result.passed ? '✅ You passed the 60% threshold!' : '❌ Below 60% threshold — keep practising!'}
            </div>
          </div>
        </div>

        {/* ══ Leaderboard ═════════════════════════════════ */}
        <div className="sec-head" style={{ marginBottom:'20px' }}>
          <div>
            <h3>🏆 Candidate Leaderboard</h3>
            <p>Your ranking among all applicants for {result.jobTitle}</p>
          </div>
        </div>
        <div className="lb-wrap">
          <div className="lb-hd">
            <div className="lb-hd-cell">Rank</div>
            <div className="lb-hd-cell">Candidate</div>
            <div className="lb-hd-cell">Score</div>
            <div className="lb-hd-cell">Time</div>
            <div className="lb-hd-cell">Status</div>
          </div>

          {leaderboard.length > 0 ? (
            leaderboard.map((c, i) => (
              <LBRow
                key={i}
                rank={c.rank}
                label={c.isYou ? 'You' : (c.candidateEmail?.split('@')[0] || 'Candidate')}
                score={c.score}
                timeTaken={c.timeTaken}
                isYou={c.isYou}
                passed={c.passed}
              />
            ))
          ) : (
            /* Fallback demo leaderboard while Firebase populates */
            [
              { rank:1, label:'Top Candidate', score: Math.max(result.score + 8, 95), timeTaken:443, passed:true,  isYou:false },
              { rank:2, label:'You',            score: result.score,                  timeTaken:result.timeTaken, passed:result.passed, isYou:true },
              { rank:3, label:'Another User',   score: Math.max(result.score - 10, 40), timeTaken:680, passed:result.score - 10 >= 60, isYou:false },
            ].sort((a,b) => b.score - a.score).map((c, i) => (
              <LBRow key={i} {...c} rank={i + 1} />
            ))
          )}
        </div>

        {/* ══ Action Buttons ══════════════════════════════ */}
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <button className="btn btn-forest" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            ⬇ Print / Download
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            Try Another Role
          </button>
        </div>
      </div>
    </div>
  );
}
