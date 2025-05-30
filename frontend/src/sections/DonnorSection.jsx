import React, { useState, useEffect } from 'react';
import '../index.css';
import Modal from '../components/Modal';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetch de animales donados por el usuario con control de sesión y errores
  const fetchMyDonated = async () => {
    setLoading(true);
    setError("");
    setUnauthorized(false);
    try {
      const res = await fetch('/api/animals/my-donated', { credentials: 'include' });
      if (res.status === 401) {
        setUnauthorized(true);
        setMyDonated([]);
      } else if (!res.ok) {
        setError("Error al cargar tus donaciones. Intenta de nuevo más tarde.");
        setMyDonated([]);
      } else {
        const data = await res.json();
        setMyDonated(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo más tarde.");
      setMyDonated([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonated();
  }, [success]);

  // Refrescar lista cada 2 segundos para que desaparezcan los adoptados
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMyDonated();
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
      credentials: 'include',
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
      fetchMyDonated();
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
    const res = await fetch(`/api/animals/${editAnimal.id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setEditAnimal(null);
      setEditForm(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
      fetchMyDonated();
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
    <section className="donar-section donnor-section-flex">
      <h1 className="section-title">Donar</h1>
      <div
        className="donnor-add-card"
        onClick={() => setShowModal(true)}
      >
        <span className="donnor-add-card-title">Añadir ficha de donación</span>
        <span className="basil--add-outline donnor-add-card-icon" />
      </div>
      {/* Grid de animales donados por el usuario */}
      <div className="adoptar-grid donnor-animal-grid">
        {loading ? (
          <div className="donnor-empty-msg">Cargando tus donaciones...</div>
        ) : unauthorized ? (
          <div className="donnor-empty-msg error">Debes iniciar sesión para ver tus donaciones.</div>
        ) : error ? (
          <div className="donnor-empty-msg error">{error}</div>
        ) : myDonated.length === 0 ? (
          <div className="donnor-empty-msg">
            No has donado ningún animal todavía.
          </div>
        ) : (
          myDonated.map(animal => (
            <div key={animal.id} className="adoptar-card donnor-animal-card" onClick={() => handleEditClick(animal)}>
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
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="adoptar-modal-img-col">
          <label htmlFor="donar-image-input" className="adoptar-modal-img donnor-modal-img-label">
            {form.image_url ? (
              <>
                <img src={form.image_url} alt="preview" className="adoptar-modal-img donnor-modal-img-preview" />
                <button type="button" aria-label="Eliminar imagen" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="donnor-modal-img-remove-btn">
                  <span>×</span>
                </button>
              </>
            ) : (
              <>
                <span className="icon-park-solid--add donnor-modal-img-addicon" />
                <span className="donnor-modal-img-addtext">Subir imagen</span>
              </>
            )}
            <input id="donar-image-input" type="file" accept="image/*" onChange={handleFileChange} className="donnor-modal-img-input" />
          </label>
          {uploading && <p className="donnor-modal-uploading">Subiendo imagen...</p>}
        </div>
        <form className="donar-form donnor-modal-form-flex" onSubmit={handleSubmit}>
          <div className="donnor-modal-form-row">
            <div className="donnor-modal-form-col">
              {/* ...inputs... */}
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
            <div className="donnor-modal-form-col">
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
              <textarea name="description" placeholder="Descripción*" value={form.description} onChange={handleChange} required className="donnor-modal-textarea" />
            </div>
          </div>
          {backendError && (
            <div className="auth-modal-tooltip error donnor-modal-error" style={{ marginTop: '2.5em', marginBottom: '0.5em' }}>
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
          {success && <p className="donar-success donnor-modal-success">¡Animal donado correctamente!</p>}
        </form>
      </Modal>
      <Modal open={!!editAnimal && !!editForm} onClose={() => setEditAnimal(null)}>
        {editForm && (
          <>
            <div className="adoptar-modal-img-col">
              <label htmlFor="edit-image-input" className="adoptar-modal-img donnor-modal-img-label">
                {editForm.image_url ? (
                  <>
                    <img src={editForm.image_url} alt={editForm.name} className="adoptar-modal-img donnor-modal-img-preview" />
                    <button type="button" aria-label="Eliminar imagen" onClick={e => { e.stopPropagation(); setEditForm(f => ({ ...f, image_url: '' })); }} className="donnor-modal-img-remove-btn">
                      <span>×</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="icon-park-solid--add donnor-modal-img-addicon" />
                    <span className="donnor-modal-img-addtext">Subir imagen</span>
                  </>
                )}
                <input id="edit-image-input" type="file" accept="image/*" onChange={handleEditFileChange} className="donnor-modal-img-input" />
              </label>
              {editLoading && <p className="donnor-modal_uploading">Subiendo imagen...</p>}
              <h2 className="adoptar-modal-animal-name">{editForm.name}</h2>
            </div>
            <form className="donar-form donnor-modal-form-flex" onSubmit={handleEditSave}>
              <div className="donnor-modal-form-row">
                <div className="donnor-modal-form-col">
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
                <div className="donnor-modal-form-col">
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
                  <textarea name="description" placeholder="Descripción*" value={editForm.description} onChange={handleEditChange} required className="donnor-modal-textarea" />
                </div>
              </div>
              {editError && (
                <div className="auth-modal-tooltip error donnor-modal-error">
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
                  className="adoptar-modal-chat donnor-modal-delete-btn"
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
          </>
        )}
      </Modal>
    </section>
  );
}
