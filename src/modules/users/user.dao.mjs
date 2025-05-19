// src/modules/users/user.dao.mjs
import db from '../../db/DBHelper.mjs';

/**
 * Obtener todos los usuarios | Get all users
 */
export async function getAllUsers() {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
}

/**
 * Obtener usuario por ID | Get user by ID
 */
export async function getUserById(id) {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Obtener usuario por email | Get user by email
 */
export async function getUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

/**
 * Verificar existencia de profile_id | Check if profile exists
 */
export async function profileExists(profile_id) {
  const [rows] = await db.query('SELECT id FROM profiles WHERE id = ?', [profile_id]);
  return rows.length > 0;
}

/**
 * Crear un nuevo usuario | Create a new user
 */
export async function createUser({ first_name, last_name, email, password_hash, profile_id, base_budget = 0, base_saving = 0 }) {
  const [result] = await db.query(
    'INSERT INTO users (first_name, last_name, email, password_hash, profile_id, base_budget, base_saving) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [first_name, last_name, email, password_hash, profile_id, base_budget, base_saving]
  );
  return { id: result.insertId, first_name, last_name, email, profile_id, base_budget, base_saving };
}

/**
 * Actualizar completamente un usuario | Fully update a user
 */
export async function updateUser(id, { first_name, last_name, email, password_hash, profile_id, base_budget = 0, base_saving = 0 }) {
  const [result] = await db.query(
    'UPDATE users SET first_name = ?, last_name = ?, email = ?, password_hash = ?, profile_id = ?, base_budget = ?, base_saving = ? WHERE id = ?',
    [first_name, last_name, email, password_hash, profile_id, base_budget, base_saving, id]
  );
  return result.affectedRows > 0;
}

/**
 * Actualizar parcialmente un usuario | Partially update a user
 */
export async function patchUser(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return false;
  const values = keys.map(key => fields[key]);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  values.push(id);
  const [result] = await db.query(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

/**
 * Eliminar un usuario | Delete a user
 */
export async function deleteUser(id) {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
