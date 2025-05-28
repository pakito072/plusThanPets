import React, { useEffect, useState } from 'react';

export default function PerfilSection() {
  const [user, setUser] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [donated, setDonated] = useState([]);

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => setUser(data));
    fetch('/api/adoptions/me')
      .then(res => res.json())
      .then(data => setAdoptions(data));
    fetch('/api/animals/my-donated')
      .then(res => res.json())
      .then(data => setDonated(data));
  }, []);

  if (!user) return <section className="perfil-section"><p>Cargando perfil...</p></section>;

  return (
    <section className="perfil-section">
      <h1 className="section-title">Perfil</h1>
      <div className="perfil-info">
        <p><b>Nombre:</b> {user.name || user.username}</p>
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
      <div className="perfil-adoptions" style={{ marginTop: '2rem' }}>
        <h2>Animales que he donado</h2>
        {donated.length === 0 ? (
          <p>No has donado ningún animal todavía.</p>
        ) : (
          <ul>
            {donated.map(animal => (
              <li key={animal.id}>
                <img src={animal.image_url} alt={animal.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, marginRight: 8, verticalAlign: 'middle' }} />
                <b>{animal.name}</b> ({animal.type}) - {animal.breed}, {animal.age} años
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
