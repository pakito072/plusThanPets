import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "../index.css";

const socket = io("http://localhost:5000", { withCredentials: true });

export default function LiveChatSection({ user, chatType }) {
  // Hooks siempre al inicio
  const [adoptionChats, setAdoptionChats] = useState([]);
  const [donationChats, setDonationChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // {room_id, ...}
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [adoptionOpen, setAdoptionOpen] = useState(true);
  const [donationOpen, setDonationOpen] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageModal, setImageModal] = useState(null); // url de imagen ampliada
  const fileInputRef = useRef();

  // Si no hay usuario, mostrar mensaje de acceso restringido
  if (!user) {
    return (
      <div className="restricted-section-msg">
        <h2>Acceso restringido</h2>
        <p>Debes iniciar sesión para acceder a esta sección.</p>
        <button className="auth-modal-submit" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  // El resto de hooks deben ejecutarse siempre, pero su lógica puede depender de user
  useEffect(() => {
    if (!user) return;
    fetch(`/api/chat/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setAdoptionChats(data.adoptionChats || []);
        setDonationChats(data.donationChats || []);
      });
  }, [user]);

  // Cargar historial de mensajes al seleccionar chat
  useEffect(() => {
    if (!activeChat) return;
    fetch(`/api/chat/room/${activeChat.room_id}/messages`)
      .then(res => res.json())
      .then(msgs => {
        setMessages(msgs);
        socket.emit("join_room", { animal_id: activeChat.animal_id });
      });
    // Escuchar mensajes en tiempo real
    socket.off("receive_message");
    socket.on("receive_message", (msg) => {
      if (msg.room_id === activeChat.room_id) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => {
      socket.off("receive_message");
    };
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    socket.emit("send_message", {
      animal_id: activeChat.animal_id,
      sender_id: user.id,
      message: input,
    });
    setInput("");
  };

  const handleClose = (room_id) => {
    if (window.confirm("¿Cerrar este chat? Se eliminará el historial.")) {
      fetch(`/api/chat/room/${room_id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
          setAdoptionChats(chats => chats.filter(c => c.room_id !== room_id));
          setDonationChats(chats => chats.filter(c => c.room_id !== room_id));
          if (activeChat?.room_id === room_id) setActiveChat(null);
        });
    }
  };

  // Subida y envío de imagen
  const handleImageClick = () => {
    if (!user) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    setImageUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'presetThanPets');
      const res = await fetch('https://api.cloudinary.com/v1_1/djwl7si04/image/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (!result.secure_url) throw new Error('Error al subir la imagen.');
      let url = result.secure_url;
      url = url.replace('/upload/', '/upload/c_fill,g_auto,h_500,w_500/');
      // Enviar mensaje con la url de la imagen, marcado como imagen
      socket.emit('send_message', {
        animal_id: activeChat.animal_id,
        sender_id: user.id,
        message: url,
        isImage: true
      });
    } catch {
      alert('Error al subir la imagen.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  // Renderiza la lista de chats como lista simple
  const renderChatList = (chats, title) => (
    <div className="live-chat-list-block" style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0, maxWidth: 'none' }}>
      <h2 className="live-chat-list-title">{title}</h2>
      {chats.length === 0 && (
        <div className="live-chat-list-empty" style={{ textAlign: 'center', padding: '1.5em 0', color: '#a05a2c', opacity: 0.7 }}>
          No hay chats.
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {chats.map(chat => (
          <li key={chat.room_id} style={{ marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: '1em' }}>
            <button style={{ background: 'none', border: 'none', color: '#a05a2c', fontWeight: 700, fontSize: '1.1em', cursor: 'pointer', textAlign: 'left', flex: 1 }} onClick={() => setActiveChat(chat)}>
              <span className="material-symbols--chat-outline-rounded" style={{ marginRight: 8 }} />
              {chat.animal_name} <span style={{ color: '#a05a2c', opacity: 0.7, fontWeight: 400, fontSize: '0.95em', marginLeft: 8 }}>{chat.owner_name}</span>
            </button>
            <button className="live-chat-list-btn" onClick={() => handleClose(chat.room_id)} title="Cerrar chat">✖</button>
          </li>
        ))}
      </ul>
    </div>
  );

  // Nuevo layout: dos columnas horizontales para las listas de chats, cada una desplegable
  let chatLists = null;
  if (chatType === "adoptante") {
    chatLists = renderChatList(adoptionChats, "Chats de Adopción");
  } else if (chatType === "donnor") {
    chatLists = renderChatList(donationChats, "Chats de Donaciones");
  } else {
    chatLists = (
      <div className="live-chat-lists-row" style={{ display: 'flex', flexDirection: 'row', gap: '2.5rem', justifyContent: 'center', width: '100%', marginBottom: '2.5rem' }}>
        <div className="live-chat-list-block" style={{ flex: 1, minWidth: 260, background: 'none', border: 'none', boxShadow: 'none', padding: 0, maxWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            <h2 className="section-title" style={{ fontSize: '1.45rem', color: '#a05a2c', fontWeight: 900, margin: 0, textAlign: 'center', letterSpacing: 0 }}>Chats de Adopción</h2>
            <button onClick={() => setAdoptionOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, padding: 0, display: 'flex', alignItems: 'center' }} aria-label={adoptionOpen ? 'Contraer' : 'Desplegar'}>
              <svg width="22" height="22" viewBox="0 0 22 22" style={{ transform: adoptionOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.18s' }}>
                <polyline points="6,8 11,14 16,8" fill="none" stroke="#a05a2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {adoptionOpen && (
            <>
              {adoptionChats.length === 0 && (
                <div className="live-chat-list-empty" style={{ textAlign: 'center', padding: '1.5em 0', color: '#a05a2c', opacity: 0.7 }}>
                  No hay chats.
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {adoptionChats.map(chat => (
                  <li key={chat.room_id} style={{ marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: '1em' }}>
                    <button
                      style={{ background: 'none', border: 'none', color: '#a05a2c', fontWeight: 700, fontSize: '1.1em', cursor: 'pointer', textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}
                      onClick={() => setActiveChat(activeChat && activeChat.room_id === chat.room_id ? null : chat)}
                    >
                      <span className="material-symbols--chat-outline-rounded" style={{ marginRight: 4 }} />
                      {chat.animal_name} <span style={{ color: '#a05a2c', opacity: 0.7, fontWeight: 400, fontSize: '0.95em', marginLeft: 8 }}>{chat.owner_name}</span>
                      <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 22 22" style={{ transform: activeChat && activeChat.room_id === chat.room_id ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.18s' }}>
                          <polyline points="6,8 11,14 16,8" fill="none" stroke="#a05a2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                    <button className="live-chat-list-btn" onClick={() => handleClose(chat.room_id)} title="Cerrar chat">✖</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="live-chat-list-block" style={{ flex: 1, minWidth: 260, background: 'none', border: 'none', boxShadow: 'none', padding: 0, maxWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            <h2 className="section-title" style={{ fontSize: '1.45rem', color: '#a05a2c', fontWeight: 900, margin: 0, textAlign: 'center', letterSpacing: 0 }}>Chats de Donaciones</h2>
            <button onClick={() => setDonationOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, padding: 0, display: 'flex', alignItems: 'center' }} aria-label={donationOpen ? 'Contraer' : 'Desplegar'}>
              <svg width="22" height="22" viewBox="0 0 22 22" style={{ transform: donationOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.18s' }}>
                <polyline points="6,8 11,14 16,8" fill="none" stroke="#a05a2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {donationOpen && (
            <>
              {donationChats.length === 0 && (
                <div className="live-chat-list-empty" style={{ textAlign: 'center', padding: '1.5em 0', color: '#a05a2c', opacity: 0.7 }}>
                  No hay chats.
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {donationChats.map(chat => (
                  <li key={chat.room_id} style={{ marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: '1em' }}>
                    <button
                      style={{ background: 'none', border: 'none', color: '#a05a2c', fontWeight: 700, fontSize: '1.1em', cursor: 'pointer', textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}
                      onClick={() => setActiveChat(activeChat && activeChat.room_id === chat.room_id ? null : chat)}
                    >
                      <span className="material-symbols--chat-outline-rounded" style={{ marginRight: 4 }} />
                      {chat.animal_name} <span style={{ color: '#a05a2c', opacity: 0.7, fontWeight: 400, fontSize: '0.95em', marginLeft: 8 }}>{chat.owner_name}</span>
                      <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 22 22" style={{ transform: activeChat && activeChat.room_id === chat.room_id ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.18s' }}>
                          <polyline points="6,8 11,14 16,8" fill="none" stroke="#a05a2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                    <button className="live-chat-list-btn" onClick={() => handleClose(chat.room_id)} title="Cerrar chat">✖</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="live-chat-section" style={{ background: '#fff8ef', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0 2rem 0' }}>
      <div className="live-chat-container" style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none', maxWidth: '1100px', width: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: 0 }}>
        <div style={{ width: '100%' }}>
          {chatLists}
        </div>
        {activeChat && (
          <div className="live-chat-active" style={{ background: '#fff8ef', borderRadius: '22px', boxShadow: '0 4px 32px #ffcf8e55', padding: '0', margin: '2rem auto 0 auto', maxWidth: '1100px', minWidth: '320px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em', padding: '2rem 2.5rem 1.3rem 2.5rem', borderRadius: '22px 22px 0 0', borderBottom: '2px solid #ffcf8e', background: 'none' }}>
              <span className="material-symbols--chat-outline-rounded" style={{ fontSize: 32, marginRight: 14 }} />
              <h1 style={{ fontSize: '1.7rem', color: '#6f3619', fontWeight: 900, margin: 0 }}>Chat: {activeChat.animal_name}</h1>
            </div>
            <div className="live-chat-messages" style={{ flex: 1, padding: '1.5rem 2.5rem 0.7rem 2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.9em' }}>
              {messages.length === 0 && (
                <div className="live-chat-placeholder">Aquí aparecerán los mensajes en tiempo real.</div>
              )}
              {messages.map((msg, i) => {
                // Si el mensaje es una imagen (url de imagen), mostrar como imagen
                const isImage = (msg.isImage || (typeof msg.message === 'string' && msg.message.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)));
                return (
                  <div key={i} className={`live-chat-msg${msg.sender_id === user.id ? " own" : ""}`}>
                    <span className="live-chat-msg-user">{msg.sender_id === user.id ? "Tú" : msg.username || `Usuario ${msg.sender_id}`}</span>
                    {isImage ? (
                      <img
                        src={msg.message}
                        alt="Imagen enviada"
                        className="live-chat-msg-img"
                        style={{ maxWidth: 220, maxHeight: 220, borderRadius: 12, cursor: 'pointer', margin: '0.5em 0' }}
                        onClick={() => setImageModal(msg.message)}
                      />
                    ) : (
                      <span className="live-chat-msg-text">{msg.message}</span>
                    )}
                    <span className="live-chat-msg-date">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form className="live-chat-form" onSubmit={handleSend} autoComplete="off">
              <div className="live-chat-input-wrapper">
                <button
                  className="live-chat-icon-btn live-chat-photo-btn"
                  type="button"
                  onClick={handleImageClick}
                  disabled={imageUploading || !user}
                  title="Subir foto"
                >
                  <span className="bitcoin-icons--send-filled" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <input
                  className="live-chat-input"
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={!user}
                />
              </div>
              <button className="live-chat-icon-btn live-chat-send-btn-main" type="submit" disabled={!input.trim() || !user} title="Enviar mensaje">
                <span className="mingcute--send-fill" />
              </button>
            </form>
            {imageUploading && <div style={{ color: '#a05a2c', fontWeight: 600, fontSize: '1rem', textAlign: 'center', margin: '0.5em 0' }}>Subiendo imagen...</div>}
          </div>
        )}
        {!activeChat && <div className="live-chat-placeholder">Selecciona un chat para comenzar.</div>}
        {/* Modal de imagen ampliada */}
        {imageModal && (
          <div className="adoptar-modal-backdrop" style={{ zIndex: 3000 }} onClick={() => setImageModal(null)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <img src={imageModal} alt="Imagen ampliada" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 18, boxShadow: '0 4px 32px #ffcf8e99' }} onClick={e => e.stopPropagation()} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
