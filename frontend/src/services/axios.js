// src/services/axios.js

import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxy configurado en vite.config.js para que apunte al backend
});

export default api;