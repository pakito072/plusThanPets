// ...existing code...
import Modal from '../components/Modal';
import React, { useState, useEffect } from 'react';

export default function AdoptionSection({ setSection, setChatAnimal }) {
  const [animals, setAnimals] = useState([]);
  const [modalAnimal, setModalAnimal] = useState(null);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    fetch('/api/animals?available=1')
      .then(res => res.json())
      .then(data => setAnimals(data));
  }, []);

  // Refrescar lista cuando se adopta un animal (por si vuelve del chat)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/animals?available=1')
        .then(res => res.json())
        .then(data => setAnimals(data));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Nuevo handleChat con validación
  const handleChat = async (animal) => {
    setChatError("");
    // Comprobar si el usuario ya tiene un chat de adopción abierto
    const res = await fetch('/api/users/me', { credentials: 'include' });
    if (!res.ok) {
      setChatError("Debes iniciar sesión para usar el chat.");
      return;
    }
    const user = await res.json();
    const chatsRes = await fetch(`/api/chat/user/${user.id}`);
    const chatsData = await chatsRes.json();
    if ((chatsData.adoptionChats || []).length > 0) {
      setChatError("Solo puedes tener un chat de adopción abierto a la vez. Cierra el anterior para abrir uno nuevo.");
      return;
    }
    // Guardar el animal a abrir en localStorage para que LiveChatSection lo recoja
    localStorage.setItem('openChatAnimalId', animal.id);
    if (setSection) setSection('chats');
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
      <Modal open={!!modalAnimal} onClose={() => setModalAnimal(null)}>
        {modalAnimal && (
          <>
            <div className="adoptar-modal-img-col">
              <img src={modalAnimal.image_url} alt={modalAnimal.name} className="adoptar-modal-img" />
              <h2 className="adoptar-modal-animal-name">{modalAnimal.name}</h2>
            </div>
            <div className="adoptar-modal-info-wrapper">
            <div className="adoptar-modal-info-cols">
              <div className="adoptar-modal-info-col">
                <p><b>Tipo:</b> {modalAnimal.type === 'dog' ? 'Perro' : 'Gato'}</p>
                <p><b>Raza:</b> {modalAnimal.breed}</p>
                <p><b>Edad:</b> {modalAnimal.age} años</p>
              </div>
              <div className="adoptar-modal-info-col">
                <p><b>Género:</b> {modalAnimal.gender === 'male' ? 'Macho' : 'Hembra'}</p>
                <p><b>Descripción:</b> {modalAnimal.description}</p>
                <p><b>Publicado:</b> {new Date(modalAnimal.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {chatError && <div className="auth-modal-tooltip error" style={{ margin: '0 auto 1em auto', maxWidth: 400, textAlign: 'center' }}>{chatError}</div>}
            <div className="adoptar-modal-actions">
              <button className="adoptar-modal-chat" onClick={() => handleChat(modalAnimal)}>
                Chat
              </button>
              <button className="adoptar-modal-close" onClick={() => setModalAnimal(null)}>
                Cerrar</button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
// ...existing code...
