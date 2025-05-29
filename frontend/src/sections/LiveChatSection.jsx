import React from "react";
import "../index.css";

export default function LiveChatSection() {
  return (
    <section className="live-chat-section">
      <div className="live-chat-container expanded">
        <div className="live-chat-header">
          <span className="material-symbols--chat-outline-rounded" style={{ fontSize: 32, marginRight: 14 }} />
          <h1>Chat en tiempo real</h1>
        </div>
        <div className="live-chat-messages">
          <div className="live-chat-placeholder">Aquí aparecerán los mensajes en tiempo real.</div>
        </div>
        <form className="live-chat-form">
          <div className="live-chat-input-wrapper">
            <button className="live-chat-icon-btn live-chat-photo-btn" type="button" disabled title="Subir foto">
              <span className="bitcoin-icons--send-filled" />
            </button>
            <input
              className="live-chat-input"
              type="text"
              placeholder="Escribe un mensaje..."
              disabled
            />
          </div>
          <button className="live-chat-icon-btn live-chat-send-btn-main" type="submit" disabled title="Enviar mensaje">
            <span className="mingcute--send-fill" />
          </button>
        </form>
        <div className="live-chat-disabled-msg">(El chat estará disponible próximamente)</div>
      </div>
    </section>
  );
}
