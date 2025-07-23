// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { getMovement } from '../services/movimientos.api';
import '../styles/Form.css';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext'; // <-- NUEVO

function Dashboard() {
  const { token } = useAuth(); // <-- Añadido
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
    if (token) { // Solo intenta cargar si hay token
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
    <div>
      <h1>Dashboard MoneyShield</h1>
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
      </ul>
    </div>
  );
}

export default Dashboard;

