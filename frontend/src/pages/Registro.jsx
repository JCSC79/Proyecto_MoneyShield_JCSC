// src/pages/Registro.jsx

import { useState } from 'react';
import '../styles/Form.css';
import { registerUser } from '../services/users.api';

function Registro() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    profile_id: 2, // usuario normal
    base_budget: '',
    base_saving: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
    try {
      // Envía base_budget y base_saving como número, o 0 si están vacíos
      const data = {
        ...form,
        base_budget: form.base_budget ? Number(form.base_budget) : 0,
        base_saving: form.base_saving ? Number(form.base_saving) : 0
      };
      await registerUser(data);
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        profile_id: 2,
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

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Registro de Usuario</h2>
      <form className="form-base" onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="Nombre"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Apellido"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="base_budget"
          type="number"
          placeholder="Presupuesto base mensual (opcional)"
          value={form.base_budget}
          onChange={handleChange}
          min="0"
        />
        <input
          name="base_saving"
          type="number"
          placeholder="Ahorro base mensual (opcional)"
          value={form.base_saving}
          onChange={handleChange}
          min="0"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
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
