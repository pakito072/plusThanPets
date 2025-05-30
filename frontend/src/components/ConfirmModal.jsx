import React from 'react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', loading = false }) {
  if (!open) return null;
  return (
    <div className="adoptar-modal-backdrop" onClick={onCancel}>
      <div className="adoptar-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 16 }}>{title}</h2>
        <p style={{ textAlign: 'center', marginBottom: 24 }}>{message}</p>
        <div className="adoptar-modal-actions" style={{ justifyContent: 'center' }}>
          <button className="adoptar-modal-chat" onClick={onConfirm} disabled={loading}>{confirmText}</button>
          <button className="adoptar-modal-close" onClick={onCancel} disabled={loading}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
}
