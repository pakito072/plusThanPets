import React, { useEffect, useState } from 'react';

export default function PerfilSection() {
  const [user, setUser] = useState(null);
  const [adoptions, setAdoptions] = useState([]);

  useEffect(() => {
    // Suponiendo que hay un endpoint para el usuario actual
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => setUser(data));
    fetch('/api/adoptions/me')
      .then(res => res.json())
      .then(data => setAdoptions(data));
  }, []);

  if (!user) return <section className="perfil-section"><p>Cargando perfil...</p></section>;

  return (
    <section className="perfil-section">
      <h1 className="section-title">Perfil</h1>
      <div className="perfil-info">
        <p><b>Nombre:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
      </div>
      <div className="perfil-adoptions">
        <h2>Mis adopciones</h2>
        {adoptions.length === 0 ? (
          <p>No has adoptado ningún animal todavía.</p>
        ) : (
          <ul>
            {adoptions.map(ad => (
              <li key={ad.id}>{ad.animal_name} ({ad.animal_type})</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
