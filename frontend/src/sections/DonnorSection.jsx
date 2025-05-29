import React, { useState } from 'react';
import '../index.css';

export default function DonnorSection() {
  const [form, setForm] = useState({
    type: '',
    name: '',
    breed: '',
    age: '',
    gender: '',
    description: '',
    image_url: ''
  });
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    // Validación en tiempo real
    if (name === "age" && value && !/^\d{0,2}$/.test(value)) return; // Solo números de hasta 2 dígitos
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'presetThanPets');
      const res = await fetch('https://api.cloudinary.com/v1_1/djwl7si04/image/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (!result.secure_url) throw new Error("Error al subir la imagen. Intenta con otra imagen o revisa el formato.");
      let url = result.secure_url;
      url = url.replace('/upload/', '/upload/c_fill,g_auto,h_500,w_500/');
      setForm(f => ({ ...f, image_url: url }));
    } catch (err) {
      setBackendError(err.message || "Error inesperado al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setBackendError("");
    const res = await fetch('/api/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        age: Number(form.age) || 0,
        gender: form.gender, // 'male' o 'female'
        type: form.type // 'dog' o 'cat'
      })
    });
    if (res.ok) {
      setSuccess(true);
      setForm({
        type: '',
        name: '',
        breed: '',
        age: '',
        gender: '',
        description: '',
        image_url: ''
      });
      setShowModal(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setBackendError(data.error || "Error al donar el animal. Intenta de nuevo.");
    }
  };

  return (
    <section className="donar-section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <h1 className="section-title">Donar</h1>
      <div
        className="donnor-add-card" // Cambia la clase para usar los nuevos estilos
        onClick={() => setShowModal(true)}
      >
        <span className="icon-park-solid--add" style={{ color: '#a05a2c', marginBottom: 18 }} />
        <span style={{ color: '#a05a2c', fontWeight: 900, fontSize: '1.18rem', textAlign: 'center' }}>Añadir ficha de donación</span>
      </div>
      {showModal && (
        <div className="adoptar-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="adoptar-modal" onClick={e => e.stopPropagation()}>
            <div className="adoptar-modal-img-col">
              <label htmlFor="donar-image-input" className="adoptar-modal-img" style={{ background: '#f7e3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                {form.image_url ? (
                  <>
                    <img src={form.image_url} alt="preview" className="adoptar-modal-img" style={{ objectFit: 'cover' }} />
                    <button type="button" aria-label="Eliminar imagen" onClick={() => setForm(f => ({ ...f, image_url: '' }))} style={{ position: 'absolute', top: 6, right: 6, background: '#fff8efcc', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px #a05a2c22', cursor: 'pointer', transition: 'background 0.15s' }}>
                      <span style={{ color: '#a05a2c', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>×</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="icon-park-solid--add" style={{ color: '#a05a2c', fontSize: 38, opacity: 0.7 }} />
                    <span style={{ color: '#a05a2c', fontWeight: 700, fontSize: '0.98rem', marginTop: 8, textAlign: 'center' }}>Subir imagen</span>
                  </>
                )}
                <input id="donar-image-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
              {uploading && <p style={{ color: '#a05a2c', fontWeight: 600, fontSize: '0.98rem' }}>Subiendo imagen...</p>}
            </div>
            <form className="donar-form" onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
                <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="auth-modal-select-wrapper">
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="auth-modal-select"
                      required
                    >
                      <option value="" disabled>Selecciona tipo*</option>
                      <option value="dog">Perro</option>
                      <option value="cat">Gato</option>
                      <option value="soon" disabled>Más próximamente...</option>
                    </select>
                  </div>
                  <input name="name" placeholder="Nombre*" value={form.name} onChange={handleChange} required />
                  <input name="breed" placeholder="Raza*" value={form.breed} onChange={handleChange} required />
                </div>
                <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input name="age" type="number" min="1" max="30" placeholder="Edad*" value={form.age} onChange={handleChange} required />
                  <div className="auth-modal-select-wrapper">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="auth-modal-select"
                      required
                    >
                      <option value="" disabled>Selecciona género*</option>
                      <option value="male">Macho</option>
                      <option value="female">Hembra</option>
                    </select>
                    <span className="auth-modal-select-arrow">
                      <svg width="22" height="22" viewBox="0 0 22 22">
                        <polyline points="6,8 11,14 16,8" fill="none" stroke="#6f3619" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  <textarea name="description" placeholder="Descripción*" value={form.description} onChange={handleChange} required style={{ resize: 'vertical', minHeight: 38, maxHeight: 90 }} />
                </div>
              </div>
              {backendError && (
                <div className="auth-modal-tooltip error" style={{ marginBottom: 8 }}>
                  {backendError}
                </div>
              )}
              <div className="adoptar-modal-actions">
                <button
                  type="submit"
                  className="adoptar-modal-chat"
                  disabled={uploading}
                >
                  Donar animal
                </button>
                <button
                  type="button"
                  className="adoptar-modal-close"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
              {success && <p className="donar-success" style={{ color: '#a05a2c', fontWeight: 700, marginTop: 10 }}>¡Animal donado correctamente!</p>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
