// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { getGastos } from '../services/gastos.api';

function Dashboard() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGastos() {
      try {
        const data = await getGastos();
        setGastos(data);
      } catch (err) {
        console.error('Error al cargar los gastos:', err);
        setError('Error al cargar los gastos');
      } finally {
        setLoading(false);
      }
    }
    fetchGastos();
  }, []);

  if (loading) {
    return <p>Cargando gastos...</p>;
  }
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
}

  return (
    <div>
      <h1>Dashboard MoneyShield</h1>
      <ul>
        {gastos.map(gasto => (
          <li key={gasto.id}>
            {gasto.description} - {gasto.amount} - {gasto.category_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
