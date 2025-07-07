// src/pages/Movimientos.jsx

import { useState, useEffect } from 'react';
import { createMovement } from '../services/movimientos.api';
import { getCategories } from '../services/categories.api';
import '../styles/Form.css';

function NuevoMovimiento({ token }) {
  const [form, setForm] = useState({
    amount: '',
    category_id: '',
    description: '',
    type_id: 2 // 2 = gasto, 1 = ingreso
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Error al cargar categorías'));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = {
        ...form,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
        type_id: Number(form.type_id)
      };
      await createMovement(token, data);
      setSuccess('¡Registro exitoso!');
      setForm({ amount: '', category_id: '', description: '', type_id: 2 });
    } catch (err) {
      console.error('Error al registrar el movimiento:', err);
      setError('Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Registrar ingreso o gasto</h1>
      <form className="form-base" onSubmit={handleSubmit}>
        <select
          name="type_id"
          value={form.type_id}
          onChange={handleChange}
          required
        >
          <option value={2}>Gasto</option>
          <option value={1}>Ingreso</option>
        </select>
        <input
          type="number"
          name="amount"
          placeholder="Cantidad"
          value={form.amount}
          onChange={handleChange}
          required
          min="0.01"
          step="0.01"
        />
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="text"
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar'}
        </button>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default NuevoMovimiento;
