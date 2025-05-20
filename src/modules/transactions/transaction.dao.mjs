// src/modules/transactions/transaction.dao.mjs

import db from '../../db/DBHelper.mjs';

// Campos permitidos para actualización
const ALLOWED_UPDATE_FIELDS = new Set([
  'user_id', 'type_id', 'category_id', 'amount', 'description'
]);

/**
 * Obtener todas las transacciones con joins y filtros
 */
export async function getAllTransactions(filter = {}, connection = db) {
  const { user_id, type_id, from, to } = filter;
  let sql = `
    SELECT t.*, 
      u.email as user_email,
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
  const [rows] = await connection.query(sql, values);
  return rows;
}

/**
 * Obtener transacción por ID con datos relacionados
 */
export async function getTransactionById(id, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return null;
  
  const [rows] = await connection.query(
    `SELECT t.*, 
      u.email as user_email,
      tt.name as type_name,
      c.name as category_name
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     JOIN transaction_types tt ON t.type_id = tt.id
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.id = ?`,
    [numId]
  );
  return rows[0] || null;
}

/**
 * Crear nueva transacción
 */
export async function createTransaction(data, connection = db) {
  const { user_id, type_id, category_id, amount, description } = data;
  
  const [result] = await connection.query(
    `INSERT INTO transactions 
      (user_id, type_id, category_id, amount, description)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, type_id, category_id, amount, description || null]
  );
  
  return {
    id: result.insertId,
    ...data,
    created_at: new Date().toISOString()
  };
}

/**
 * Actualizar transacción existente
 */
export async function updateTransaction(id, fields, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return false;
  
  // Filtrar campos permitidos
  const validFields = Object.keys(fields)
    .filter(key => ALLOWED_UPDATE_FIELDS.has(key))
    .reduce((obj, key) => {
      obj[key] = fields[key];
      return obj;
    }, {});

  if (Object.keys(validFields).length === 0) return false;

  const setClause = Object.keys(validFields)
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = [...Object.values(validFields), numId];

  const [result] = await connection.query(
    `UPDATE transactions SET ${setClause} WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
}

/**
 * Eliminar transacción
 */
export async function deleteTransaction(id, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return false;
  
  const [result] = await connection.query(
    'DELETE FROM transactions WHERE id = ?',
    [numId]
  );
  
  return result.affectedRows > 0;
}

// Funciones de validación de relaciones
export async function userExists(user_id, connection = db) {
  const [rows] = await connection.query(
    'SELECT id FROM users WHERE id = ?',
    [user_id]
  );
  return rows.length > 0;
}

export async function typeExists(type_id, connection = db) {
  const [rows] = await connection.query(
    'SELECT id FROM transaction_types WHERE id = ?',
    [type_id]
  );
  return rows.length > 0;
}

export async function categoryExists(category_id, connection = db) {
  if (category_id === null) return true; // Permitir NULL
  const [rows] = await connection.query(
    'SELECT id FROM categories WHERE id = ?',
    [category_id]
  );
  return rows.length > 0;
}
