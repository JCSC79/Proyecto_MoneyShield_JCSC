// src/services/movimientos.api.js

import api from './axios';

// Trae todos los movimientos del usuario autenticado
export async function getMovement() {
  const res = await api.get('/transactions');
  return res.data; // Devuelve array de movimientos o []
}

// Crea un nuevo movimiento
export async function createMovement(data) {
  const res = await api.post('/transactions', data);
  return res.data;
}


export async function getForecast() {
  const res = await api.get('/transactions/report/forecast');
  return res.data;
}

export async function getCategoryExpenses() {
  const res = await api.get('/transactions/report/expenses-by-category');
  return res.data;
}
