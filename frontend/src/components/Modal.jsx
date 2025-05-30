import React from 'react';

export default function Modal({ open, onClose, children, className = '', backdropClass = '', ...props }) {
  if (!open) return null;
  return (
    <div className={`adoptar-modal-backdrop ${backdropClass}`} onClick={onClose}>
      <div className={`adoptar-modal ${className}`} onClick={e => e.stopPropagation()} {...props}>
        {children}
      </div>
    </div>
  );
}
