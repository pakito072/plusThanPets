import React, { useState } from 'react';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Inicio',
    icon: <span className="proicons--home" />
  },
  {
    key: 'adoptar',
    label: 'Adoptar',
    icon: <span className="mdi--heart-outline" />,
    subOptions: [
      { key: 'adoptar-catalogo', label: 'Catálogo', icon: <span className="material-symbols--search-rounded" /> },
      { key: 'adoptar-chats', label: 'Chats de adoptante', icon: <span className="bx--chat" /> }
    ]
  },
  {
    key: 'donnor',
    label: 'Donar',
    icon: <span className="streamline-flex--give-star" style={{ width: 24, height: 24 }} />,
    subOptions: [
      { key: 'donnor-ficha', label: 'Ficha', icon: <span className="material-symbols--list-rounded" /> },
      { key: 'donnor-chats', label: 'Chats de donante', icon: <span className="bx--chat" /> }
    ]
  },
  {
    key: 'perfil',
    label: 'Perfil',
    icon: <span className="ri--user-line" />
  },
];

export default function SideMenu({ onSelect, selected, onAuthModal, user }) {
  const [openSub, setOpenSub] = useState(null);

  const handleMainClick = (item) => {
    if (item.subOptions) {
      setOpenSub(openSub === item.key ? null : item.key);
    } else {
      setOpenSub(null);
      onSelect(item.key);
    }
  };

  const handleSubClick = (subKey) => {
    onSelect(subKey);
    setOpenSub(null);
  };

  return (
    <nav className="navbar-lateral">
      <ul className="navbar-lateral-items">
        <li className="navbar-lateral-logo">
          <a className="navbar-lateral-item-inner">
            <img src="/logo-icon.svg" alt="Logo" style={{ height: '2.5em', width: '2.5em' }} />
          </a>
        </li>
        {NAV_ITEMS.map(item => (
          <React.Fragment key={item.key}>
            <li className={`navbar-lateral-item${selected === item.key ? ' active' : ''}`}
              onClick={() => handleMainClick(item)}>
              <a className="navbar-lateral-item-inner">
                <span className="navbar-lateral-item-icon">{item.icon}</span>
                <span className="navbar-lateral-link-text">{item.label}
                  {item.subOptions && (
                    <span
                      className={`weui--arrow-filled navbar-lateral-arrow-icon${openSub === item.key ? ' open' : ''}`}
                      style={{
                        display: 'inline-block',
                        marginLeft: 10,
                        transition: 'transform 0.25s',
                        transform: openSub === item.key ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}
                    />
                  )}
                </span>
              </a>
            </li>
            {item.subOptions && openSub === item.key && (
              <ul className="navbar-lateral-suboptions" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                {item.subOptions.map(sub => (
                  <li key={sub.key} className={`navbar-lateral-subitem${selected === sub.key ? ' active' : ''}`}
                    onClick={() => handleSubClick(sub.key)}
                    style={{ display: 'flex', alignItems: 'center', padding: '0.5em 1.2em 0.5em 2.5em', cursor: 'pointer', borderRadius: 8 }}>
                    <span className="navbar-lateral-item-icon">{sub.icon}</span>
                    <span className="navbar-lateral-link-text">{sub.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </React.Fragment>
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
