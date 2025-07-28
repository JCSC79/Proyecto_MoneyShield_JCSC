// src pages/UserList.jsx

import { useEffect, useState } from 'react';
import api from '../services/axios';
import Input from '../components/Input';
import Alert from '../components/Alert';
import UserDetailModal from './UserDetailModal';
import AdminLayout from '../components/AdminLayout';
import AdminPagination from '../components/AdminPagination';
import AdminModal from '../components/AdminModal';

export default function UserList() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [usuarioABloquear, setUsuarioABloquear] = useState(null);

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

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / usuariosPorPagina));
  const inicio = (pagina - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

  // Al buscar, vuelve siempre a página 1
  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  return (
    <AdminLayout title="Usuarios">
      <Input
        className="admin-search-input"
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
                <th>Presupuesto Base</th>
                <th>Ahorro Base</th>
                <th>Creado</th>
                <th>Estado</th>
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
                    <span className={u.is_active ? "admin-badge--active" : "admin-badge--inactive"}>
                      {u.is_active ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="admin-btn admin-btn--block"
                        onClick={e => {
                          e.stopPropagation();
                          setUsuarioABloquear(u);
                        }}
                      >
                        {u.is_active ? 'Bloquear' : 'Desbloquear'}
                      </button>
                      <button
                        className="admin-btn admin-btn--delete"
                        onClick={e => {
                          e.stopPropagation();
                          setUsuarioAEliminar(u);
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPaginas > 1 && (
        <AdminPagination
          pagina={pagina}
          totalPaginas={totalPaginas}
          onChange={setPagina}
        />
      )}

      {/* Modal de confirmación de bloqueo/desbloqueo */}
      {usuarioABloquear && (
        <AdminModal
          title={usuarioABloquear.is_active ? '¿Bloquear usuario?' : '¿Desbloquear usuario?'}
          onClose={() => setUsuarioABloquear(null)}
        >
          <p>
            ¿Seguro que deseas {usuarioABloquear.is_active ? 'bloquear' : 'desbloquear'} a
            <strong> {usuarioABloquear.first_name} {usuarioABloquear.last_name}</strong>?
          </p>
          <div className="admin-modal-actions">
            <button
              className="admin-btn admin-btn--block"
              onClick={async () => {
                await api.patch(`/users/${usuarioABloquear.id}`, { is_active: !usuarioABloquear.is_active });
                const refresco = await api.get('/users');
                setUsuarios(refresco.data);
                setUsuarioABloquear(null);
                setSeleccionado(null); // Por si el modal está abierto
              }}
            >
              Sí, {usuarioABloquear.is_active ? 'bloquear' : 'desbloquear'}
            </button>
            <button
              className="admin-btn admin-btn--cancel"
              onClick={() => setUsuarioABloquear(null)}
            >
              Cancelar
            </button>
          </div>
        </AdminModal>
      )}

      {/* Modal de confirmación de eliminación */}
      {usuarioAEliminar && (
        <AdminModal
          title="¿Eliminar usuario?"
          onClose={() => setUsuarioAEliminar(null)}
        >
          <p>
            ¿Seguro que deseas eliminar a <strong>{usuarioAEliminar.first_name} {usuarioAEliminar.last_name}</strong>?<br />
            <span style={{ color: '#b71c1c' }}>Esta acción no se puede deshacer.</span>
          </p>
          <div className="admin-modal-actions">
            <button
              className="admin-btn admin-btn--delete"
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
              className="admin-btn admin-btn--cancel"
              onClick={() => setUsuarioAEliminar(null)}
            >
              Cancelar
            </button>
          </div>
        </AdminModal>
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
    </AdminLayout>
  );
}
