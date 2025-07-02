// src/App.jsx

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevoGasto from './pages/NuevoGasto';
import Perfil from './pages/Perfil';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <BrowserRouter>
      <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
        <nav style={{ marginBottom: 20 }}>
          <a href="/" style={{ marginRight: 12 }}>Dashboard</a>
          <a href="/nuevo-gasto" style={{ marginRight: 12 }}>Nuevo Gasto</a>
          <a href="/perfil" style={{ marginRight: 12 }}>Perfil</a>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              setToken('');
            }}
            style={{ marginLeft: 12 }}
          >
            Cerrar sesión
          </button>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nuevo-gasto" element={<NuevoGasto />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
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
