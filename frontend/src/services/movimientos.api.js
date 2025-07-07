// src/services/movimientos.api.js

import api from './axios';

// Funciones para interactuar con la API de gastos
export async function getMovement(token) {
  const res = await api.get('/transactions', {
    headers: {
      Authorization: `Bearer ${token}` // Envía el token en la cabecera de autorización
    }
  });
  return res.data; // Devuelve la lista de gastos
}

export async function createMovement( token, data ) {
  const res = await api.post('/transactions', data, {
    headers: {
      Authorization: `Bearer ${token}` // Envía el token en la cabecera de autorización
    }
  });
  return res.data; // Devuelve el gasto creado
}
