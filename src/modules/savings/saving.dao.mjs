import db from '../../db/DBHelper.mjs';

/**
 * Obtener todos los ahorros de un usuario
 * Get all savings for a user
 */
export async function getAllSavings(user_id) {
  const [rows] = await db.query(
    `SELECT id, user_id, type_id, name, amount, target_amount, target_date, created_at
     FROM savings
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [user_id]
  );
  return rows;
}

/**
 * Obtener un ahorro por ID
 * Get saving by ID
 */
export async function getSavingById(id) {
  const [rows] = await db.query(
    `SELECT id, user_id, type_id, name, amount, target_amount, target_date, created_at
     FROM savings
     WHERE id = ?`,
    [id]
  );
  return rows[0];
}

/**
 * Crear un nuevo ahorro
 * Create a new saving
 */
export async function createSaving({ user_id, type_id, name, amount, target_amount = null, target_date = null }, connection = db) {
  const [result] = await connection.query(
    `INSERT INTO savings (user_id, type_id, name, amount, target_amount, target_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, type_id, name, amount, target_amount, target_date]
  );
  return { id: result.insertId, user_id, type_id, name, amount, target_amount, target_date };
}

/**
 * Actualizar completamente un ahorro
 * Fully update a saving
 */
export async function updateSaving(id, { type_id, name, amount, target_amount = null, target_date = null }) {
  const [result] = await db.query(
    `UPDATE savings
     SET type_id = ?, name = ?, amount = ?, target_amount = ?, target_date = ?
     WHERE id = ?`,
    [type_id, name, amount, target_amount, target_date, id]
  );
  return result.affectedRows > 0;
}

/**
 * Actualizar parcialmente un ahorro
 * Partially update a saving
 */
export async function patchSaving(id, fields) {
  const allowedFields = ['type_id', 'name', 'amount', 'target_amount', 'target_date'];
  const keys = Object.keys(fields).filter(k => allowedFields.includes(k));
  if (keys.length === 0) {
    return false;
  }
  const values = keys.map(key => fields[key]);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  values.push(id);
  const [result] = await db.query(
    `UPDATE savings SET ${setClause} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

/**
 * Eliminar un ahorro
 * Delete a saving
 */
export async function deleteSaving(id) {
  const [result] = await db.query(
    'DELETE FROM savings WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
