// src/pages/Perfil.jsx

import { useEffect, useState } from 'react';
import { getPerfil } from '../services/users.api';
import '../styles/Form.css';

function Perfil({ token }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const data = await getPerfil(token);
        setUsuario(data);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, [token]);

  if (loading) {
    return <p>Cargando perfil...</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!usuario) {
    return null;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Mi Perfil</h1>
      <form className="form-base" autoComplete="off">
        <input type="text" value={usuario.first_name} disabled placeholder="Nombre" />
        <input type="text" value={usuario.last_name} disabled placeholder="Apellido" />
        <input type="email" value={usuario.email} disabled placeholder="Correo electrónico" />
        <input type="text" value={usuario.profile_id === 1 ? 'Admin' : 'Usuario'} disabled placeholder="Perfil" />
        <input type="number" value={usuario.base_budget} disabled placeholder="Presupuesto base" />
        <input type="number" value={usuario.base_saving} disabled placeholder="Ahorro base" />
      </form>
    </div>
  );
}

export default Perfil;
