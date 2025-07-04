import api from './axios';

export async function getPerfil(token) {
  const res = await api.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
