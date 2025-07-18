// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevoMovimiento from './pages/Movimientos';
import Perfil from './pages/Perfil';
import Registro from './pages/Registro';
import Navbar from './components/Navbar'; // Nuevo componente navbar
import AdminDashboard from './pages/AdminDashboard'; // Página de administración
import { useAuth } from './contexts/AuthContext';
import './styles/Navbar.css';

// Rutas públicas
function PublicRoutes() {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/login" end>Iniciar sesión</NavLink>
        <NavLink to="/registro">Registro</NavLink>
      </nav>
      <div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} /> {/* ya NO mandamos onLogin */}
          <Route path="/registro" element={<Registro />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const { token, user } = useAuth(); // Usamos el contexto para obtener el token

  if (!token) {
    return (
      <BrowserRouter>
        <PublicRoutes />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar /> {/* Mostramos navbar siempre que esté logueado */}
      <div style={{ maxWidth: '1100px', margin: 'auto', padding: 32 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nuevo-movimiento" element={<NuevoMovimiento />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
