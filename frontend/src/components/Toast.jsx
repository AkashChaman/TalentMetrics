// src/components/Toast.jsx
// Global toast notification system — TalentMetrics
// Import { toast } anywhere and call toast('message', 'success'|'error'|'info')

import React, { useState, useCallback, useEffect, useRef } from 'react';

// Module-level reference so toast() can be called outside React tree
let _showFn = null;

export function toast(msg, type = 'info') {
  if (_showFn) _showFn(msg, type);
}

export default function Toast() {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((msg, type = 'info') => {
    const id = ++idRef.current;
    setItems(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => { _showFn = show; return () => { _showFn = null; }; }, [show]);

  const icons = { success: '✓', error: '✗', info: '●' };

  return (
    <div id="toast-container">
      {items.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>{icons[t.type]}</span>
          <span>{t.msg}</span>
          <button
            onClick={() => setItems(p => p.filter(x => x.id !== t.id))}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px', opacity: 0.6, flexShrink: 0 }}
          >✕</button>
        </div>
      ))}
    </div>
  );
}
