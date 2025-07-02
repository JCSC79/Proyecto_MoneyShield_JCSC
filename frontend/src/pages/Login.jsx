// src/pages/Login.jsx

import { useState } from 'react';
import { login } from '../services/auth.api';

// Componente de inicio de sesión
function Login({ onLogin }) {
  const [email, setEmail] = useState(''); // Inicializamos el email vacío
  const [password, setPassword] = useState(''); // Inicializamos la contraseña vacía
  const [error, setError] = useState(''); // Inicializamos el error vacío

  const handleSubmit = async (e) => { // Maneja el envío del formulario
    e.preventDefault();
    setError('');
    try {
      const token = await login(email, password);
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ width: '100%' }}>Entrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
