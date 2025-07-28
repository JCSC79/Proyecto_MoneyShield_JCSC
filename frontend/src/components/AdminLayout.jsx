// src/components/AdminLayout.jsx

import '../styles/admin.css';

export default function AdminLayout({ title, children }) {
    return (
        <div className="admin-layout-root">
            <h2 className="admin-page-title">{title}</h2>
            <div>{children}</div>
        </div>
    );
}

