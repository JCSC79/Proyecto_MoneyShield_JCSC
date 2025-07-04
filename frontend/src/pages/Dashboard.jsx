// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { getGastos } from '../services/gastos.api';
import './Dashboard.css';

function Dashboard({ token }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGastos() {
      try {
        const data = await getGastos(token);
        setGastos(data);
      } catch (err) {
        console.error('Error al cargar los movimientos:', err);
        setError('Error al cargar los movimientos');
      } finally {
        setLoading(false);
      }
    }
    fetchGastos();
  }, [token]);

  if (loading) {
    return <p>Cargando movimientos...</p>;
  }
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
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

