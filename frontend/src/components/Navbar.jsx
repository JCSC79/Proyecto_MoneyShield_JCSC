// src/components/Navbar.jsx

import { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  // Gestión del modo claro/oscuro
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <nav className="navbar">
      <NavLink to="/" end>Dashboard</NavLink>
      <NavLink to="/nuevo-movimiento">Movimientos</NavLink>
      <NavLink to="/perfil">Perfil</NavLink>

      {/* Enlace al admin dashboard general */}
      {user && user.profile_id === 1 && (
        <>
          <NavLink to="/admin">Admin</NavLink>
          {/* Enlace nuevo a panel global de transacciones */}
          <NavLink to="/admin/transactions">Transacciones Globales</NavLink>
        </>
      )}

      {user && (
        <span
          style={{
            marginLeft: 'auto',
            marginRight: 18,
            color: 'var(--color-navbar-text, #fff)',
            fontWeight: 600
          }}
        >
          {user.first_name} {user.last_name}
        </span>
      )}

      {/* Botón toggle tema */}
      <button
        aria-label="Cambiar tema"
        style={{
          background: 'transparent',
          border: 'none',
          marginLeft: '4px',
          marginRight: '8px',
          fontSize: '1.35em',
          cursor: 'pointer',
          color: 'var(--color-navbar-text, #fff)' // Sigue tu tema
        }}
        title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? "🌙" : "🌞"}
      </button>

      <button onClick={logout}>Cerrar sesión</button>
    </nav>
  );
}

