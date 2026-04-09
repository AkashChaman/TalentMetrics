// src/components/Loader.jsx
import React from 'react';

export default function Loader({ text = 'Loading…' }) {
  return (
    <div id="app-loader">
      <div className="loader-brand">Talent<em>Metrics</em></div>
      <div className="loader-track">
        <div className="loader-fill" />
      </div>
      <div className="loader-sub">{text}</div>
    </div>
  );
}
