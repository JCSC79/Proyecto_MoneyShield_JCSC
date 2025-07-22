// src/pages/Login.jsx

import { useState } from 'react';
import '../styles/Form.css';
import { login } from '../services/auth.api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext'; // <-- IMPORTA el contexto

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useAuth(); // <-- Usa setToken del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = await login(email, password);
      setToken(token);
    } catch (err) {
      console.error('Error en login:', err);
      let mensaje = "Correo o contraseña incorrectos";
      if (err.response) {
        // Diferencia usuarios bloqueados de otros errores
        if (err.response.status === 403 && err.response.data?.error) {
          mensaje = err.response.data.error;
        } else if (err.response.data?.error) {
          mensaje = err.response.data.error;
        }
      }
      setError(mensaje);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Iniciar sesión</h2>
      <form className="form-base" onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Correo electrónico"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          label="Contraseña"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Entrar</Button>
        {error && <Alert type="error">{error}</Alert>}
      </form>
    </div>
  );
}

export default Login;
