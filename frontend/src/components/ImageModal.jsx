import React from 'react';

export default function ImageModal({ open, src, alt = '', onClose }) {
  if (!open) return null;
  return (
    <div className="adoptar-modal-backdrop" style={{ zIndex: 3000 }} onClick={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <img src={src} alt={alt} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 18, boxShadow: '0 4px 32px #ffcf8e99' }} onClick={e => e.stopPropagation()} />
      </div>
    </div>
  );
}
