// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { getMovement } from '../services/movimientos.api';
import '../styles/Form.css';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { token } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGastos() {
      try {
        const data = await getMovement(token);
        setGastos(data);
      } catch (err) {
        console.error('Error al cargar los movimientos:', err);
        setError('Error al cargar los movimientos');
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      fetchGastos();
    }
  }, [token]);

  if (loading) {
    return <p>Cargando movimientos...</p>;
  }
  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "32px 0" }}>
      <h1 style={{ textAlign: "center", color: "#1976d2", fontWeight: 700 }}>Dashboard MoneyShield</h1>
      <ul className="gastos-lista">
        {gastos.map(gasto => (
          <li
            key={gasto.id}
            className={`gasto-item ${gasto.type_id === 1 ? 'ingreso' : 'gasto'}`}
          >
            <div>
              <span className="gasto-descripcion">{gasto.description || '(Sin descripción)'}</span>
              <div className="gasto-categoria">
                {gasto.category_name || 'Sin categoría'}
              </div>
            </div>
            <span className="gasto-monto">
              {gasto.type_id === 1 ? '+' : '-'}{gasto.amount}€
            </span>
          </li>
        ))}
        {gastos.length === 0 && (
          <li style={{ color: "#888", textAlign: "center", padding: "32px 0" }}>
            No hay movimientos registrados.
          </li>
        )}
      </ul>
    </main>
  );
}

export default Dashboard;
