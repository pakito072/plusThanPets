import React, { useEffect, useState } from 'react';

export default function PerfilSection() {
  const [user, setUser] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [donated, setDonated] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setEditForm(data);
      });
    fetch('/api/animals/my-adoptions')
      .then(res => res.json())
      .then(data => setAdoptions(data));
    fetch('/api/animals/my-donated')
      .then(res => res.json())
      .then(data => setDonated(data));
  }, []);

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = e => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.password || passwords.confirm) {
      if (passwords.password !== passwords.confirm) {
        setPasswordError('Las contraseñas no coinciden');
        return;
      }
      editForm.password = passwords.password;
    }
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setEditMode(false);
      setPasswords({ password: '', confirm: '' });
    }
  };

  if (!user) return <section className="perfil-section"><p>Cargando perfil...</p></section>;

  // Campos de la tabla users (sin rol, sin lat/lng)
  const fields = [
    { label: 'Nombre de usuario', key: 'username' },
    { label: 'Email', key: 'email' },
    { label: 'Género', key: 'gender' },
    { label: 'Fecha de registro', key: 'created_at' }
  ];

  // Opciones de género igual que en el registro
  const genderOptions = [
    { value: '', label: 'Selecciona género*', disabled: true },
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'other', label: 'Otro' },
    { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' }
  ];

  return (
    <section className="perfil-section">
      <h1 className="section-title">Perfil</h1>
      <div className="perfil-info">
        {!editMode ? (
          <>
            <p><b>Nombre de usuario:</b> {user.username || 'No hay información'}</p>
            <p><b>Email:</b> {user.email || 'No hay información'}</p>
            <p><b>Género:</b> {user.gender ? genderOptions.find(g => g.value === user.gender)?.label : 'No hay información'}</p>
            <p><b>Fecha de registro:</b> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'No hay información'}</p>
            <button className="auth-modal-submit" onClick={() => setEditMode(true)}>Editar</button>
          </>
        ) : (
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
            <label style={{ fontWeight: 700 }}>
              Nombre de usuario:
              <input
                name="username"
                value={editForm.username ?? ''}
                onChange={handleEditChange}
                style={{ marginLeft: 8, padding: '0.5em', borderRadius: 8, border: '1.5px solid #a05a2c', fontWeight: 500 }}
              />
            </label>
            <label style={{ fontWeight: 700 }}>
              Email:
              <input
                name="email"
                value={editForm.email ?? ''}
                disabled
                style={{ marginLeft: 8, padding: '0.5em', borderRadius: 8, border: '1.5px solid #a05a2c', fontWeight: 500 }}
              />
            </label>
            <label style={{ fontWeight: 700 }}>
              Género:
              <select
                name="gender"
                value={editForm.gender ?? ''}
                onChange={handleEditChange}
                style={{ marginLeft: 8, padding: '0.5em', borderRadius: 8, border: '1.5px solid #a05a2c', fontWeight: 500 }}
              >
                {genderOptions.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 700 }}>
              Fecha de registro:
              <input
                name="created_at"
                value={user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                disabled
                style={{ marginLeft: 8, padding: '0.5em', borderRadius: 8, border: '1.5px solid #a05a2c', fontWeight: 500 }}
              />
            </label>
            <label style={{ fontWeight: 700 }}>
              Nueva contraseña:
              <input
                type="password"
                name="password"
                value={passwords.password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                style={{ marginLeft: 8, padding: '0.5em', borderRadius: 8, border: '1.5px solid #a05a2c', fontWeight: 500 }}
              />
            </label>
            <label style={{ fontWeight: 700 }}>
              Confirmar contraseña:
              <input
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                style={{ marginLeft: 8, padding: '0.5em', borderRadius: 8, border: '1.5px solid #a05a2c', fontWeight: 500 }}
              />
            </label>
            {passwordError && <div style={{ color: '#a05a2c', background: '#ffcf8e', borderRadius: 8, padding: 8 }}>{passwordError}</div>}
            <div style={{ display: 'flex', gap: '1em', marginTop: 8 }}>
              <button className="auth-modal-submit" type="submit">Guardar</button>
              <button className="auth-modal-submit" type="button" style={{ background: '#ffcf8e', color: '#a05a2c' }} onClick={() => { setEditMode(false); setPasswords({ password: '', confirm: '' }); }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
      <div className="perfil-adoptions">
        <h2>Mis adopciones</h2>
        {adoptions.length === 0 ? (
          <p>No has adoptado ningún animal todavía.</p>
        ) : (
          <ul>
            {adoptions.map(ad => (
              <li key={ad.adoption_id}>{ad.animal_name} ({ad.animal_type})</li>
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
