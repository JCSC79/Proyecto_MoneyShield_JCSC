// src/App.jsx

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevoMovimiento from './pages/Movimientos';
import Perfil from './pages/Perfil';
import Registro from './pages/Registro';
import './styles/Navbar.css';

function PublicRoutes({ setToken }) {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/login" end>Iniciar sesión</NavLink>
        <NavLink to="/registro">Registro</NavLink>
      </nav>
      <div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={setToken} />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}


function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  if (!token) {
    return (
      <BrowserRouter>
        <PublicRoutes setToken={setToken} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      {/* El navbar ahora está fuera del contenedor para ocupar el ancho total */}
      <nav className="navbar">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/nuevo-movimiento">Movimientos</NavLink>
        <NavLink to="/perfil">Perfil</NavLink>
        
        <button
          onClick={() => {
            localStorage.removeItem('token');
            setToken('');
          }}
        >
          Cerrar sesión
        </button>
      </nav>
      <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
        <Routes>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/nuevo-movimiento" element={<NuevoMovimiento token={token}/>} />
          <Route path="/perfil" element={<Perfil token={token} />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
