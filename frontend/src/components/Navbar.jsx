// src/components/Navbar.jsx

import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <NavLink to="/" end>Dashboard</NavLink>
      <NavLink to="/nuevo-movimiento">Movimientos</NavLink>
      <NavLink to="/perfil">Perfil</NavLink>
      {user && (
        <span style={{
          marginLeft: 'auto',
          marginRight: 18,
          color: '#fff',
          fontWeight: 600
        }}>
          {user.first_name} {user.last_name}
        </span>
      )}
      <button onClick={logout}>Cerrar sesión</button>
    </nav>
  );
}

