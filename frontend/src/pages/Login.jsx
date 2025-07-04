// src/pages/Login.jsx

import { useState } from 'react';
import { login } from '../services/auth.api';
import '../styles/Form.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = await login(email, password);
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (err) {
      console.error('Error en login:', err);
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Iniciar sesión</h2>
      <form className="form-base" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default Login;

