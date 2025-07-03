// src/services/gastos.api.js

import api from './axios';

// Llama al backend para obtener la lista de gastos (transacciones)
// export async function getGastos() {
//   const res = await api.get('/transactions');
//   return res.data; // Devuelve la lista de gastos
// }


export async function getGastos(token) {
  const res = await api.get('/transactions', {
    headers: {
      Authorization: `Bearer ${token}` // Envía el token en la cabecera de autorización
    }
  });
  return res.data; // Devuelve la lista de gastos
}
