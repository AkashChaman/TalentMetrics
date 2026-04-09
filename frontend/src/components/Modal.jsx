// src/components/Modal.jsx
import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = '500px' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-bg open"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box" style={{ maxWidth }}>
        <div className="modal-hd">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
