import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "../index.css";

const socket = io("http://localhost:5000", { withCredentials: true });

export default function LiveChatSection({ user, chatType }) {
  const [adoptionChats, setAdoptionChats] = useState([]);
  const [donationChats, setDonationChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // {room_id, ...}
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState({}); // {room_id: true/false}
  const messagesEndRef = useRef(null);

  // Cargar chats del usuario al entrar
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

  const handleMinimize = (room_id) => {
    setMinimized(prev => ({ ...prev, [room_id]: !prev[room_id] }));
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

  const renderChatList = (chats, title) => (
    <div className="live-chat-list-block">
      <h2 className="live-chat-list-title">{title}</h2>
      {chats.length === 0 && <div className="live-chat-list-empty">No hay chats.</div>}
      {chats.map(chat => (
        <div key={chat.room_id} className={`live-chat-list-item${activeChat?.room_id === chat.room_id ? " active" : ""}`}>
          <div className="live-chat-list-main" onClick={() => setActiveChat(chat)}>
            <span className="material-symbols--chat-outline-rounded" style={{ marginRight: 8 }} />
            <span className="live-chat-list-animal">{chat.animal_name}</span>
            <span className="live-chat-list-owner">{chat.owner_name}</span>
          </div>
          <div className="live-chat-list-actions">
            <button className="live-chat-list-btn" onClick={() => handleMinimize(chat.room_id)} title="Comprimir/Expandir">
              {minimized[chat.room_id] ? "🗖" : "🗕"}
            </button>
            <button className="live-chat-list-btn" onClick={() => handleClose(chat.room_id)} title="Cerrar chat">✖</button>
          </div>
        </div>
      ))}
    </div>
  );

  // Mostrar solo la lista de chats correspondiente según chatType
  let chatLists = null;
  if (chatType === "adoptante") {
    chatLists = renderChatList(adoptionChats, "Chats de Adopción");
  } else if (chatType === "donnor") {
    chatLists = renderChatList(donationChats, "Chats de Donaciones");
  } else {
    chatLists = (
      <div className="live-chat-lists">
        {renderChatList(adoptionChats, "Chats de Adopción")}
        {renderChatList(donationChats, "Chats de Donaciones")}
      </div>
    );
  }

  return (
    <section className="live-chat-section">
      <div className="live-chat-container expanded">
        <div className="live-chat-lists">
          {chatLists}
        </div>
        {activeChat && !minimized[activeChat.room_id] && (
          <div className="live-chat-active">
            <div className="live-chat-header">
              <span className="material-symbols--chat-outline-rounded" style={{ fontSize: 32, marginRight: 14 }} />
              <h1>Chat: {activeChat.animal_name}</h1>
            </div>
            <div className="live-chat-messages">
              {messages.length === 0 && (
                <div className="live-chat-placeholder">Aquí aparecerán los mensajes en tiempo real.</div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`live-chat-msg${msg.sender_id === user.id ? " own" : ""}`}>
                  <span className="live-chat-msg-user">{msg.sender_id === user.id ? "Tú" : msg.username || `Usuario ${msg.sender_id}`}</span>
                  <span className="live-chat-msg-text">{msg.message}</span>
                  <span className="live-chat-msg-date">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="live-chat-form" onSubmit={handleSend} autoComplete="off">
              <div className="live-chat-input-wrapper">
                <button className="live-chat-icon-btn live-chat-photo-btn" type="button" disabled title="Subir foto">
                  <span className="bitcoin-icons--send-filled" />
                </button>
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
          </div>
        )}
        {!activeChat && <div className="live-chat-placeholder">Selecciona un chat para comenzar.</div>}
      </div>
    </section>
  );
}
