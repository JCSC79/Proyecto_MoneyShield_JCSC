// src/services/users.api.js

import api from './axios';

// Registrar un nuevo usuario
export async function registerUser(data) {
  const payload = { ...data, password_hash: data.password };
  delete payload.password;
  const res = await api.post('/users', payload);
  return res.data;
}

// Obtener el perfil del usuario autenticado
export async function getPerfil(token) {
  const res = await api.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
