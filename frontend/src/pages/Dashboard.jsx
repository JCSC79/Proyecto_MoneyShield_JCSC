// src/pages/Dashboard.jsx

// function Dashboard() {
//   return (
//     <div>
//       <h1>Dashboard MoneyShield</h1>
//       <p>Bienvenido al panel de control de MoneyShield</p>
//       <p>Aquí veremos gastos, ingresos y estadísticas</p>
//       <button
//         onClick = {() => window.location.href = '/nuevo-gasto'} // Redirige a la página de nuevo gasto /nuevo-gasto
//         style = {{ marginTop: 20 }}
//         >
//         + Añadir nuevo gasto
//       </button>
//     </div>
//   );
// }

// export default Dashboard;

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
