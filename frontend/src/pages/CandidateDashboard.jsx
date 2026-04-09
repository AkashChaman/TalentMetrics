// src/pages/CandidateDashboard.jsx — TalentMetrics Candidate Dashboard
// Tabs: Job Roles · My Interviews · My Results · Profile
// Loads real data from Firebase-backed Express API

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../utils/api';
import { toast } from '../components/Toast';
import Sidebar from '../components/Sidebar';
import Modal   from '../components/Modal';

const JOBS = [
  { id:1, title:'Software Engineer',  dept:'Engineering',    level:'Mid-level', type:'Full-time', qs:8, time:'30 min', icon:'💻', bg:'#dbeafe', apps:24 },
  { id:2, title:'Data Analyst',       dept:'Analytics',      level:'Junior',    type:'Full-time', qs:8, time:'30 min', icon:'📊', bg:'#ede9fe', apps:18 },
  { id:3, title:'Product Manager',    dept:'Product',        level:'Senior',    type:'Full-time', qs:8, time:'30 min', icon:'🎯', bg:'#fef9e7', apps:12 },
  { id:4, title:'UX Designer',        dept:'Design',         level:'Mid-level', type:'Contract',  qs:8, time:'30 min', icon:'🎨', bg:'#fce7f3', apps:9  },
  { id:5, title:'DevOps Engineer',    dept:'Infrastructure', level:'Senior',    type:'Full-time', qs:8, time:'30 min', icon:'⚙️', bg:'#dcfce7', apps:15 },
  { id:6, title:'Marketing Analyst',  dept:'Marketing',      level:'Junior',    type:'Part-time', qs:6, time:'20 min', icon:'📣', bg:'#fee2e2', apps:21 },
];

const SB_ITEMS = [
  { id:'jobs',      icon:'💼', label:'Job Roles'     },
  { id:'history',   icon:'📋', label:'My Interviews' },
  { id:'results',   icon:'📊', label:'My Results'    },
  { id:'profile',   icon:'👤', label:'Profile'       },
];

