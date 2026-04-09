// src/App.jsx — TalentMetrics Main App
// React Router v6 with role-based protected routes

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage        from './pages/LandingPage';
import AuthPage           from './pages/AuthPage';
import CandidateDashboard from './pages/CandidateDashboard';
import InterviewPage      from './pages/InterviewPage';
import ResultsPage        from './pages/ResultsPage';
import RecruiterDashboard from './pages/RecruiterDashboard';

import Navbar  from './components/Navbar';
import Loader  from './components/Loader';
import Toast   from './components/Toast';

import './styles/globals.css';
import './styles/landing.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/interview.css';
import './styles/results.css';
import './styles/recruiter.css';

// ── Protected Route: must be logged in, optional role check ──
function PrivateRoute({ children, requiredRole }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!currentUser) return <Navigate to="/auth" replace />;
  if (requiredRole && userProfile === null) return <Loader />;
  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to={userProfile?.role === 'recruiter' ? '/recruiter' : '/dashboard'} replace />;
  }
  return children;
}

// ── Public Only: redirect logged-in users to their dashboard ──
function PublicOnly({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <Loader />;
  if (currentUser && userProfile) {
    return <Navigate to={userProfile.role === 'recruiter' ? '/recruiter' : '/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      {/* Navbar shown on all pages except landing & auth */}
      {currentUser && <Navbar />}

      {/* Global toast notifications */}
      <Toast />

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<PublicOnly><AuthPage /></PublicOnly>} />

        {/* ── Candidate ── */}
        <Route
          path="/dashboard"
          element={<PrivateRoute requiredRole="candidate"><CandidateDashboard /></PrivateRoute>}
        />
        <Route
          path="/interview/:jobId"
          element={<PrivateRoute requiredRole="candidate"><InterviewPage /></PrivateRoute>}
        />
        <Route
          path="/results/:resultId"
          element={<PrivateRoute><ResultsPage /></PrivateRoute>}
        />

        {/* ── Recruiter ── */}
        <Route
          path="/recruiter"
          element={<PrivateRoute requiredRole="recruiter"><RecruiterDashboard /></PrivateRoute>}
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
