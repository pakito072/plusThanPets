import React, { useEffect, useState } from 'react';

export default function AdoptarSection() {
  const [animals, setAnimals] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch('/api/animals')
      .then(res => res.json())
      .then(data => setAnimals(data));
  }, []);

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <section className="adoptar-section">
      <h1 className="section-title">Adoptar</h1>
      <div className="adoptar-grid">
        {animals.map(animal => (
          <div
            key={animal.id}
            className={`adoptar-card${expanded === animal.id ? ' expanded' : ''}`}
            onClick={() => handleExpand(animal.id)}
          >
            <img src={animal.image_url} alt={animal.name} className="adoptar-card-img" />
            <div className="adoptar-card-main">
              <h2>{animal.name}</h2>
              <span>{animal.breed}</span>
              <span>{animal.age} años</span>
              <span>{animal.gender === 'M' ? 'Macho' : 'Hembra'}</span>
            </div>
            {expanded === animal.id && (
              <div className="adoptar-card-details">
                <p>{animal.description}</p>
                <p>Ubicación: {animal.location_lat}, {animal.location_lng}</p>
                <p>Publicado: {new Date(animal.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
