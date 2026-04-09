// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from './Toast';

export default function Sidebar({ items, activeTab, onTabChange }) {
  const { logOut } = useAuth();
  const navigate   = useNavigate();

  async function handleLogout() {
    await logOut();
    toast('Signed out successfully.', 'info');
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <div className="sb-section">Navigation</div>
      {items.map(item => (
        <button
          key={item.id}
          className={`sb-btn ${activeTab === item.id ? 'on' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="sb-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div className="sb-section" style={{ marginTop: '16px' }}>Account</div>
      <button className="sb-btn" onClick={handleLogout}>
        <span className="sb-icon">🚪</span>
        Sign Out
      </button>
    </aside>
  );
}
