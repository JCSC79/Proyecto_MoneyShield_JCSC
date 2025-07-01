// src/modules/profiles/profile.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 * Obtiene todos los perfiles | Get all profiles
 */
export async function getAllProfiles() {
  const [rows] = await db.query('SELECT id, name FROM profiles');
  return rows;
}

/**
 * Crea un nuevo perfil | Create new profile
 */
export async function createProfile(name) {
  const [result] = await db.query('INSERT INTO profiles (name) VALUES (?)', [name]);
  return { id: result.insertId, name };
}

/**
 * Obtiene un perfil por ID | Get profile by ID
 */
export async function getProfileById(id) {
  const [rows] = await db.query('SELECT id, name FROM profiles WHERE id = ?', [id]);
  return rows[0] || null;
}

/**
 * Elimina un perfil | Delete profile
 */
export async function deleteProfile(id) {
  const [result] = await db.query('DELETE FROM profiles WHERE id = ?', [id]);
  return result.affectedRows > 0;
}