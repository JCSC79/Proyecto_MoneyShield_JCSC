// src/services/auth.api.js

import api from './axios';

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });

  return response.data.token; // Devolvemos solo el token
}
