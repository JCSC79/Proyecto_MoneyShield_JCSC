// src/App.jsx

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevoGasto from './pages/NuevoGasto';
import Perfil from './pages/Perfil';
import './styles/Navbar.css';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <BrowserRouter>
      {/* El navbar ahora está fuera del contenedor para ocupar el ancho total */}
      <nav className="navbar">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/nuevo-gasto">Nuevo Gasto</NavLink>
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
          <Route path="/nuevo-gasto" element={<NuevoGasto token={token}/>} />
          <Route path="/perfil" element={<Perfil token={token} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
