// src/pages/TransactionsList.jsx

import { useEffect, useState } from 'react';
import api from '../services/axios';
import AdminLayout from '../components/AdminLayout';
import AdminPagination from '../components/AdminPagination';
import AdminModal from '../components/AdminModal';

export default function TransactionsList() {
  const [trans, setTrans] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [movEdit, setMovEdit] = useState(null);
  const [movGuardando, setMovGuardando] = useState(false);
  const [transAEliminar, setTransAEliminar] = useState(null);
  const porPagina = 20;

  useEffect(() => {
    api.get('/users').then(res => setUsuarios(res.data)).catch(() => setUsuarios([]));
  }, []);
  useEffect(() => {
    api.get('/categories').then(res => setCategorias(res.data)).catch(() => setCategorias([]));
  }, []);
  useEffect(() => {
    setBuscando(true);
    const params = {};
    if (filtroUsuario) params.user_id = filtroUsuario;
    api.get('/transactions', { params })
      .then(res => setTrans(res.data))
      .catch(() => setTrans([]))
      .finally(() => setBuscando(false));
  }, [filtroUsuario]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(trans.length / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const transPagina = trans.slice(inicio, fin);

  // Edición de movimiento individual en el modal
  const handleMovEditChange = e => {
    const { name, value } = e.target;
    setMovEdit(me => ({ ...me, [name]: value }));
  };
  const handleMovEditSave = async e => {
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
      const params = {};
      if (filtroUsuario) params.user_id = filtroUsuario;
      const refresco = await api.get('/transactions', { params });
      setTrans(refresco.data);
    } catch {
      alert("No se pudo guardar el cambio");
    } finally {
      setMovGuardando(false);
    }
  };

  // Modal de confirmación para borrado
  const handleMovDelete = async () => {
    if (!transAEliminar) return;
    setMovGuardando(true);
    try {
      await api.delete(`/transactions/${transAEliminar.id}`);
      setTransAEliminar(null);
      const params = {};
      if (filtroUsuario) params.user_id = filtroUsuario;
      const refresco = await api.get('/transactions', { params });
      setTrans(refresco.data);
    } catch {
      alert("No se pudo eliminar la transacción");
    } finally {
      setMovGuardando(false);
    }
  };

  return (
    <AdminLayout title="Transacciones del sistema">
      {/* Filtro de usuario */}
      <div style={{ margin: '18px 0 12px 0' }}>
        <label><strong>Filtrar por usuario:</strong>{' '}
          <select
            value={filtroUsuario}
            onChange={e => { setFiltroUsuario(e.target.value); setPagina(1); }}
            className="admin-filter-select"
          >
            <option value="">(Todos los usuarios)</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
            ))}
          </select>
        </label>
      </div>

      {/* Tabla de transacciones */}
      {buscando ? (
        <p>Cargando transacciones...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-trans-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Monto (€)</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transPagina.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.user_email}</td>
                  <td>{new Date(t.created_at).toLocaleString('es-ES')}</td>
                  <td>{t.type_name}</td>
                  <td>{t.category_name || '-'}</td>
                  <td style={{ color: t.type_id === 1 ? "#1976d2" : "#b71c1c" }}>
                    {Number(t.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </td>
                  <td>{t.description || '-'}</td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="admin-btn"
                        onClick={() => setMovEdit(t)}
                      >Editar</button>
                      <button
                        className="admin-btn admin-btn--delete"
                        onClick={() => setTransAEliminar(t)}
                        disabled={movGuardando}
                      >Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición de movimiento */}
      {movEdit && (
        <AdminModal
          title={`Editar transacción #${movEdit.id}`}
          onClose={() => setMovEdit(null)}
        >
          <form onSubmit={handleMovEditSave} style={{ margin: '12px 0' }}>
            <label>
              <span style={{ fontWeight: 500 }}>Tipo:</span>{' '}
              <select
                name="type_id"
                value={movEdit.type_id}
                onChange={handleMovEditChange}
                disabled={movGuardando}
                style={{ marginRight: 8 }}
              >
                <option value={1}>Ingreso</option>
                <option value={2}>Gasto</option>
              </select>
            </label>
            <label>
              <span style={{ fontWeight: 500 }}>Categoría:</span>{' '}
              <select
                name="category_id"
                value={movEdit.category_id || ''}
                onChange={handleMovEditChange}
                disabled={movGuardando}
                style={{ marginRight: 8 }}
              >
                <option value="">Sin categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label><br /><br />
            <label>
              <span style={{ fontWeight: 500 }}>Monto (€):</span>{' '}
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={movEdit.amount}
                onChange={handleMovEditChange}
                disabled={movGuardando}
                style={{ width: 80, marginRight: 8 }}
              />
            </label>
            <label>
              <span style={{ fontWeight: 500 }}>Descripción:</span>{' '}
              <input
                name="description"
                value={movEdit.description || ''}
                onChange={handleMovEditChange}
                maxLength={64}
                disabled={movGuardando}
                style={{ width: 160, marginTop: 6 }}
              />
            </label>
            <div className="admin-modal-actions" style={{ marginTop: 18 }}>
              <button
                className="admin-btn"
                type="submit"
                disabled={movGuardando}
              >Guardar</button>
              <button
                className="admin-btn admin-btn--cancel"
                type="button"
                onClick={() => setMovEdit(null)}
                disabled={movGuardando}
              >Cancelar</button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Modal de confirmación de borrado */}
      {transAEliminar && (
        <AdminModal
          title="¿Eliminar transacción?"
          onClose={() => setTransAEliminar(null)}
        >
          <p>
            ¿Seguro que deseas eliminar la transacción #{transAEliminar.id}?<br />
            <span style={{ color: '#b71c1c' }}>Esta acción no se puede deshacer.</span>
          </p>
          <div className="admin-modal-actions">
            <button
              className="admin-btn admin-btn--delete"
              onClick={handleMovDelete}
              disabled={movGuardando}
            >Eliminar</button>
            <button
              className="admin-btn admin-btn--cancel"
              onClick={() => setTransAEliminar(null)}
              disabled={movGuardando}
            >Cancelar</button>
          </div>
        </AdminModal>
      )}

      {/* Paginación */}
      {!buscando && totalPaginas > 1 && (
        <AdminPagination
          pagina={pagina}
          totalPaginas={totalPaginas}
          onChange={setPagina}
        />
      )}
    </AdminLayout>
  );
}
