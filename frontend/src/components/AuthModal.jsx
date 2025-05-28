import React, { useState, useEffect, useRef } from 'react';

const GENDERS = [
  { value: '', label: 'Selecciona género', disabled: true },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' },
];

function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default function AuthModal({ open, onClose, onAuth, message }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef();

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm({ username: '', email: '', password: '', gender: '' });
      setMode('login');
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setSelectOpen(false);
      }
    }
    if (selectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectOpen]);

  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (mode === 'register') {
      if (!form.username || form.username.length < 3) newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      if (!form.gender) newErrors.gender = 'Selecciona un género';
    }
    if (!form.email || !validateEmail(form.email)) newErrors.email = 'Introduce un email válido';
    if (!form.password || form.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await onAuth({ ...form, mode });
      // Limpiar los campos tras registro/login exitoso
      setForm({ username: '', email: '', password: '', gender: '' });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else setErrors({ general: err.message || 'Error de autenticación' });
    }
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
  };

  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        {message && (
          <div className={`auth-modal-tooltip ${message.type}`}>{message.text}</div>
        )}
        <button className="auth-modal-close" onClick={onClose}>×</button>
        <h2>{mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</h2>
        <form onSubmit={handleSubmit} className="auth-modal-form">
          {mode === 'register' && (
            <>
              <input
                name="username"
                placeholder="Nombre de usuario *"
                value={form.username}
                onChange={handleChange}
                autoFocus
              />
              {errors.username && <div className="auth-modal-error">{errors.username}</div>}
              <div className="auth-modal-select-wrapper" ref={selectRef}>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="auth-modal-select"
                  onFocus={() => setSelectOpen(true)}
                  onBlur={() => setTimeout(() => setSelectOpen(false), 100)}
                >
                  {GENDERS.map(g => (
                    <option key={g.value} value={g.value} disabled={g.disabled || false} hidden={g.disabled || false}>{g.label}</option>
                  ))}
                </select>
                <span className={`auth-modal-select-arrow${selectOpen ? ' open' : ''}`}>
                  <svg width="22" height="22" viewBox="0 0 22 22" style={{ display: 'block', margin: '0 auto' }}>
                    <polyline
                      points={selectOpen ? '6,14 11,8 16,14' : '6,8 11,14 16,8'}
                      fill="none"
                      stroke="#6f3619"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              {errors.gender && <div className="auth-modal-error">{errors.gender}</div>}
            </>
          )}
          <input
            name="email"
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            autoFocus={mode === 'login'}
          />
          {errors.email && <div className="auth-modal-error">{errors.email}</div>}
          <input
            name="password"
            type="password"
            placeholder="Contraseña *"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <div className="auth-modal-error">{errors.password}</div>}
          {errors.general && <div className="auth-modal-error">{errors.general}</div>}
          <button type="submit" className="auth-modal-submit">
            {mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>
        <div className="auth-modal-switch">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => handleSwitchMode('register')}>Regístrate</button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => handleSwitchMode('login')}>Inicia sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
