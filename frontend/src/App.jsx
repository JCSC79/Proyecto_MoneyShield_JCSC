// src/App.jsx

import { useState } from 'react';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
      <h1>Bienvenido a MoneyShield</h1>
      <p>¡Ya estás autenticado!</p>
      <button onClick={() => {
        localStorage.removeItem('token');
        setToken('');
      }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default App;

// Solo para pruebas, descomentamos el siguiente código para ver si React está funcionando correctamente
// function App() {
//   return (
//     <div>
//       <h1>Test de React</h1>
//     </div>
//   );
// }
// export default App;
