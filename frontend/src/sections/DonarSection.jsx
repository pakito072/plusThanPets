import React, { useState } from 'react';

export default function DonarSection() {
  const [form, setForm] = useState({
    type: '',
    name: '',
    breed: '',
    age: '',
    gender: '',
    description: '',
    image_url: '',
    location_lat: '',
    location_lng: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('/api/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) setSuccess(true);
  };

  return (
    <section className="donar-section">
      <h1 className="section-title">Donar</h1>
      <form className="donar-form" onSubmit={handleSubmit}>
        <input name="type" placeholder="Tipo (perro, gato...)" value={form.type} onChange={handleChange} required />
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <input name="breed" placeholder="Raza" value={form.breed} onChange={handleChange} required />
        <input name="age" type="number" placeholder="Edad" value={form.age} onChange={handleChange} required />
        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Género</option>
          <option value="M">Macho</option>
          <option value="F">Hembra</option>
        </select>
        <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} required />
        <input name="image_url" placeholder="URL de imagen" value={form.image_url} onChange={handleChange} required />
        <input name="location_lat" placeholder="Latitud" value={form.location_lat} onChange={handleChange} required />
        <input name="location_lng" placeholder="Longitud" value={form.location_lng} onChange={handleChange} required />
        <button type="submit">Donar animal</button>
      </form>
      {success && <p className="donar-success">¡Animal donado correctamente!</p>}
    </section>
  );
}
