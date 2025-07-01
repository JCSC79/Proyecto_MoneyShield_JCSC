// src/App.jsx

import { useState, useEffect } from 'react';
import Login from './pages/Login';
import { isTokenExpired } from './services/auth.api';


function App() {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t || isTokenExpired(t)) {
      localStorage.removeItem('token');
      return '';
    }
    return t;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const t = localStorage.getItem('token');
      if (!t || isTokenExpired(t)) {
        localStorage.removeItem('token');
        setToken('');
      }
    }, 60 * 1000); // Verifica cada minuto
    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, []);

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Bienvenido a MoneyShield</h1>
      <p>¡Ya estás autenticado!</p>
      <button onClick={() => {
        localStorage.removeItem('token');
        setToken('');
      }}>Cerrar sesión</button>
      {/* Agregar dashboard acá */}
    </div>
  );
}

export default App;

// function App() {
//   return (
//     <div>
//       <h1>Test de React</h1>
//     </div>
//   );
// }
// export default App;
