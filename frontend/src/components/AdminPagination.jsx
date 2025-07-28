// src/components/AdminPagination.jsx

export default function AdminPagination({ pagina, totalPaginas, onChange }) {
    return (
        <div className="admin-pagination">
            <button
                className="admin-pagination-btn"
                onClick={() => onChange(pagina - 1)}
                disabled={pagina === 1}
            >Anterior</button>
            <span className="admin-pagination-current">
                Página {pagina} / {totalPaginas}
            </span>
            <button
                className="admin-pagination-btn"
                onClick={() => onChange(pagina + 1)}
                disabled={pagina === totalPaginas}
            >Siguiente</button>
        </div>
    );
}
