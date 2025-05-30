import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';

export default function PerfilSection() {
  const [user, setUser] = useState(null);
  const [adopted, setAdopted] = useState([]);
  const [donated, setDonated] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) throw new Error('401');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setEditForm(data);
      })
      .catch(() => {
        setUser(null);
      });
    fetch('/api/animals/my-adopted', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) throw new Error('401');
        return res.json();
      })
      .then(data => setAdopted(Array.isArray(data) ? data : []))
      .catch(() => setAdopted([]));
    fetch('/api/animals/my-donated', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) throw new Error('401');
        return res.json();
      })
      .then(data => setDonated(Array.isArray(data) ? data : []))
      .catch(() => setDonated([]));
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
      credentials: 'include',
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setEditModalOpen(false);
      setPasswords({ password: '', confirm: '' });
    } else if (res.status === 401) {
      setPasswordError('No autorizado. Por favor, inicia sesión de nuevo.');
    }
  };

  if (!user) return <section className="perfil-section"><p>Cargando perfil...</p></section>;

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
        <>
          <p><b>Nombre de usuario:</b> {user.username || 'No hay información'}</p>
          <p><b>Email:</b> {user.email || 'No hay información'}</p>
          <p><b>Género:</b> {user.gender ? genderOptions.find(g => g.value === user.gender)?.label : 'No hay información'}</p>
          <p><b>Fecha de registro:</b> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'No hay información'}</p>
          <button className="auth-modal-submit" onClick={() => setEditModalOpen(true)}>Editar</button>
        </>
      </div>
      <Modal open={editModalOpen} onClose={() => { setEditModalOpen(false); setPasswords({ password: '', confirm: '' }); }}>
        <form onSubmit={handleEditSubmit} className="auth-modal-form perfil-edit-modal perfil-edit-modal-form" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, alignSelf: 'center' }}>Nombre de usuario:</div>
            <input
              name="username"
              value={editForm.username ?? ''}
              onChange={handleEditChange}
              className="auth-modal-input"
              autoComplete="username"
              placeholder="Introduce tu nombre de usuario"
              style={{ textAlign: 'center' }}
            />
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, alignSelf: 'center' }}>Email:</div>
            <input
              name="email"
              value={editForm.email ?? ''}
              disabled
              className="auth-modal-input"
              placeholder="Tu email"
              style={{ textAlign: 'center' }}
            />
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, alignSelf: 'center' }}>Género:</div>
            <div className="auth-modal-select-wrapper" style={{ width: '100%' }}>
              <select
                name="gender"
                value={editForm.gender ?? ''}
                onChange={handleEditChange}
                className="auth-modal-select"
                style={{ textAlign: 'center' }}
              >
                {genderOptions.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} hidden={opt.value === ''}>{opt.label}</option>
                ))}
              </select>
              <span className="auth-modal-select-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a05a2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, alignSelf: 'center' }}>Fecha de registro:</div>
            <input
              name="created_at"
              value={user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
              disabled
              className="auth-modal-input"
              placeholder="Fecha de registro"
              style={{ textAlign: 'center' }}
            />
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, alignSelf: 'center' }}>Nueva contraseña:</div>
            <input
              type="password"
              name="password"
              value={passwords.password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              className="auth-modal-input"
              placeholder="Nueva contraseña"
              style={{ textAlign: 'center' }}
            />
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, alignSelf: 'center' }}>Confirmar contraseña:</div>
            <input
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              className="auth-modal-input"
              placeholder="Repite la contraseña"
              style={{ textAlign: 'center' }}
            />
          </div>
          {passwordError && <div className="auth-modal-error">{passwordError}</div>}
          <div style={{ display: 'flex', gap: '1em', marginTop: 8, justifyContent: 'center' }}>
            <button className="auth-modal-submit" type="submit">Guardar</button>
            <button className="auth-modal-submit" type="button" onClick={() => { setEditModalOpen(false); setPasswords({ password: '', confirm: '' }); }}>Cancelar</button>
          </div>
        </form>
      </Modal>
      <div className="perfil-adoptions">
        <h2>Animales que he adoptado</h2>
        {adopted.length === 0 ? (
          <p>No has adoptado ningún animal todavía.</p>
        ) : (
          <ul>
            {adopted.map(animal => (
              <li key={animal.id}>
                <img src={animal.image_url} alt={animal.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, marginRight: 8, verticalAlign: 'middle' }} />
                <b>{animal.name}</b> ({animal.type}) - {animal.breed}, {animal.age} años
              </li>
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
