// src/modules/transactions/transaction.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 * Obtener todas las transacciones con filtros opcionales y datos enriquecidos
 * Get all transactions with optional filters and enriched data
 */
export async function getAllTransactions({ user_id, type_id, from, to } = {}) {
  let sql = `
    SELECT
      t.*,
      u.email,
      tt.name as type_name,
      c.name as category_name
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    JOIN transaction_types tt ON t.type_id = tt.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const values = [];
  if (user_id) {
    sql += ' AND t.user_id = ?';
    values.push(user_id);
  }
  if (type_id) {
    sql += ' AND t.type_id = ?';
    values.push(type_id);
  }
  if (from) {
    sql += ' AND t.created_at >= ?';
    values.push(from);
  }
  if (to) {
    sql += ' AND t.created_at <= ?';
    values.push(to);
  }
  sql += ' ORDER BY t.created_at DESC';
  const [rows] = await db.query(sql, values);
  return rows;
}

/**
 * Obtener una transacción por ID con datos enriquecidos
 * Get a transaction by ID with enriched data
 */
export async function getTransactionById(id) {
  const [rows] = await db.query(`
    SELECT 
      t.*, 
      u.email, 
      tt.name as type_name, 
      c.name as category_name
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    JOIN transaction_types tt ON t.type_id = tt.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `, [id]);
  return rows[0];
}

/**
 * Verificar existencia de usuario por ID
 * Check if a user exists by ID
 */
export async function userExists(user_id) {
  const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
  return rows.length > 0;
}

/**
 * Verificar existencia de tipo de transacción por ID
 * Check if a transaction type exists by ID
 */
export async function typeExists(type_id) {
  const [rows] = await db.query('SELECT id FROM transaction_types WHERE id = ?', [type_id]);
  return rows.length > 0;
}

/**
 * Verificar existencia de categoría por ID
 * Check if a category exists by ID
 */
export async function categoryExists(category_id) {
  if (category_id == null) return true; // Permitir NULL como válido
  const [rows] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
  return rows.length > 0;
}

/**
 * Crear una nueva transacción
 * Create a new transaction
 */
export async function createTransaction({ user_id, type_id, category_id, amount, description }) {
  const [result] = await db.query(
    `INSERT INTO transactions (user_id, type_id, category_id, amount, description) VALUES (?, ?, ?, ?, ?)`,
    [user_id, type_id, category_id || null, amount, description || null]
  );
  return { id: result.insertId, user_id, type_id, category_id, amount, description };
}

/**
 * Actualizar una transacción existente
 * Update an existing transaction
 */
export async function updateTransaction(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return false;
  const values = keys.map(key => fields[key]);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  values.push(id);
  const [result] = await db.query(
    `UPDATE transactions SET ${setClause} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

/**
 * Eliminar una transacción por ID
 * Delete a transaction by ID
 */
export async function deleteTransaction(id) {
  const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
