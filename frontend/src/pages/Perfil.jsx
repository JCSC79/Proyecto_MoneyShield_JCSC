// src/pages/Perfil.jsx

import { useEffect, useState } from 'react';
import { getPerfil } from '../services/users.api';
import '../styles/Form.css';
import Input from '../components/Input';
import Alert from '../components/Alert';

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
        console.error('Error en login:', err);
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
    return <Alert type="error">{error}</Alert>;
  }
  if (!usuario) {
    return null;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Mi Perfil</h1>
      <form className="form-base" autoComplete="off">
        <Input
          label="Nombre"
          type="text"
          value={usuario.first_name}
          disabled
          placeholder="Nombre"
        />
        <Input
          label="Apellido"
          type="text"
          value={usuario.last_name}
          disabled
          placeholder="Apellido"
        />
        <Input
          label="Correo electrónico"
          type="email"
          value={usuario.email}
          disabled
          placeholder="Correo electrónico"
        />
        <Input
          label="Perfil"
          type="text"
          value={usuario.profile_id === 1 ? 'Admin' : 'Usuario'}
          disabled
          placeholder="Perfil"
        />
        <Input
          label="Presupuesto base"
          type="number"
          value={usuario.base_budget}
          disabled
          placeholder="Presupuesto base"
        />
        <Input
          label="Ahorro base"
          type="number"
          value={usuario.base_saving}
          disabled
          placeholder="Ahorro base"
        />
      </form>
    </div>
  );
}

export default Perfil;
