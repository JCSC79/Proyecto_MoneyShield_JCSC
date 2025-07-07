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
    profile_id: 2 // usuario normal
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await registerUser(form);
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setForm({ first_name: '', last_name: '', email: '', password: '', profile_id: 2 });
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
        <input name="first_name" placeholder="Nombre" value={form.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Apellido" value={form.last_name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default Registro;
