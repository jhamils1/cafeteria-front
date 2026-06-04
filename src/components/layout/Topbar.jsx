import { FaBars, FaRegUser, FaSignOutAlt } from 'react-icons/fa';

function Topbar({ username, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-title-wrap">
        <button type="button" className="icon-button" aria-label="menu">
          <FaBars />
        </button>
        <div>
          <p className="eyebrow">Sistema Administrativo</p>
          <h2>Panel de Cafeteria</h2>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="user-chip">
          <FaRegUser />
          <span>Usuario:</span>
          <strong>{username}</strong>
        </div>
        <button type="button" className="button-secondary" onClick={onLogout}>
          <FaSignOutAlt />
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}

export default Topbar;
