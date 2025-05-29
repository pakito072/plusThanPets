import React from 'react';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Inicio',
    icon: <span className="proicons--home" />
  },
  {
    key: 'adoptar',
    label: 'Adoptar',
    icon: <span className="mdi--heart-outline" />
  },
  {
    key: 'donnor',
    label: 'Donar',
    icon: <span className="streamline-flex--give-star" style={{ width: 24, height: 24 }} />
  },
  {
    key: 'chat',
    label: 'Chat',
    icon: <span className="material-symbols--chat-outline-rounded" />
  },
  {
    key: 'perfil',
    label: 'Perfil',
    icon: <span className="ri--user-line" />
  },
];

export default function SideMenu({ onSelect, selected, onAuthModal, user }) {
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
              <span className="line-md--log-out" />
            </span>
            <span className="navbar-lateral-link-text">{user ? 'Cerrar sesión' : 'Iniciar sesión'}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
