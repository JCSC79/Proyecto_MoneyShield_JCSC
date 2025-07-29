// src/services/movimientos.api.js

import api from './axios';

// ---- DASHBOARD SUMMARY:  principal para KPIs ----
export async function getDashboardSummary() {
  const res = await api.get('/transactions/report/summary');
  return res.data; // { saldo_actual, gasto_mes, ingreso_mes, proyeccion_mes, movimientos_mes, dias_transcurridos, dias_mes }
}

// PieChart por categoría
export async function getExpensesByCategory() {
  const res = await api.get('/transactions/report/expenses-by-category');
  return res.data;
}

// Últimos movimientos (para el listado clásico)
export async function getRecentMovements(limit = 5) {
  const res = await api.get(`/transactions?limit=${limit}`);
  return res.data;
}

// Alta de movimiento
export async function createMovement(data) {
  const res = await api.post('/transactions', data);
  return res.data;
}
