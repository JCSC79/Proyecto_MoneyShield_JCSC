// src/pages/UserDetailModal.jsx

import '../styles/UserDetailModal.css';

export default function UserDetailModal({ user, onClose }) {
  if (!user) {
    return null;
    }

  return (
    <div className="user-modal-backdrop">
      <div className="user-modal-content">
        <h2>Detalle de Usuario</h2>
        <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Perfil:</strong> {user.profile_id === 1 ? 'Admin' : 'Usuario'}</p>
        <p><strong>Presupuesto base:</strong> {user.base_budget}</p>
        <p><strong>Ahorro base:</strong> {user.base_saving}</p>
        <p><strong>Creado:</strong> {user.created_at ? new Date(user.created_at).toLocaleString('es-ES') : '—'}</p>
        <button className="user-modal-close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
