// src/pages/UserDetailModal.jsx

import { useState } from 'react';
import '../styles/UserDetailModal.css';

export default function UserDetailModal({ user, onClose, onEdit }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  return (
    <div className="user-modal-backdrop">
      <div className="user-modal-content">
        <h2>Detalle de Usuario</h2>
        {!editando ? (
          <>
            <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Perfil:</strong> {user.profile_id === 1 ? 'Admin' : 'Usuario'}</p>
            <p><strong>Presupuesto base:</strong> {user.base_budget}</p>
            <p><strong>Ahorro base:</strong> {user.base_saving}</p>
            <p><strong>Creado:</strong> {user.created_at ? new Date(user.created_at).toLocaleString('es-ES') : '—'}</p>
            <div className="user-modal-actions">
              <button className="user-modal-edit-btn" onClick={() => setEditando(true)}>
                Editar
              </button>
              <button className="user-modal-close-btn" onClick={onClose}>
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
                <div className="user-modal-actions">
                    <button type="submit" className="user-modal-edit-btn" disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" className="user-modal-close-btn" onClick={handleCancel}>Cancelar</button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
}
