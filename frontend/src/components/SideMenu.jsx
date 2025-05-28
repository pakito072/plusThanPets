import React from 'react';

const NAV_ITEMS = [
  { key: 'home', label: 'Inicio', icon: <span className="material-icons">home</span> },
  { key: 'adoptar', label: 'Adoptar', icon: <span className="material-icons">pets</span> },
  { key: 'donar', label: 'Donar', icon: <span className="material-icons">volunteer_activism</span> },
  { key: 'perfil', label: 'Perfil', icon: <span className="material-icons">person</span> },
];

export default function SideMenu({ onSelect, selected, onAuthModal }) {
  return (
    <nav className="navbar-lateral">
      <ul className="navbar-lateral-items">
        <li className="navbar-lateral-logo">
          <a className="navbar-lateral-item-inner">
            <img src="/logo-icon.svg" alt="Logo" style={{ height: '2.5em', width: '2.5em' }} />
          </a>
        </li>
        {NAV_ITEMS.map(item => (
          <li key={item.key} className={`navbar-lateral-item${selected === item.key ? ' active' : ''}`}
            onClick={() => onSelect(item.key)}>
            <a className="navbar-lateral-item-inner">
              <span className="navbar-lateral-item-icon">{item.icon}</span>
              <span className="navbar-lateral-link-text">{item.label}</span>
            </a>
          </li>
        ))}
        {/* Espaciador para empujar la opción de login abajo */}
        <li style={{ flex: 1 }}></li>
        <li className="navbar-lateral-item navbar-lateral-login" style={{ marginBottom: '1.5em' }} onClick={onAuthModal}>
          <a className="navbar-lateral-item-inner">
            <span className="navbar-lateral-item-icon">
              <svg width="1.8em" height="1.8em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.75 9V5.75A2.75 2.75 0 0013 3H6.75A2.75 2.75 0 004 5.75v12.5A2.75 2.75 0 006.75 21H13a2.75 2.75 0 002.75-2.75V15" stroke="#ffcf8e" strokeWidth="1.5" /><path d="M19 12l-7 0" stroke="#ffcf8e" strokeWidth="1.5" strokeLinecap="round" /><path d="M16.5 9.5L19 12l-2.5 2.5" stroke="#ffcf8e" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </span>
            <span className="navbar-lateral-link-text">Iniciar sesión</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
