// src pages/UserList.jsx

import { useEffect, useState } from 'react';
import api from '../services/axios';
import Input from '../components/Input';
import Alert from '../components/Alert';

export default function UserList() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then(res => setUsuarios(res.data))
      .catch(() => setError('No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false));
  }, []);

  // Filtro simple por nombre, apellido o email:
  const usuariosFiltrados = usuarios.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <Input
        label="Buscar usuario"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Nombre, apellido o email"
      />
      {error && <Alert type="error">{error}</Alert>}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Base Budget</th>
              <th>Base Saving</th>
              {/* Se pueden agregar más columnas según sea necesario */}
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(u => (
              <tr key={u.id}>
                <td>{u.first_name}</td>
                <td>{u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.profile_id === 1 ? 'Admin' : 'Usuario'}</td>
                <td>{u.base_budget}</td>
                <td>{u.base_saving}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
