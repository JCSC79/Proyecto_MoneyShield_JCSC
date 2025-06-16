// src/modules/profiles/profile.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 * Obtiene todos los perfiles | Get all profiles
 * @returns {Promise<Array>} Lista de perfiles
 */
export async function getAllProfiles() {
  const [rows] = await db.query('SELECT id, name FROM profiles');
  return rows;
}

/**
 * Crea un nuevo perfil (opcional) | Create new profile (optional)
 * @param {string} name - Nombre del perfil
 * @returns {Promise<Object>} Perfil creado
 */
export async function createProfile(name) {
  const [result] = await db.query('INSERT INTO profiles (name) VALUES (?)', [name]);
  return { id: result.insertId, name };
}
