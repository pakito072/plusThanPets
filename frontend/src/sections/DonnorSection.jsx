import React, { useState } from 'react';

export default function DonnorSection() {
  const [form, setForm] = useState({
    type: '',
    name: '',
    breed: '',
    age: '',
    gender: '',
    description: '',
    image_url: '' // Aquí se guardará la URL de Cloudinary
  });
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    // Validación en tiempo real
    if (name === "age" && value && !/^\d{0,2}$/.test(value)) return; // Solo números de hasta 2 dígitos
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
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
      setError(err.message || "Error inesperado al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validaciones
    if (!form.type.trim() || !form.name.trim() || !form.breed.trim() || !form.age || !form.gender || !form.description.trim() || !form.image_url) {
      setError("Por favor, rellena todos los campos y sube una imagen.");
      return;
    }
    if (isNaN(Number(form.age)) || Number(form.age) <= 0) {
      setError("La edad debe ser un número mayor que 0.");
      return;
    }
    setError("");
    const res = await fetch('/api/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, age: Number(form.age) })
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
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al donar el animal. Intenta de nuevo.");
    }
  };

  return (
    <section className="donar-section">
      <h1 className="section-title">Donar</h1>
      <form className="donar-form" onSubmit={handleSubmit}>
        <input name="type" placeholder="Tipo (perro, gato...)*" value={form.type} onChange={handleChange} required />
        <input name="name" placeholder="Nombre*" value={form.name} onChange={handleChange} required />
        <input name="breed" placeholder="Raza*" value={form.breed} onChange={handleChange} required />
        <input name="age" type="number" min="1" max="30" placeholder="Edad*" value={form.age} onChange={handleChange} required />
        <div className="auth-modal-select-wrapper">
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="auth-modal-select"
          >
            <option value="" disabled>Selecciona género*</option>
            <option value="M">Macho</option>
            <option value="F">Hembra</option>
          </select>
          <span className="auth-modal-select-arrow">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <polyline points="6,8 11,14 16,8" fill="none" stroke="#6f3619" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <textarea name="description" placeholder="Descripción*" value={form.description} onChange={handleChange} required />
        <input type="file" accept="image/*" onChange={handleFileChange} required />
        {uploading && <p>Subiendo imagen...</p>}
        {form.image_url && <img src={form.image_url} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, margin: '0 auto' }} />}
        {error && <p className="auth-modal-tooltip error" style={{ marginTop: 8 }}>{error}</p>}
        <button type="submit" disabled={uploading}>Donar animal</button>
      </form>
      {success && <p className="donar-success">¡Animal donado correctamente!</p>}
    </section>
  );
}
