import React, { useState, useEffect } from 'react';
import CarouselHeader from './components/CarouselHeader';
import Footer from './components/Footer';
import HomeSection from './sections/HomeSection';
import AdoptionSection from './sections/AdoptionSection';
import DonnorSection from './sections/DonnorSection';
import PerfilSection from './sections/PerfilSection';
import LiveChatSection from './sections/LiveChatSection';
import SideMenu from './components/SideMenu';
import AuthModal from './components/AuthModal';

function App() {
  const [section, setSection] = useState('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState(null); // { type: 'success'|'error', text: string }
  const [logoutModal, setLogoutModal] = useState(false);
  const [chatAnimal, setChatAnimal] = useState(null);

  // Autologin al cargar la app
  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setUser(data); });
  }, []);

  const handleAuth = async (data) => {
    setAuthMessage(null);
    try {
      let response;
      if (data.mode === 'login') {
        response = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password }),
          credentials: 'include'
        });
      } else {
        response = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: data.username, email: data.email, password: data.password, gender: data.gender }),
          credentials: 'include'
        });
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error de autenticación');
      setUser(result.user);
      setAuthMessage({ type: 'success', text: data.mode === 'login' ? '¡Bienvenido/a!' : '¡Registro completado!' });
      setTimeout(() => {
        setAuthOpen(false);
        setAuthMessage(null);
      }, 1500);
    } catch (err) {
      setAuthMessage({ type: 'error', text: err.message || 'Error de autenticación' });
    }
  };

  // Cierre de sesión con confirmación visual (modal)
  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setAuthMessage({ type: 'success', text: 'Sesión cerrada correctamente' });
    setLogoutModal(false);
    setTimeout(() => setAuthMessage(null), 1500);
  };

  // Pasar función especial al SideMenu para mostrar el modal
  const handleAuthModal = () => {
    if (user) {
      setLogoutModal(true);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="app">
      <SideMenu
        onSelect={setSection}
        selected={section}
        onAuthModal={handleAuthModal}
        user={user}
      />
      {logoutModal && (
        <div className="logout-modal-backdrop">
          <div className="logout-modal">
            <h3>¿Cerrar sesión?</h3>
            <p>¿Seguro que quieres cerrar tu sesión?</p>
            <div className="logout-modal-actions">
              <button className="logout-btn-confirm" onClick={handleLogout}>Sí, cerrar sesión</button>
              <button className="logout-btn-cancel" onClick={() => setLogoutModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <CarouselHeader />
      <main>
        {section === 'home' && <HomeSection />}
        {['adoptar', 'adoptar-catalogo', 'donnor', 'donnor-ficha', 'perfil', 'adoptar-chats', 'donnor-chats'].includes(section) && !user ? (
          <div className="restricted-section-msg">
            <h2>Acceso restringido</h2>
            <p>Debes iniciar sesión para acceder a esta sección.</p>
            <button className="auth-modal-submit" onClick={() => setAuthOpen(true)}>Iniciar sesión</button>
          </div>
        ) : (
          <>
            {['adoptar', 'adoptar-catalogo'].includes(section) && <AdoptionSection setSection={setSection} setChatAnimal={setChatAnimal} />}
            {section === 'adoptar-chats' && <LiveChatSection animal={chatAnimal} user={user} chatType="adoptante" />}
            {['donnor', 'donnor-ficha'].includes(section) && <DonnorSection />}
            {section === 'donnor-chats' && <LiveChatSection animal={chatAnimal} user={user} chatType="donnor" />}
            {section === 'perfil' && <PerfilSection />}
          </>
        )}
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuth={handleAuth} message={authMessage} />
    </div>
  );
}

export default App;