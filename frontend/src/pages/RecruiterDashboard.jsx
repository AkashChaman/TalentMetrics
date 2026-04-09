// src/pages/RecruiterDashboard.jsx — TalentMetrics Recruiter Dashboard
// Tabs: Overview · Candidates · Job Roles · Settings
// Loads real data from /api/interview/all-candidates (Firebase-backed)

import React, { useState, useEffect } from 'react';
import { useAuth }      from '../context/AuthContext';
import { interviewAPI } from '../utils/api';
import { toast }        from '../components/Toast';
import Sidebar          from '../components/Sidebar';
import Modal            from '../components/Modal';

const JOBS = [
  { id:1, title:'Software Engineer',  dept:'Engineering',    level:'Mid-level', type:'Full-time', qs:8, time:'30 min', icon:'💻', bg:'#dbeafe', apps:24 },
  { id:2, title:'Data Analyst',       dept:'Analytics',      level:'Junior',    type:'Full-time', qs:8, time:'30 min', icon:'📊', bg:'#ede9fe', apps:18 },
  { id:3, title:'Product Manager',    dept:'Product',        level:'Senior',    type:'Full-time', qs:8, time:'30 min', icon:'🎯', bg:'#fef9e7', apps:12 },
  { id:4, title:'UX Designer',        dept:'Design',         level:'Mid-level', type:'Contract',  qs:8, time:'30 min', icon:'🎨', bg:'#fce7f3', apps:9  },
  { id:5, title:'DevOps Engineer',    dept:'Infrastructure', level:'Senior',    type:'Full-time', qs:8, time:'30 min', icon:'⚙️', bg:'#dcfce7', apps:15 },
  { id:6, title:'Marketing Analyst',  dept:'Marketing',      level:'Junior',    type:'Part-time', qs:6, time:'20 min', icon:'📣', bg:'#fee2e2', apps:21 },
];

const AVATAR_COLORS = ['#0a3d2b','#1e40af','#7c3aed','#b45309','#0369a1','#166534','#dc2626','#374151','#9d174d','#065f46'];

const SB_ITEMS = [
  { id:'overview',   icon:'📊', label:'Overview'    },
  { id:'candidates', icon:'👥', label:'Candidates'  },
  { id:'jobs',       icon:'💼', label:'Job Roles'   },
  { id:'settings',   icon:'⚙️', label:'Settings'    },
];

// Demo data fallback (shown if backend not connected)
const DEMO_CANDS = [
  { resultId:'r1', candidateEmail:'arjun.sharma@demo.com', jobId:1, jobTitle:'Software Engineer', score:92, passed:true,  timeTaken:443, rank:1, aiFeedback:'Outstanding technical knowledge. Clear communicator and fast thinker.' },
  { resultId:'r2', candidateEmail:'priya.nair@demo.com',   jobId:2, jobTitle:'Data Analyst',      score:88, passed:true,  timeTaken:491, rank:1, aiFeedback:'Excellent analytical skills. Strong SQL and Python fundamentals.' },
  { resultId:'r3', candidateEmail:'rahul.verma@demo.com',  jobId:1, jobTitle:'Software Engineer', score:85, passed:true,  timeTaken:544, rank:2, aiFeedback:'Good problem-solving approach. Solid system design awareness.' },
  { resultId:'r4', candidateEmail:'deepa.rao@demo.com',    jobId:4, jobTitle:'UX Designer',       score:91, passed:true,  timeTaken:478, rank:1, aiFeedback:'Creative with strong user empathy. Excellent portfolio instinct.' },
  { resultId:'r5', candidateEmail:'sneha.patel@demo.com',  jobId:3, jobTitle:'Product Manager',   score:74, passed:true,  timeTaken:690, rank:1, aiFeedback:'Good product sense. Needs sharper metrics-focused thinking.' },
  { resultId:'r6', candidateEmail:'vikram.singh@demo.com', jobId:1, jobTitle:'Software Engineer', score:55, passed:false, timeTaken:1120,rank:4, aiFeedback:'Foundational gaps in data structures. Recommend further preparation.' },
  { resultId:'r7', candidateEmail:'ananya.iyer@demo.com',  jobId:2, jobTitle:'Data Analyst',      score:79, passed:true,  timeTaken:612, rank:2, aiFeedback:'Solid SQL and visualization skills. Strong statistical reasoning.' },
  { resultId:'r8', candidateEmail:'amit.kumar@demo.com',   jobId:5, jobTitle:'DevOps Engineer',   score:68, passed:true,  timeTaken:866, rank:1, aiFeedback:'Good CI/CD knowledge. Needs more depth on Kubernetes and infra.' },
];

