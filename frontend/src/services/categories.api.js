// src/services/categories.api.js

import api from './axios';

export async function getCategories() {
    const res = await api.get('/categories');
    return res.data; // Devuelve la lista de categorías ejemplo id: 1, name: "General", etc.
}