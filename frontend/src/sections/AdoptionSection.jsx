// ...existing code...
import React, { useState, useEffect } from 'react';

export default function AdoptionSection({ setSection, setChatAnimal }) {
  const [animals, setAnimals] = useState([]);
  const [modalAnimal, setModalAnimal] = useState(null);

  useEffect(() => {
    fetch('/api/animals?available=1')
      .then(res => res.json())
      .then(data => setAnimals(data));
  }, []);

  const handleChat = (animal) => {
    if (setChatAnimal) setChatAnimal(animal);
    if (setSection) setSection('chat');
    setModalAnimal(null);
  };

  return (
    <section className="adoptar-section">
      <h1 className="section-title">Adoptar</h1>
      <div className="adoptar-grid">
        {animals.map(animal => (
          <div
            key={animal.id}
            className="adoptar-card"
            onClick={() => setModalAnimal(animal)}
          >
            <img src={animal.image_url} alt={animal.name} className="adoptar-card-img" />
            <div className="adoptar-card-main">
              <h2>{animal.name}</h2>
            </div>
          </div>
        ))}
      </div>
      {modalAnimal && (
        <div className="adoptar-modal-backdrop" onClick={() => setModalAnimal(null)}>
          <div className="adoptar-modal" onClick={e => e.stopPropagation()}>
            <img src={modalAnimal.image_url} alt={modalAnimal.name} className="adoptar-modal-img" />
            <div className="adoptar-modal-info">
              <h2>{modalAnimal.name}</h2>
              <p><b>Tipo:</b> {modalAnimal.type === 'dog' ? 'Perro' : 'Gato'}</p>
              <p><b>Raza:</b> {modalAnimal.breed}</p>
              <p><b>Edad:</b> {modalAnimal.age} años</p>
              <p><b>Género:</b> {modalAnimal.gender === 'male' ? 'Macho' : 'Hembra'}</p>
              <p><b>Descripción:</b> {modalAnimal.description}</p>
              <p><b>Publicado:</b> {new Date(modalAnimal.created_at).toLocaleDateString()}</p>
              <button className="adoptar-modal-chat" onClick={() => handleChat(modalAnimal)}>
                <span className="material-symbols--chat-outline-rounded" style={{ marginRight: 8, fontSize: 22 }} />
                Chat
              </button>
              <button className="adoptar-modal-close" onClick={() => setModalAnimal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
// ...existing code...
