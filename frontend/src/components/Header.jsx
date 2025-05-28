export default function Header({ onMenuClick, isMenuOpen }) {
  return (
    <button
      className="hamburger"
      onClick={onMenuClick}
      aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      <span>{isMenuOpen ? '×' : '☰'}</span>
    </button>
  );
}