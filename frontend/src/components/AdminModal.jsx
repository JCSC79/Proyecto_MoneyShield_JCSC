// src/components/AdminModal.jsx

import '../styles/admin.css';
export default function AdminModal({ children, onClose, title }) {
    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div
                className="admin-modal-content"
                onClick={e => e.stopPropagation()}
            >
                {title && <h3>{title}</h3>}
                {children}
            </div>
        </div>
    );
}
