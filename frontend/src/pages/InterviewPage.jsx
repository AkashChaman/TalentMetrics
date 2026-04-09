// src/pages/InterviewPage.jsx — TalentMetrics AI Interview Page
// Calls /api/interview/start-interview → gets questions
// Calls /api/interview/submit-answers → gets scored result
// Features: per-question 2-min timer, MCQ, text answers, progress dots, exit modal

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../utils/api';
import { toast }        from '../components/Toast';
import Modal            from '../components/Modal';
import Loader           from '../components/Loader';

const JOB_TITLES = {
  1: 'Software Engineer',
  2: 'Data Analyst',
  3: 'Product Manager',
  4: 'UX Designer',
  5: 'DevOps Engineer',
  6: 'Marketing Analyst',
};

export default function InterviewPage() {
  const { jobId }   = useParams();
  const navigate    = useNavigate();
  const timerRef    = useRef(null);
  const wallRef     = useRef(null); // start time for total elapsed

  const [session,    setSession]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ,   setCurrentQ]   = useState(0);
  const [answers,    setAnswers]     = useState({});
  const [timeLeft,   setTimeLeft]   = useState(120);
  const [exitModal,  setExitModal]  = useState(false);

  // ── 1. Start interview session on mount ─────────────────
  useEffect(() => {
    async function startSession() {
      try {
        const data = await interviewAPI.start({
          jobId:    Number(jobId),
          jobTitle: JOB_TITLES[jobId] || 'General Interview',
        });
        setSession(data);
        wallRef.current = Date.now();
      } catch (err) {
        toast(err?.error || 'Could not start interview. You may have already completed it.', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    startSession();
    return () => clearInterval(timerRef.current);
  }, [jobId, navigate]);

  // ── 2. Per-question countdown timer ─────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(120);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast('⏰ Time up! Moving to next question.', 'info');
          setCurrentQ(cq => {
            const qs = session?.questions || [];
            if (cq < qs.length - 1) return cq + 1;
            return cq;
          });
          return 120; // reset display
        }
        return prev - 1;
      });
    }, 1000);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [session, currentQ, startTimer]);

  // ── Helpers ──────────────────────────────────────────────
  function pickMCQ(qId, idx) {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  }

  function saveText(qId, val) {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  }

  function goNext() {
    const qs = session?.questions || [];
    if (currentQ < qs.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      submitInterview();
    }
  }

  function goPrev() {
    if (currentQ > 0) setCurrentQ(q => q - 1);
  }

  function skipQ() {
    toast('Question skipped.', 'info');
    goNext();
  }

  // ── Submit ───────────────────────────────────────────────
  async function submitInterview() {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const elapsed = Math.round((Date.now() - (wallRef.current || Date.now())) / 1000);
      const res = await interviewAPI.submit({
        sessionId: session.sessionId,
        jobId:     Number(jobId),
        answers,
        timeTaken: elapsed,
      });
      toast('🎉 Interview submitted! AI is calculating your score…', 'success');
      setTimeout(() => navigate(`/results/${res.resultId}`), 900);
    } catch (err) {
      if (err?.error?.includes('already submitted')) {
        const target = err.resultId ? `/results/${err.resultId}` : '/dashboard';
        toast('Interview already submitted. Redirecting to your results…', 'info');
        navigate(target);
        return;
      }
      toast(err?.error || 'Submission failed. Please try again.', 'error');
      setSubmitting(false);
    }
  }

  function doExit() {
    clearInterval(timerRef.current);
    setExitModal(false);
    navigate('/dashboard');
    toast('Interview exited. Your progress was not saved.', 'info');
  }

  // ── Derived display values ───────────────────────────────
  if (loading)    return <Loader text="Starting your AI interview…" />;
  if (submitting) return <Loader text="AI is evaluating your answers…" />;
  if (!session)   return null;

  const qs          = session.questions || [];
  const q           = qs[currentQ];
  const total       = qs.length;
  const answeredCnt = Object.keys(answers).length;
  const pct         = Math.round((answeredCnt / total) * 100);
  const mins        = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs        = String(timeLeft % 60).padStart(2, '0');
  const timerCls    = timeLeft <= 10 ? 'iv-timer-val danger' : timeLeft <= 30 ? 'iv-timer-val warn' : 'iv-timer-val';

  return (
    <div style={{ paddingTop:'72px', background:'var(--cream)', minHeight:'100vh' }}>
      <div className="iv-layout">

        {/* ── Top Bar ── */}
        <div className="iv-topbar">
          <div>
            <div className="iv-role">{session.jobTitle}</div>
            <div className="iv-meta">
              Question <strong>{currentQ + 1}</strong> of <strong>{total}</strong>
              {' '}· TalentMetrics AI Screen
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div className="iv-timer">
              <span className="iv-timer-icon">⏱</span>
              <span className={timerCls}>{mins}:{secs}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setExitModal(true)}>Exit</button>
          </div>
        </div>

        {/* ── Progress Bar & Dots ── */}
        <div className="iv-progress-bar">
          <div className="iv-prog-top">
            <span className="iv-prog-label">Progress</span>
            <span className="iv-prog-pct">{pct}% answered</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width:`${pct}%` }} />
          </div>
          <div className="iv-dots">
            {qs.map((qi, i) => {
              let cls = 'iv-dot';
              if (i === currentQ)               cls += ' cur';
              else if (answers[qi.id] !== undefined) cls += ' done';
              return (
                <div
                  key={i}
                  className={cls}
                  title={`Q${i + 1}`}
                  onClick={() => setCurrentQ(i)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Question Card ── */}
        {q && (
          <div className="q-card">
            <div className="q-type-label">
              {q.type === 'mcq' ? '● Multiple Choice Question' : '✍ Written Response Question'}
            </div>
            <div className="q-text">{q.text}</div>

            {/* MCQ options */}
            {q.type === 'mcq' && q.options && (
              <div className="mcq-opts">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <div
                      key={i}
                      className={`mcq-opt ${selected ? 'sel' : ''}`}
                      onClick={() => pickMCQ(q.id, i)}
                    >
                      <div className="opt-alpha">{['A','B','C','D'][i]}</div>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Text answer */}
            {q.type === 'text' && (
              <div>
                <textarea
                  className="form-input"
                  style={{ minHeight:'160px', marginTop:'4px' }}
                  placeholder="Type your detailed answer here. Aim for at least 50 words for full marks…"
                  value={answers[q.id] || ''}
                  onChange={e => saveText(q.id, e.target.value)}
                />
                <div className="char-count">
                  {(answers[q.id] || '').trim().split(/\s+/).filter(Boolean).length} words
                  · {(answers[q.id] || '').length} characters
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="iv-nav">
          <button className="btn btn-ghost" onClick={goPrev} disabled={currentQ === 0}>
            ← Previous
          </button>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn btn-ghost" onClick={skipQ}>Skip</button>
            <button className="btn btn-forest" onClick={goNext}>
              {currentQ === total - 1 ? 'Submit Interview ✓' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Exit Modal ── */}
      <Modal open={exitModal} onClose={() => setExitModal(false)} title="⚠️ Exit Interview?">
        <p style={{ fontSize:'15px', color:'var(--slate-6)', marginBottom:'24px', lineHeight:'1.75' }}>
          Are you sure you want to exit? Your progress will be <strong>lost</strong> and
          this attempt will be marked as incomplete. You can retry the interview later.
        </p>
        <div style={{ display:'flex', gap:'12px' }}>
          <button className="btn btn-danger" onClick={doExit}>Yes, Exit Interview</button>
          <button className="btn btn-ghost"  onClick={() => setExitModal(false)}>Continue Interviewing</button>
        </div>
      </Modal>
    </div>
  );
}
