// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from './Toast';

export default function Navbar() {
  const { userProfile, logOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logOut();
    toast('Signed out successfully.', 'info');
    navigate('/');
  }

  const home     = userProfile?.role === 'recruiter' ? '/recruiter' : '/dashboard';
  const initials = userProfile?.name?.[0]?.toUpperCase() || '?';

  return (
    <nav id="navbar">
      <div className="nav-logo" onClick={() => navigate(home)} style={{ cursor: 'pointer' }}>
        <div className="nav-logo-mark">T</div>
        <div className="nav-logo-name">Talent<em>Metrics</em></div>
      </div>
      <div className="nav-right">
        <div className="nav-user">
          <div className="nav-avatar">{initials}</div>
          <span className="nav-uname">{userProfile?.name?.split(' ')[0]}</span>
          <span className="badge badge-slate" style={{ fontSize: '11px' }}>
            {userProfile?.role === 'recruiter' ? '🏢 Recruiter' : '👤 Candidate'}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