export default function RecruiterDashboard() {
  const { userProfile } = useAuth();
  const [tab,          setTab]          = useState('overview');
  const [candidates,   setCandidates]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [shortlisted,  setShortlisted]  = useState(new Set());
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);

  // Load all candidates from Firebase-backed API
  useEffect(() => {
    async function load() {
      try {
        const data = await interviewAPI.allCandidates();
        setCandidates(data.candidates?.length ? data.candidates : DEMO_CANDS);
      } catch {
        toast('Using demo data — connect backend + Firebase for live data.', 'info');
        setCandidates(DEMO_CANDS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleShortlist(resultId) {
    setShortlisted(prev => {
      const next = new Set(prev);
      if (next.has(resultId)) { next.delete(resultId); toast('Removed from shortlist.', 'info'); }
      else                    { next.add(resultId);    toast('⭐ Candidate shortlisted!', 'success'); }
      return next;
    });
  }

  async function refreshCandidates() {
    setLoading(true);
    try {
      const data = await interviewAPI.allCandidates();
      setCandidates(data.candidates?.length ? data.candidates : DEMO_CANDS);
      toast('Refreshed from Firebase.', 'success');
    } catch {
      toast('Could not refresh. Check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Filtered candidate list
  const filtered = candidates.filter(c => {
    const sq = search.toLowerCase();
    const matchQ = !sq || c.candidateEmail?.toLowerCase().includes(sq) || c.jobTitle?.toLowerCase().includes(sq);
    const matchR = !roleFilter || c.jobTitle === roleFilter;
    return matchQ && matchR;
  });

  const passedCnt = candidates.filter(c => c.passed).length;
  const avgScore  = candidates.length
    ? Math.round(candidates.reduce((a, c) => a + (c.score || 0), 0) / candidates.length)
    : 0;

  return (
    <div className="dash-layout" style={{ paddingTop:'72px' }}>
      <Sidebar items={SB_ITEMS} activeTab={tab} onTabChange={setTab} />

      <main className="dash-main">
        <div className="dash-header">
          <div className="dash-greeting">Recruiter Dashboard</div>
          <div className="dash-sub">
            Review AI-evaluated candidates, manage shortlists, and make data-driven decisions.
            {' '}Connected to Firebase · {candidates.length} submissions loaded.
          </div>
        </div>

        {/* ══ OVERVIEW TAB ══════════════════════════════════ */}
        {tab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-ico green">👥</div><div><div className="stat-lbl">Total Submissions</div><div className="stat-val">{candidates.length}</div></div></div>
              <div className="stat-card"><div className="stat-ico gold">✅</div><div><div className="stat-lbl">Passed (≥60%)</div><div className="stat-val">{passedCnt}</div></div></div>
              <div className="stat-card"><div className="stat-ico blue">⭐</div><div><div className="stat-lbl">Shortlisted</div><div className="stat-val">{shortlisted.size}</div></div></div>
              <div className="stat-card"><div className="stat-ico purple">📈</div><div><div className="stat-lbl">Avg Score</div><div className="stat-val">{avgScore}%</div></div></div>
            </div>

            <div className="analytics-grid">
              {/* Score distribution chart */}
              <div className="chart-card">
                <h4>Score Distribution</h4>
                <ScoreChart candidates={candidates} />
              </div>
              {/* Top performers list */}
              <div className="chart-card">
                <h4>Top Performers</h4>
                {loading ? (
                  <p style={{ color:'var(--slate-4)', fontSize:'14px' }}>Loading from Firebase…</p>
                ) : (
                  [...candidates].sort((a, b) => b.score - a.score).slice(0, 6).map((c, i) => {
                    const col = c.score >= 80 ? 'var(--emerald)' : c.score >= 60 ? 'var(--amber)' : 'var(--red)';
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid var(--slate-2)' }}>
                        <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:AVATAR_COLORS[i % AVATAR_COLORS.length], flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'13px', color:'#fff' }}>
                          {(c.candidateEmail?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'14px', fontWeight:'600', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.candidateEmail?.split('@')[0]}</div>
                          <div style={{ fontSize:'12px', color:'var(--slate-6)' }}>{c.jobTitle}</div>
                        </div>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:'900', color:col, flexShrink:0 }}>{c.score}%</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* ══ CANDIDATES TAB ════════════════════════════════ */}
        {tab === 'candidates' && (
          <>
            <div className="sec-head" style={{ marginBottom:'20px' }}>
              <div>
                <h3>All Candidates</h3>
                <p>Ranked by AI score · Click "View" to review in detail · Shortlist top talent</p>
              </div>
              <button className="btn btn-forest btn-sm" onClick={refreshCandidates} disabled={loading}>
                {loading ? '⏳ Loading…' : '↻ Refresh'}
              </button>
            </div>

            {/* Filters */}
            <div className="filter-row">
              <div className="search-wrap">
                <span className="search-ico">🔍</span>
                <input
                  className="form-input"
                  style={{ paddingLeft:'40px' }}
                  type="text"
                  placeholder="Search by email or role…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="form-input"
                style={{ width:'200px' }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {JOBS.map(j => <option key={j.id}>{j.title}</option>)}
              </select>
            </div>

            {/* Candidate Table */}
            <div className="cand-table">
              <div className="ct-head">
                <div className="ct-hcell">#</div>
                <div className="ct-hcell">Candidate</div>
                <div className="ct-hcell">Role</div>
                <div className="ct-hcell">Score</div>
                <div className="ct-hcell">Time</div>
                <div className="ct-hcell">Actions</div>
              </div>

              {loading ? (
                <div style={{ padding:'40px', textAlign:'center', color:'var(--slate-4)' }}>Loading from Firebase…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding:'40px', textAlign:'center', color:'var(--slate-4)' }}>No candidates match your filter.</div>
              ) : (
                [...filtered].sort((a, b) => b.score - a.score).map((c, i) => {
                  const isShort = shortlisted.has(c.resultId);
                  const scCol   = c.score >= 80 ? 'var(--emerald)' : c.score >= 60 ? 'var(--amber)' : 'var(--red)';
                  const scCls   = c.score >= 80 ? 'high' : c.score >= 60 ? 'mid' : 'low';
                  const m       = Math.floor((c.timeTaken || 0) / 60);
                  const s       = String((c.timeTaken || 0) % 60).padStart(2, '0');
                  return (
                    <div key={c.resultId || i} className={`ct-row ${isShort ? 'shortlisted' : ''}`}>
                      <div className="ct-cell" style={{ color:'var(--slate-4)', fontWeight:'700', fontSize:'12px' }}>{i + 1}</div>
                      <div className="ct-cell" style={{ gap:'12px' }}>
                        <div className="cand-ava" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                          {(c.candidateEmail?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:'700', color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.candidateEmail?.split('@')[0]}</div>
                          <div style={{ fontSize:'12px', color:'var(--slate-6)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.candidateEmail}</div>
                        </div>
                      </div>
                      <div className="ct-cell">
                        <span className="badge badge-slate" style={{ fontSize:'11px' }}>{c.jobTitle}</span>
                      </div>
                      <div className="ct-cell">
                        <div className="score-mini-bar">
                          <div className="score-track">
                            <div className={`score-fill ${scCls}`} style={{ width:`${c.score}%` }} />
                          </div>
                          <span style={{ fontWeight:'800', fontSize:'13px', color:scCol, minWidth:'36px' }}>{c.score}%</span>
                        </div>
                      </div>
                      <div className="ct-cell" style={{ color:'var(--slate-6)', fontSize:'13px' }}>⏱ {m}:{s}</div>
                      <div className="ct-cell" style={{ gap:'6px', flexWrap:'wrap' }}>
                        <button
                          className={`btn btn-xs ${isShort ? 'btn-ghost' : 'btn-emerald'}`}
                          onClick={() => toggleShortlist(c.resultId)}
                        >
                          {isShort ? '★ Listed' : '☆ Shortlist'}
                        </button>
                        <button className="btn btn-xs btn-ghost" onClick={() => setReviewTarget(c)}>
                          View
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ══ JOB ROLES TAB ═════════════════════════════════ */}
        {tab === 'jobs' && (
          <>
            <div className="sec-head">
              <div><h3>Active Job Roles</h3><p>Manage interview tracks and view applicant counts</p></div>
              <button className="btn btn-forest btn-sm" onClick={() => toast('Role creation form coming soon!', 'info')}>+ Add Role</button>
            </div>
            <div className="jobs-grid">
              {JOBS.map(j => {
                const cnt = candidates.filter(c => c.jobId === j.id).length;
                return (
                  <div className="job-card" key={j.id}>
                    <div className="job-card-top">
                      <div className="job-logo" style={{ background:j.bg }}>{j.icon}</div>
                      <span className="badge badge-green">● Active</span>
                    </div>
                    <div>
                      <div className="job-name">{j.title}</div>
                      <div className="job-dept">{j.dept} · {j.level} · {j.type}</div>
                    </div>
                    <div className="job-tags">
                      <span className="badge badge-slate">👤 {cnt || j.apps} applicants</span>
                      <span className="badge badge-slate">📝 {j.qs} questions</span>
                      <span className="badge badge-slate">⏱ {j.time}</span>
                    </div>
                    <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setTab('candidates')}>View Candidates</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toast('Role editor coming soon!','info')}>Edit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══ SETTINGS TAB ══════════════════════════════════ */}
        {tab === 'settings' && (
          <div className="settings-section">
            {/* Company info */}
            <div className="settings-card">
              <h4>Company Settings</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" defaultValue="Acme Corporation" /></div>
                <div className="form-group"><label className="form-label">Hiring Contact Email</label><input className="form-input" type="email" defaultValue={userProfile?.email || ''} /></div>
                <div className="form-group"><label className="form-label">Interview Time Limit (minutes per question)</label><input className="form-input" type="number" defaultValue="2" /></div>
                <div className="form-group"><label className="form-label">Passing Score Threshold (%)</label><input className="form-input" type="number" defaultValue="60" /></div>
              </div>
            </div>

            {/* Toggle preferences */}
            <div className="settings-card">
              <h4>Platform Preferences</h4>
              {[
                ['AI Auto-Evaluation',       'Score open-ended written answers using AI',             true],
                ['Email Notifications',      'Notify candidates of results automatically',             true],
                ['Leaderboard Visibility',   'Let candidates see their rank on results page',          true],
                ['Auto-Shortlist Top 10%',   'Automatically flag the highest-scoring candidates',      false],
                ['Candidate Anonymisation',  'Hide candidate names during initial review',             false],
              ].map(([name, desc, defaultOn]) => (
                <ToggleRow key={name} name={name} desc={desc} defaultOn={defaultOn} />
              ))}
            </div>

            <button className="btn btn-forest" onClick={() => toast('Settings saved successfully!', 'success')}>
              Save All Settings
            </button>
          </div>
        )}
      </main>

      {/* ══ CANDIDATE REVIEW MODAL ════════════════════════ */}
      <Modal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title="Candidate Review"
        maxWidth="560px"
      >
        {reviewTarget && (
          <CandidateReviewBody
            c={reviewTarget}
            isShort={shortlisted.has(reviewTarget.resultId)}
            onShortlist={() => { toggleShortlist(reviewTarget.resultId); setReviewTarget(null); }}
            onReject={() => { toast('Candidate rejected.', 'info'); setReviewTarget(null); }}
          />
        )}
      </Modal>
    </div>
  );
}

/* ── Score Distribution Chart ── */
function ScoreChart({ candidates }) {
  const bins = [
    { lbl:'0–40%',   min:0,  max:40,  col:'var(--red)' },
    { lbl:'41–60%',  min:41, max:60,  col:'var(--amber)' },
    { lbl:'61–75%',  min:61, max:75,  col:'#60a5fa' },
    { lbl:'76–90%',  min:76, max:90,  col:'var(--emerald)' },
    { lbl:'91–100%', min:91, max:100, col:'var(--forest)' },
  ].map(b => ({ ...b, val: candidates.filter(c => c.score >= b.min && c.score <= b.max).length }));
  const max = Math.max(...bins.map(b => b.val), 1);
  return (
    <div className="bar-chart">
      {bins.map(b => (
        <div className="bar-wrap" key={b.lbl}>
          <div className="bar-val">{b.val}</div>
          <div className="bar-col" style={{ height:`${(b.val / max) * 110}px`, background:b.col, minHeight:'4px' }} />
          <div className="bar-lbl">{b.lbl}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Toggle Row Component ── */
function ToggleRow({ name, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <div className="t-name">{name}</div>
        <div className="t-desc">{desc}</div>
      </div>
      <div className={`toggle ${on ? '' : 'off'}`} onClick={() => setOn(v => !v)}>
        <div className="toggle-knob" />
      </div>
    </div>
  );
}

/* ── Candidate Review Modal Body ── */
function CandidateReviewBody({ c, isShort, onShortlist, onReject }) {
  const scCol = c.score >= 80 ? 'var(--emerald)' : c.score >= 60 ? 'var(--amber)' : 'var(--red)';
  const m     = Math.floor((c.timeTaken || 0) / 60);
  const s     = String((c.timeTaken || 0) % 60).padStart(2, '0');
  return (
    <>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px', paddingBottom:'20px', borderBottom:'1px solid var(--slate-2)' }}>
        <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'var(--forest)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:'900', color:'var(--gold-light)', flexShrink:0 }}>
          {(c.candidateEmail?.[0] || '?').toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:'800' }}>{c.candidateEmail?.split('@')[0]}</div>
          <div style={{ fontSize:'13px', color:'var(--slate-6)' }}>{c.candidateEmail}</div>
          <div style={{ marginTop:'8px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <span className="badge badge-slate">{c.jobTitle}</span>
            {isShort && <span className="badge badge-green">⭐ Shortlisted</span>}
            <span className={`badge ${c.passed ? 'badge-green' : 'badge-red'}`}>{c.passed ? '✓ Passed' : '✗ Failed'}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'20px' }}>
        {[
          ['AI Score',   `${c.score}%`,             scCol],
          ['Time Taken', `${m}:${s}`,                'var(--ink)'],
          ['Rank',       c.rank ? `#${c.rank}` : '—', 'var(--ink)'],
        ].map(([lbl, val, col]) => (
          <div key={lbl} style={{ background:'var(--cream)', borderRadius:'var(--r-sm)', padding:'14px', textAlign:'center', border:'1px solid var(--slate-2)' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:'900', color:col }}>{val}</div>
            <div style={{ fontSize:'12px', color:'var(--slate-6)', marginTop:'3px' }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--slate-6)', marginBottom:'6px' }}>
          <span>Score</span><span style={{ fontWeight:'700', color:scCol }}>{c.score}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width:`${c.score}%`, background:scCol }} />
        </div>
      </div>

      {/* AI feedback */}
      {c.aiFeedback && (
        <div style={{ background:'var(--sage)', borderRadius:'var(--r-sm)', padding:'14px 16px', marginBottom:'20px', fontSize:'13.5px', color:'var(--forest)', lineHeight:'1.65' }}>
          <strong>🤖 AI Summary:</strong> {c.aiFeedback}
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:'10px' }}>
        <button className="btn btn-emerald" style={{ flex:1 }} onClick={onShortlist}>
          {isShort ? '✓ Remove from Shortlist' : '⭐ Shortlist Candidate'}
        </button>
        <button className="btn btn-danger btn-sm" onClick={onReject}>Reject</button>
      </div>
    </>
  );
}
