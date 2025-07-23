// src/pages/TransactionsList.jsx

import { useEffect, useState } from 'react';
import api from '../services/axios';
import '../styles/Modals.css';
import '../styles/TransactionsList.css';


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
    <div className="trans-list-root">
      <h2>Transacciones del sistema</h2>
      {/* Filtro de usuario */}
      <div style={{ margin: '18px 0 12px 0' }}>
        <label><strong>Filtrar por usuario:</strong>{' '}
          <select
            value={filtroUsuario}
            onChange={e => { setFiltroUsuario(e.target.value); setPagina(1); }}
            className="trans-filter-select"
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
          <table className="trans-global-table">
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
                    <button
                      className="user-modal-edit-btn"
                      onClick={() => setMovEdit(t)}
                    >Editar</button>
                    <button
                      className="user-modal-close-btn"
                      onClick={() => setTransAEliminar(t)}
                      disabled={movGuardando}
                    >Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición de movimiento */}
      {movEdit && (
        <div className="mini-modal-backdrop">
          <div className="mini-modal-content">
            <h4>Editar transacción #{movEdit.id}</h4>
            <form onSubmit={handleMovEditSave} style={{margin: '12px 0'}}>
              <label>
                <span style={{fontWeight:500}}>Tipo:</span>{' '}
                <select
                  name="type_id"
                  value={movEdit.type_id}
                  onChange={handleMovEditChange}
                  disabled={movGuardando}
                  style={{marginRight:8}}
                >
                  <option value={1}>Ingreso</option>
                  <option value={2}>Gasto</option>
                </select>
              </label>
              <label>
                <span style={{fontWeight:500}}>Categoría:</span>{' '}
                <select
                  name="category_id"
                  value={movEdit.category_id || ''}
                  onChange={handleMovEditChange}
                  disabled={movGuardando}
                  style={{marginRight:8}}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label><br/><br/>
              <label>
                <span style={{fontWeight:500}}>Monto (€):</span>{' '}
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={movEdit.amount}
                  onChange={handleMovEditChange}
                  disabled={movGuardando}
                  style={{width:80, marginRight:8}}
                />
              </label>
              <label>
                <span style={{fontWeight:500}}>Descripción:</span>{' '}
                <input
                  name="description"
                  value={movEdit.description || ''}
                  onChange={handleMovEditChange}
                  maxLength={64}
                  disabled={movGuardando}
                  style={{width:160, marginTop:6}}
                />
              </label>
              <div style={{marginTop:18, display:'flex', gap:12, justifyContent:'center'}}>
                <button
                  className="user-modal-edit-btn"
                  type="submit"
                  disabled={movGuardando}
                >Guardar</button>
                <button
                  className="user-modal-close-btn"
                  type="button"
                  onClick={() => setMovEdit(null)}
                  disabled={movGuardando}
                >Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {transAEliminar && (
        <div className="mini-modal-backdrop">
          <div className="mini-modal-content">
            <h4>¿Eliminar transacción?</h4>
            <p>
              ¿Seguro que deseas eliminar la transacción #{transAEliminar.id}?<br />
              <span style={{color:'#b71c1c'}}>Esta acción no se puede deshacer.</span>
            </p>
            <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:20}}>
              <button
                className="user-modal-edit-btn"
                onClick={handleMovDelete}
                disabled={movGuardando}
              >Eliminar</button>
              <button
                className="user-modal-close-btn"
                onClick={() => setTransAEliminar(null)}
                disabled={movGuardando}
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      {!buscando && totalPaginas > 1 && (
        <div className="trans-pagination" style={{marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
          <button
            className="admin-pagination-btn"
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >Anterior</button>
          <span className="admin-pagination-current">
            Página {pagina} / {totalPaginas}
          </span>
          <button
            className="admin-pagination-btn"
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >Siguiente</button>
        </div>
      )}
    </div>
  );
}
