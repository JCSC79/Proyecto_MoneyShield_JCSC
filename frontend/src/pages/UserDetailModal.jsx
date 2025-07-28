// src/pages/UserDetailModal.jsx

import { useEffect, useState } from 'react';
import api from '../services/axios';
import AdminModal from '../components/AdminModal';

export default function UserDetailModal({ user, onClose, onEdit }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [movEdit, setMovEdit] = useState(null);
  const [movGuardando, setMovGuardando] = useState(false);
  const [movAEliminar, setMovAEliminar] = useState(null);

  // Categorías para el selector
  const [categorias, setCategorias] = useState([]);

  // Cargar movimientos de este usuario
  useEffect(() => {
    if (!user) return;
    cargarMovimientos();
    // eslint-disable-next-line
  }, [user]);

  function cargarMovimientos() {
    setLoadingMov(true);
    api
      .get(`/transactions`, { params: { user_id: user.id } })
      .then(res => {
        setMovimientos(res.data.slice(0, 10)); // muestra los 10 más recientes
      })
      .catch(() => setMovimientos([]))
      .finally(() => setLoadingMov(false));
  }

  // Cargar categorías una vez al abrir el modal
  useEffect(() => {
    api
      .get('/categories')
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, []);

  if (!user) return null;

  const handleCancel = () => {
    setForm({ ...user });
    setEditando(false);
    setError('');
    setSuccess('');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setSuccess('');
    try {
      await onEdit(form);
      setSuccess('¡Usuario actualizado!');
      setEditando(false);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      setError('Error al actualizar usuario');
    } finally {
      setGuardando(false);
    }
  };

  // Edición de movimiento individual en la tabla modal
  const handleMovEditChange = e => {
    const { name, value } = e.target;
    setMovEdit(me => ({ ...me, [name]: value }));
  };

  const handleMovEditSave = async (e) => {
    e.preventDefault();
    setMovGuardando(true);
    try {
      await api.patch(`/transactions/${movEdit.id}`, {
        type_id: Number(movEdit.type_id),
        category_id: movEdit.category_id ? Number(movEdit.category_id) : null,
        amount: Number(movEdit.amount),
        description: movEdit.description || null,
      });
      setMovEdit(null);
      cargarMovimientos();
    } catch (err) {
      alert('Error al actualizar el movimiento');
    } finally {
      setMovGuardando(false);
    }
  };

  const handleMovDelete = async () => {
    if (!movAEliminar) return;
    setMovGuardando(true);
    try {
      await api.delete(`/transactions/${movAEliminar.id}`);
      setMovAEliminar(null);
      cargarMovimientos();
    } catch {
      alert('Error al eliminar el movimiento');
    } finally {
      setMovGuardando(false);
    }
  };

  // --- Aquí el render ---
  return (
    <AdminModal onClose={onClose} title="Detalle de Usuario">
      {!editando ? (
        <>
          <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Perfil:</strong> {user.profile_id === 1 ? 'Admin' : 'Usuario'}</p>
          <p><strong>Presupuesto base:</strong> {user.base_budget}</p>
          <p><strong>Ahorro base:</strong> {user.base_saving}</p>
          <p><strong>Creado:</strong> {user.created_at
            ? new Date(user.created_at).toLocaleString('es-ES')
            : '—'}</p>
          {/* Tabla editable de movimientos recientes */}
          <h4 style={{ marginTop: 32 }}>Movimientos recientes (editable)</h4>
          {loadingMov ? (
            <p>Cargando movimientos...</p>
          ) : movimientos.length === 0 ? (
            <p style={{ color: '#888' }}>No hay movimientos registrados.</p>
          ) : (
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              <table className="mini-table-mov">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map(mov => movEdit && movEdit.id === mov.id ? (
                    <tr key={mov.id}>
                      <td>{new Date(mov.created_at).toLocaleDateString('es-ES')}</td>
                      <td>
                        <select name="type_id" value={movEdit.type_id} onChange={handleMovEditChange} disabled={movGuardando}>
                          <option value={1}>Ingreso</option>
                          <option value={2}>Gasto</option>
                        </select>
                      </td>
                      <td>
                        <select
                          name="category_id"
                          value={movEdit.category_id || ''}
                          onChange={handleMovEditChange}
                          style={{ width: 120 }}
                          disabled={movGuardando}
                        >
                          <option value="">Selecciona...</option>
                          {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          name="amount"
                          type="number"
                          value={movEdit.amount}
                          onChange={handleMovEditChange}
                          style={{ width: 75 }}
                          disabled={movGuardando}
                        />
                      </td>
                      <td>
                        <input
                          name="description"
                          value={movEdit.description || ''}
                          onChange={handleMovEditChange}
                          style={{ width: 110 }}
                          maxLength={64}
                          disabled={movGuardando}
                        />
                      </td>
                      <td>
                        <div className="acciones-btns">
                          <button className="admin-btn" onClick={handleMovEditSave} disabled={movGuardando}>
                            Guardar
                          </button>
                          <button className="admin-btn admin-btn--cancel" onClick={() => setMovEdit(null)} disabled={movGuardando}>
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={mov.id}>
                      <td>{new Date(mov.created_at).toLocaleDateString('es-ES')}</td>
                      <td>{mov.type_name}</td>
                      <td>{mov.category_name || '-'}</td>
                      <td style={{ color: mov.type_id === 1 ? "#1976d2" : "#b71c1c" }}>
                        {Number(mov.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </td>
                      <td>{mov.description || '-'}</td>
                      <td>
                        <div className="acciones-btns">
                          <button className="admin-btn" onClick={() => setMovEdit(mov)}>
                            Editar
                          </button>
                          <button className="admin-btn admin-btn--delete" onClick={() => setMovAEliminar(mov)} disabled={movGuardando}>
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

          {/* Modal de confirmación de borrado de movimiento */}
          {movAEliminar && (
            <AdminModal
              title="¿Eliminar movimiento?"
              onClose={() => setMovAEliminar(null)}
            >
              <p>
                ¿Seguro que deseas eliminar este movimiento de {user.first_name} {user.last_name}?<br />
                <span style={{ color: '#b71c1c' }}>Esta acción no se puede deshacer.</span>
              </p>
              <div className="admin-modal-actions">
                <button className="admin-btn admin-btn--delete" onClick={handleMovDelete} disabled={movGuardando}>Eliminar</button>
                <button className="admin-btn admin-btn--cancel" onClick={() => setMovAEliminar(null)} disabled={movGuardando}>Cancelar</button>
              </div>
            </AdminModal>
          )}

          {/* Botones de acción detalle */}
          <div className="admin-modal-actions" style={{ marginTop: 28 }}>
            <button className="admin-btn" onClick={() => setEditando(true)}>
              Editar usuario
            </button>
            <button className="admin-btn admin-btn--cancel" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <label>
            Nombre:
            <input className="input" name="first_name" value={form.first_name} onChange={handleChange} required />
          </label><br/>
          <label>
            Apellido:
            <input className="input" name="last_name" value={form.last_name} onChange={handleChange} required />
          </label><br/>
          <label>
            Email:
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </label><br/>
          <label>
            Perfil:
            <select className="input" name="profile_id" value={form.profile_id} onChange={handleChange}>
              <option value={1}>Admin</option>
              <option value={2}>Usuario</option>
            </select>
          </label><br/>
          <label>
            Presupuesto base:
            <input className="input" type="number" name="base_budget" value={form.base_budget} onChange={handleChange} />
          </label><br/>
          <label>
            Ahorro base:
            <input className="input" type="number" name="base_saving" value={form.base_saving} onChange={handleChange} />
          </label><br/>
          {error && <div className="form-base error">{error}</div>}
          {success && <div className="form-base success">{success}</div>}
          <div className="admin-modal-actions">
            <button type="submit" className="admin-btn" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="admin-btn admin-btn--cancel" onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      )}
    </AdminModal>
  );
}
