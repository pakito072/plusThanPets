import React, { useState, useEffect } from 'react';
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
  const [myDonated, setMyDonated] = useState([]);
  const [editAnimal, setEditAnimal] = useState(null); // animal a editar
  const [editForm, setEditForm] = useState(null); // datos editables
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetch('/api/animals/my-donated')
      .then(res => res.json())
      .then(data => setMyDonated(data));
  }, [success]);

  // Refrescar lista cada 2 segundos para que desaparezcan los adoptados
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/animals/my-donated')
        .then(res => res.json())
        .then(data => setMyDonated(data));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
      setTimeout(() => setSuccess(false), 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setBackendError(data.error || "Error al donar el animal. Intenta de nuevo.");
    }
  };

  // Al hacer clic en una card, abrir modal de edición
  const handleEditClick = animal => {
    setEditAnimal(animal);
    setEditForm({ ...animal });
    setEditError("");
  };

  // Cambios en el formulario de edición
  const handleEditChange = e => {
    const { name, value } = e.target;
    if (name === "age" && value && !/^[0-9]{0,2}$/.test(value)) return;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  // Guardar cambios
  const handleEditSave = async e => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    const res = await fetch(`/api/animals/${editAnimal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editForm,
        age: Number(editForm.age) || 0,
        gender: editForm.gender,
        type: editForm.type
      })
    });
    if (res.ok) {
      setEditAnimal(null);
      setEditForm(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
      // Refrescar lista
      fetch('/api/animals/my-donated')
        .then(res => res.json())
        .then(data => setMyDonated(data));
    } else {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error || "Error al guardar cambios.");
    }
    setEditLoading(false);
  };

  // Eliminar ficha
  const handleEditDelete = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar esta ficha? Esta acción no se puede deshacer.")) return;
    setDeleteLoading(true);
    setEditError("");
    const res = await fetch(`/api/animals/${editAnimal.id}`, { method: 'DELETE' });
    if (res.ok) {
      setEditAnimal(null);
      setEditForm(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
      fetch('/api/animals/my-donated')
        .then(res => res.json())
        .then(data => setMyDonated(data));
    } else {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error || "Error al eliminar la ficha.");
    }
    setDeleteLoading(false);
  };

  // Cambiar imagen en el modal de edición
  const handleEditFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setEditLoading(true);
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
      setEditForm(f => ({ ...f, image_url: url }));
    } catch (err) {
      setEditError(err.message || "Error inesperado al subir la imagen");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <section className="donar-section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <h1 className="section-title">Donar</h1>
      <div
        className="donnor-add-card"
        onClick={() => setShowModal(true)}
      >
        <span style={{ color: '#a05a2c', fontWeight: 900, fontSize: '1.18rem', textAlign: 'center' }}>Añadir ficha de donación</span>
        <span className="basil--add-outline" style={{ color: '#a05a2c', marginTop: 8 }} />
      </div>
      {/* Grid de animales donados por el usuario */}
      <div className="adoptar-grid" style={{ marginTop: 32, marginBottom: 24 }}>
        {myDonated.length === 0 ? (
          <div style={{ gridColumn: '1/-1', color: '#a05a2c', opacity: 0.7, textAlign: 'center', fontWeight: 600, fontSize: '1.1rem', padding: '2em 0' }}>
            No has donado ningún animal todavía.
          </div>
        ) : (
          myDonated.map(animal => (
            <div key={animal.id} className="adoptar-card" style={{ cursor: 'pointer' }} onClick={() => handleEditClick(animal)}>
              <img src={animal.image_url} alt={animal.name} className="adoptar-card-img" />
              <div className="adoptar-card-main">
                <h2 className="adoptar-card-title">{animal.name}</h2>
                <div className="adoptar-card-info">{animal.type === 'dog' ? 'Perro' : 'Gato'} • {animal.breed}</div>
                <div className="adoptar-card-info">{animal.age} años • {animal.gender === 'male' ? 'Macho' : 'Hembra'}</div>
                <div className="adoptar-card-desc">{animal.description}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal de añadir ficha */}
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
      {/* Modal de edición/eliminación */}
      {editAnimal && editForm && (
        <div className="adoptar-modal-backdrop" onClick={() => setEditAnimal(null)}>
          <div className="adoptar-modal" onClick={e => e.stopPropagation()}>
            <div className="adoptar-modal-img-col">
              <label htmlFor="edit-image-input" className="adoptar-modal-img" style={{ background: '#f7e3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                {editForm.image_url ? (
                  <>
                    <img src={editForm.image_url} alt={editForm.name} className="adoptar-modal-img" style={{ objectFit: 'cover' }} />
                    <button type="button" aria-label="Eliminar imagen" onClick={e => { e.stopPropagation(); setEditForm(f => ({ ...f, image_url: '' })); }} style={{ position: 'absolute', top: 6, right: 6, background: '#fff8efcc', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px #a05a2c22', cursor: 'pointer', transition: 'background 0.15s' }}>
                      <span style={{ color: '#a05a2c', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>×</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="icon-park-solid--add" style={{ color: '#a05a2c', fontSize: 38, opacity: 0.7 }} />
                    <span style={{ color: '#a05a2c', fontWeight: 700, fontSize: '0.98rem', marginTop: 8, textAlign: 'center' }}>Subir imagen</span>
                  </>
                )}
                <input id="edit-image-input" type="file" accept="image/*" onChange={handleEditFileChange} style={{ display: 'none' }} />
              </label>
              {editLoading && <p style={{ color: '#a05a2c', fontWeight: 600, fontSize: '0.98rem' }}>Subiendo imagen...</p>}
              <h2 className="adoptar-modal-animal-name">{editForm.name}</h2>
            </div>
            <form className="donar-form" onSubmit={handleEditSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
                <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="auth-modal-select-wrapper">
                    <select
                      name="type"
                      value={editForm.type}
                      onChange={handleEditChange}
                      className="auth-modal-select"
                      required
                    >
                      <option value="" disabled>Selecciona tipo*</option>
                      <option value="dog">Perro</option>
                      <option value="cat">Gato</option>
                      <option value="soon" disabled>Más próximamente...</option>
                    </select>
                  </div>
                  <input name="name" placeholder="Nombre*" value={editForm.name} onChange={handleEditChange} required />
                  <input name="breed" placeholder="Raza*" value={editForm.breed} onChange={handleEditChange} required />
                </div>
                <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input name="age" type="number" min="1" max="30" placeholder="Edad*" value={editForm.age} onChange={handleEditChange} required />
                  <div className="auth-modal-select-wrapper">
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
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
                  <textarea name="description" placeholder="Descripción*" value={editForm.description} onChange={handleEditChange} required style={{ resize: 'vertical', minHeight: 38, maxHeight: 90 }} />
                </div>
              </div>
              {editError && (
                <div className="auth-modal-tooltip error" style={{ marginBottom: 8 }}>
                  {editError}
                </div>
              )}
              <div className="adoptar-modal-actions">
                <button
                  type="submit"
                  className="adoptar-modal-chat"
                  disabled={editLoading}
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="adoptar-modal-chat"
                  style={{ background: '#fff', color: '#a05a2c', border: '1.5px solid #a05a2c' }}
                  onClick={handleEditDelete}
                  disabled={deleteLoading}
                >
                  Eliminar ficha
                </button>
                <button
                  type="button"
                  className="adoptar-modal-close"
                  onClick={() => setEditAnimal(null)}
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
