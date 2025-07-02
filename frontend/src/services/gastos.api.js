// src/services/gastos.api.js

import api from './axios';

// Llama al backend para obtener la lista de gastos (transacciones)
export async function getGastos() {
  const res = await api.get('/transactions');
  return res.data; // Devuelve la lista de gastos
}
