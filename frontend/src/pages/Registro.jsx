// src/pages/Registro.jsx

import { useState } from 'react';
import '../styles/Form.css';
import { registerUser } from '../services/users.api';
import { login } from '../services/auth.api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Registro() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    base_budget: '',
    base_saving: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [mostrarBotonLogin, setMostrarBotonLogin] = useState(false);
  const [loginData, setLoginData] = useState(null); // <-- NUEVO
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setMostrarBotonLogin(false);
    try {
      const data = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        base_budget: form.base_budget ? Number(form.base_budget) : 0,
        base_saving: form.base_saving ? Number(form.base_saving) : 0
      };
      await registerUser(data);
      setSuccess('¡Registro exitoso! ¿Desea iniciar sesión ahora?');
      setMostrarBotonLogin(true);
      setLoginData({ email: form.email, password: form.password }); // <-- GUARDA datos para login!
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        base_budget: '',
        base_saving: ''
      });
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAutomatico = async () => {
    setLoading(true);
    setError('');
    try {
      // Usa loginData, NO el form
      const token = await login(loginData.email, loginData.password);
      setToken(token);
      navigate('/'); // Redirecciona al dashboard o donde prefieras
    } catch {
      setError('Error al acceder automáticamente. Inicia sesión manualmente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Registro de Usuario</h2>
      <form className="form-base" onSubmit={handleSubmit}>
        <Input
          name="first_name"
          label="Nombre"
          placeholder="Nombre"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <Input
          name="last_name"
          label="Apellido"
          placeholder="Apellido"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="password"
          label="Contraseña"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          name="base_budget"
          label="Presupuesto base mensual (opcional)"
          type="number"
          placeholder="Presupuesto base mensual"
          value={form.base_budget}
          onChange={handleChange}
          min="0"
        />
        <Input
          name="base_saving"
          label="Ahorro base mensual (opcional)"
          type="number"
          placeholder="Ahorro base mensual"
          value={form.base_saving}
          onChange={handleChange}
          min="0"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        {mostrarBotonLogin && (
          <Button type="button" onClick={handleLoginAutomatico} disabled={loading || !loginData}>
            {loading ? 'Entrando...' : 'Entrar ahora'}
          </Button>
        )}
      </form>
      <div style={{ marginTop: 12, fontSize: '0.98em', color: '#555' }}>
        <strong>¿Para qué sirve?</strong><br />
        <em>
          El presupuesto base es el monto mensual que planeas gastar.<br />
          El ahorro base es lo que te gustaría apartar cada mes.<br />
          Ambos campos son opcionales.
        </em>
      </div>
    </div>
  );
}

export default Registro;


