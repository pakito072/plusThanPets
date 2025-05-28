import React, { useState } from 'react';
import CarouselHeader from './components/CarouselHeader';
import Footer from './components/Footer';
import HomeSection from './sections/HomeSection';
import AdoptarSection from './sections/AdoptarSection';
import DonarSection from './sections/DonarSection';
import PerfilSection from './sections/PerfilSection';
import SideMenu from './components/SideMenu';
import AuthModal from './components/AuthModal';

function App() {
  const [section, setSection] = useState('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState(null); // { type: 'success'|'error', text: string }

  const handleAuth = async (data) => {
    setAuthMessage(null);
    try {
      // Simulación de llamada al backend
      // Reemplaza esto por tu fetch real
      let response;
      if (data.mode === 'login') {
        response = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password })
        });
      } else {
        response = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, email: data.email, password: data.password })
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

  return (
    <div className="app">
      <SideMenu onSelect={setSection} selected={section} onAuthModal={() => setAuthOpen(true)} user={user} />
      <CarouselHeader />
      <main>
        {section === 'home' && <HomeSection />}
        {section === 'adoptar' && <AdoptarSection />}
        {section === 'donar' && <DonarSection />}
        {section === 'perfil' && <PerfilSection />}
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuth={handleAuth} message={authMessage} />
    </div>
  );
}

export default App;