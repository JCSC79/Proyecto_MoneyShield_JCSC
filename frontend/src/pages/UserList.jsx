// src pages/UserList.jsx

import { useEffect, useState } from 'react';
import api from '../services/axios';
import Input from '../components/Input';
import Alert from '../components/Alert';
import UserDetailModal from './UserDetailModal';

export default function UserList() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  // Estado para la paginación
  const [pagina, setPagina] = useState(1);
  const usuariosPorPagina = 10;

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

  // Cálculo de paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const inicio = (pagina - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

  // Al buscar, vuelve siempre a página 1
  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

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
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Base Budget</th>
                <th>Base Saving</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPagina.map(u => (
                <tr
                  key={u.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSeleccionado(u)}
                >
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td>{u.email}</td>
                  <td>{u.profile_id === 1 ? 'Admin' : 'Usuario'}</td>
                  <td>{u.base_budget}</td>
                  <td>{u.base_saving}</td>
                  <td>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })
                      : '—'}
                  </td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={e => {
                        e.stopPropagation();
                        setUsuarioAEliminar(u);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación usando clases de Form.css */}
      {!loading && totalPaginas > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-pagination-btn"
            onClick={() => setPagina(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', display: 'inline' }}>
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
            </svg>
          </button>
          <span className="admin-pagination-current">
            Página {pagina} / {totalPaginas}
          </span>
          <button
            className="admin-pagination-btn"
            onClick={() => setPagina(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', display: 'inline' }}>
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {usuarioAEliminar && (
        <div className="user-modal-backdrop">
          <div className="user-modal-content">
            <h3>¿Eliminar usuario?</h3>
            <p>
              ¿Seguro que deseas eliminar a <strong>{usuarioAEliminar.first_name} {usuarioAEliminar.last_name}</strong>?<br />
              Esta acción no se puede deshacer.
            </p>
            <div className="user-modal-actions">
              <button
                className="admin-delete-btn"
                onClick={async () => {
                  await api.delete(`/users/${usuarioAEliminar.id}`);
                  const refresco = await api.get('/users');
                  setUsuarios(refresco.data);
                  setUsuarioAEliminar(null);
                  setSeleccionado(null); // Por si está abierto el detalle
                }}
              >
                Sí, eliminar
              </button>
              <button
                className="user-modal-close-btn"
                onClick={() => setUsuarioAEliminar(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {seleccionado && (
        <UserDetailModal
          user={seleccionado}
          onClose={() => setSeleccionado(null)}
          onEdit={async (form) => {
            await api.patch(`/users/${form.id}`, {
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              profile_id: Number(form.profile_id),
              base_budget: Number(form.base_budget),
              base_saving: Number(form.base_saving),
            });
            const refresco = await api.get('/users');
            setUsuarios(refresco.data);
            setSeleccionado({ ...form });
          }}
        />
      )}
    </div>
  );
}