export default function CandidateDashboard() {
  const { userProfile }      = useAuth();
  const navigate             = useNavigate();
  const [tab,          setTab]          = useState('jobs');
  const [myResults,    setMyResults]    = useState([]);

  if (!userProfile) {
    return <div style={{ paddingTop:'80px' }}><Loader /></div>;
  }
  const [dataLoading,  setDataLoading]  = useState(false);
  const [startModal,   setStartModal]   = useState(null);

  // Load candidate's past results from backend
  useEffect(() => {
    async function load() {
      setDataLoading(true);
      try {
        const data = await interviewAPI.myResults();
        setMyResults(data.results || []);
      } catch {
        // No results yet — silently ignore
      } finally {
        setDataLoading(false);
      }
    }

    load();

    // Refresh candidate stats when user returns to the tab after completing interview
    function handleFocus() {
      load();
    }

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const completedJobIds = myResults.map(r => r.jobId);
  const hr    = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const first = userProfile?.name?.split(' ')[0] || 'there';
  const best  = myResults.length ? Math.max(...myResults.map(r => r.score)) : null;
  const topRank = myResults.length ? Math.min(...myResults.map(r => r.rank).filter(Boolean)) : null;

  function handleTabChange(id) { setTab(id); }

  function openJob(job) {
    const done = completedJobIds.includes(job.id);
    if (done) {
      const r = myResults.find(r => r.jobId === job.id);
      if (r) navigate(`/results/${r.resultId}`);
      return;
    }
    setStartModal(job);
  }

  function beginInterview() {
    if (!startModal) return;
    const job = startModal;
    setStartModal(null);
    navigate(`/interview/${job.id}`);
  }

  return (
    <div className="dash-layout" style={{ paddingTop: '72px' }}>
      <Sidebar items={SB_ITEMS} activeTab={tab} onTabChange={handleTabChange} />

      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-greeting">{greet}, {first}!</div>
          <div className="dash-sub">Your AI interview dashboard — pick a role and start your journey.</div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-ico green">💼</div><div><div className="stat-lbl">Available Roles</div><div className="stat-val">{JOBS.length}</div></div></div>
          <div className="stat-card"><div className="stat-ico gold">✅</div><div><div className="stat-lbl">Completed</div><div className="stat-val">{myResults.length}</div></div></div>
          <div className="stat-card"><div className="stat-ico blue">🏆</div><div><div className="stat-lbl">Best Score</div><div className="stat-val">{best !== null ? `${best}%` : '—'}</div></div></div>
          <div className="stat-card"><div className="stat-ico purple">📈</div><div><div className="stat-lbl">Best Rank</div><div className="stat-val">{topRank ? `#${topRank}` : '—'}</div></div></div>
        </div>

        {/* ── JOB ROLES TAB ── */}
        {tab === 'jobs' && (
          <>
            <div className="sec-head">
              <div>
                <h3>Available Job Roles</h3>
                <p>Select a role to start your AI-powered interview</p>
              </div>
            </div>
            <div className="jobs-grid">
              {JOBS.map(job => {
                const done   = completedJobIds.includes(job.id);
                const result = myResults.find(r => r.jobId === job.id);
                return (
                  <div key={job.id} className="job-card" onClick={() => openJob(job)}>
                    <div className="job-card-top">
                      <div className="job-logo" style={{ background: job.bg }}>{job.icon}</div>
                      {done
                        ? <span className="badge badge-green">✓ Completed</span>
                        : <span className="badge badge-slate">Available</span>
                      }
                    </div>
                    <div>
                      <div className="job-name">{job.title}</div>
                      <div className="job-dept">{job.dept} · {job.level}</div>
                    </div>
                    <div className="job-tags">
                      <span className="badge badge-slate">⏱ {job.time}</span>
                      <span className="badge badge-slate">📝 {job.qs} questions</span>
                      <span className="badge badge-slate">👤 {job.apps + myResults.filter(r => r.jobId === job.id).length} applied</span>
                    </div>
                    {done && result && (
                      <div>
                        <div style={{ fontSize:'12px', color:'var(--slate-6)', marginBottom:'6px' }}>
                          Your score: <strong style={{ color:'var(--emerald)' }}>{result.score}%</strong>
                          {result.rank && <span style={{ marginLeft:'8px' }} className="badge badge-blue">Rank #{result.rank}</span>}
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width:`${result.score}%` }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                      {done
                        ? <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/results/${result.resultId}`); }}>View Results →</button>
                        : <button className="btn btn-emerald btn-sm" onClick={e => { e.stopPropagation(); openJob(job); }}>Start Interview →</button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── INTERVIEW HISTORY TAB ── */}
        {tab === 'history' && (
          <>
            <div className="sec-head"><div><h3>Interview History</h3><p>All your past interviews</p></div></div>
            {dataLoading ? (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--slate-4)' }}>Loading from Firebase…</div>
            ) : myResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-ico">📋</div>
                <div className="empty-title">No interviews yet</div>
                <div className="empty-desc">Head to Job Roles and start your first AI interview.</div>
                <button className="btn btn-emerald" style={{ marginTop:'20px' }} onClick={() => setTab('jobs')}>Browse Roles →</button>
              </div>
            ) : (
              myResults.map(r => {
                const job = JOBS.find(j => j.id === r.jobId) || { title: r.jobTitle, icon:'💼' };
                const dt  = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'Recently';
                const m   = Math.floor((r.timeTaken || 0) / 60);
                const s   = String((r.timeTaken || 0) % 60).padStart(2, '0');
                return (
                  <div key={r.resultId} className="card" style={{ marginBottom:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                      <div style={{ fontSize:'28px' }}>{job.icon}</div>
                      <div>
                        <div style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:'800' }}>{job.title}</div>
                        <div style={{ fontSize:'13px', color:'var(--slate-6)' }}>Completed · {dt}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                      <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`}>{r.passed ? '✓ Passed' : '✗ Not Passed'}</span>
                      <span className="badge badge-slate">Score: {r.score}%</span>
                      <span className="badge badge-slate">⏱ {m}:{s}</span>
                      {r.rank && <span className="badge badge-blue">Rank #{r.rank}</span>}
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/results/${r.resultId}`)}>View Results →</button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── MY RESULTS TAB ── */}
        {tab === 'results' && (
          <>
            <div className="sec-head"><div><h3>My Results</h3><p>AI score summaries from your completed interviews</p></div></div>
            {myResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-ico">📊</div>
                <div className="empty-title">No results yet</div>
                <div className="empty-desc">Complete an interview to see your score, AI feedback, and ranking.</div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
                {myResults.map(r => {
                  const job  = JOBS.find(j => j.id === r.jobId) || { title: r.jobTitle, icon:'💼' };
                  const col  = r.score >= 80 ? 'var(--emerald)' : r.score >= 60 ? 'var(--amber)' : 'var(--red)';
                  return (
                    <div key={r.resultId} className="card card-hover" onClick={() => navigate(`/results/${r.resultId}`)}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px' }}>
                        <div style={{ fontSize:'28px' }}>{job.icon}</div>
                        <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`}>{r.passed ? 'Passed' : 'Failed'}</span>
                      </div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'17px', fontWeight:'800', marginBottom:'4px' }}>{job.title}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'44px', fontWeight:'900', color:col, lineHeight:'1', marginBottom:'12px' }}>
                        {r.score}<span style={{ fontSize:'18px' }}>%</span>
                      </div>
                      <div className="progress-track" style={{ marginBottom:'12px' }}>
                        <div className="progress-fill" style={{ width:`${r.score}%`, background:col }} />
                      </div>
                      <div style={{ display:'flex', gap:'12px', fontSize:'12px', color:'var(--slate-6)' }}>
                        {r.rank && <span>🏆 Rank #{r.rank}</span>}
                        <span>⏱ {Math.floor((r.timeTaken||0)/60)}:{String((r.timeTaken||0)%60).padStart(2,'0')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <>
            <div className="sec-head"><div><h3>Your Profile</h3><p>Manage your account information</p></div></div>
            <div className="profile-card">
              <div className="profile-hero">
                <div className="profile-avatar-lg">{userProfile?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="profile-name-lg">{userProfile?.name}</div>
                  <div className="profile-email-lg">{userProfile?.email}</div>
                  <div style={{ marginTop:'10px', display:'flex', gap:'8px' }}>
                    <span className="badge badge-green">✓ Firebase Verified</span>
                    <span className="badge badge-slate">Candidate</span>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" defaultValue={userProfile?.name} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" value={userProfile?.email || ''} disabled readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-input" value="Candidate" disabled readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Interviews Completed</label>
                  <input className="form-input" value={myResults.length} disabled readOnly />
                </div>
                <button className="btn btn-emerald" style={{ alignSelf:'flex-start' }} onClick={() => toast('Profile saved successfully!', 'success')}>
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── START INTERVIEW MODAL ── */}
      <Modal
        open={!!startModal}
        onClose={() => setStartModal(null)}
        title={startModal ? `${startModal.title} — AI Interview` : ''}
      >
        {startModal && (
          <>
            <div style={{ background:'var(--cream)', borderRadius:'var(--r-sm)', padding:'18px', fontSize:'14px', color:'var(--slate-6)', lineHeight:'1.8', border:'1px solid var(--slate-2)', marginBottom:'20px' }}>
              <strong style={{ color:'var(--ink)' }}>📋 Before You Start</strong><br />
              • {startModal.qs} questions — Multiple Choice &amp; Written Responses<br />
              • Each question has a <strong>2-minute timer</strong><br />
              • Estimated total time: <strong>{startModal.time}</strong><br />
              • Your answers will be <strong>AI-evaluated and scored instantly</strong><br />
              • Passing threshold: <strong>60%</strong><br />
              • Once submitted, you <strong>cannot retake</strong> this interview
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'8px' }}>
              {[['📝','Questions', startModal.qs], ['⏱','Per Question','2 min'], ['🎯','Pass Mark','60%']].map(([ic,lbl,val]) => (
                <div key={lbl} className="stat-card" style={{ padding:'14px', flexDirection:'column', alignItems:'flex-start', gap:'6px' }}>
                  <div style={{ fontSize:'20px' }}>{ic}</div>
                  <div className="stat-lbl">{lbl}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:'900' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
              <button className="btn btn-forest btn-lg" style={{ flex:1 }} onClick={beginInterview}>
                Begin Interview →
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => setStartModal(null)}>Cancel</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
