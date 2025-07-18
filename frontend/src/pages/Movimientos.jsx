// src/pages/Movimientos.jsx

import { useState, useEffect } from 'react';
import { createMovement } from '../services/movimientos.api';
import { getCategories } from '../services/categories.api';
import '../styles/Form.css';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext'; // <-- IMPORTANTE

function NuevoMovimiento() {
  const { token } = useAuth(); // <-- AQUÍ NUEVO
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
    const { name, value } = e.target;
    if (name === "type_id") {
      setForm(prev => ({
        ...prev,
        type_id: value,
        category_id: ''
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
      console.error('Error al registrar movimiento:', err);
      setError('Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const typeId = Number(form.type_id);
  const filteredCategories = categories.filter(cat =>
    (typeId === 1 && (cat.type === 'income' || cat.type === 'both')) ||
    (typeId === 2 && (cat.type === 'expense' || cat.type === 'both'))
  );

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Registrar ingreso o gasto</h1>
      <form className="form-base" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Tipo de movimiento</label>
          <select
            name="type_id"
            value={form.type_id}
            onChange={handleChange}
            required
            className="input"
          >
            <option value={2}>Gasto</option>
            <option value={1}>Ingreso</option>
          </select>
        </div>
        <Input
          type="number"
          name="amount"
          label="Cantidad"
          placeholder="Cantidad"
          value={form.amount}
          onChange={handleChange}
          required
          min="0.01"
          step="0.01"
        />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Categoría</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Selecciona una categoría</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Input
          type="text"
          name="description"
          label="Descripción"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar'}
        </Button>
        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
      </form>
    </div>
  );
}

export default NuevoMovimiento;
