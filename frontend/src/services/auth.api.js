// src/services/auth.api.js

import { jwtDecode } from 'jwt-decode';


export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error de autenticación');
  }

  const data = await response.json(); // data = { token: '...' }
  return data.token; // Devuelve solo el token
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (e) {
    console.error('Error decodificando token:', e);
    return true;
  }
}

