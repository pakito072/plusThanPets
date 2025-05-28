import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#" className="footer-link">
          <span className="octicon--law-24" style={{ verticalAlign: 'middle', marginRight: '0.5em' }}></span>
          Textos legales
        </a>
        <a href="#" className="footer-link">
          <span className="ic--outline-privacy-tip" style={{ verticalAlign: 'middle', marginRight: '0.5em' }}></span>
          Política de privacidad
        </a>
        <a href="#" className="footer-link">
          <span className="line-md--cookie" style={{ verticalAlign: 'middle', marginRight: '0.5em' }}></span>
          Política de cookies
        </a>
        <a href="#" className="footer-link">
          <span className="mingcute--contacts-line" style={{ verticalAlign: 'middle', marginRight: '0.5em' }}></span>
          Contacto
        </a>
      </div>
      <div className="footer-copy">
        © {new Date().getFullYear()} +ThanPets. Todos los derechos reservados.
      </div>
    </footer>
  );
}