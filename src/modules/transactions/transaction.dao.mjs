// src/modules/transactions/transaction.dao.mjs

import db from '../../db/DBHelper.mjs';

// Campos permitidos para actualización | Allowed fields for update
const ALLOWED_UPDATE_FIELDS = new Set([
  'user_id', 'type_id', 'category_id', 'amount', 'description'
]);

/**
 * Obtener todas las transacciones con joins y filtros | Get all transactions with joins and filters
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
 * Obtener transacción por ID con datos relacionados | Get transaction by ID with related data
 */
export async function getTransactionById(id, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return null;
  }
  
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
 * Crear nueva transacción | Create new transaction
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
 * Actualizar transacción existente | Update existing transaction
 */
export async function updateTransaction(id, fields, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return false;
  }
  
  // Filtrar campos permitidos | Filter allowed fields
  const validFields = Object.keys(fields)
    .filter(key => ALLOWED_UPDATE_FIELDS.has(key))
    .reduce((obj, key) => {
      obj[key] = fields[key];
      return obj;
    }, {});

  if (Object.keys(validFields).length === 0) { 
    return false;
  }

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
 * Eliminar transacción | Delete transaction
 */
export async function deleteTransaction(id, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return false;
  }
  
  const [result] = await connection.query(
    'DELETE FROM transactions WHERE id = ?',
    [numId]
  );
  
  return result.affectedRows > 0;
}

// Funciones de validación de relaciones | Relationship validation functions
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
  if (category_id === null) {
    return true; // Permitir NULL
  }
  const [rows] = await connection.query(
    'SELECT id FROM categories WHERE id = ?',
    [category_id]
  );
  return rows.length > 0;
}


// =================== REPORTES FINANCIEROS ===================

/**
 * Balance general (ingresos - gastos) | General balance (income - expenses)
 */
export async function getUserBalance(user_id, connection = db) {
  const [rows] = await connection.query(
    `SELECT 
    SUM(CASE WHEN t.type_id = 1 THEN t.amount ELSE -t.amount END) AS balance
    FROM transactions t
    WHERE t.user_id = ?`,
    [user_id]
  );
  return rows[0].balance || 0;
}

/**
 * Gastos por categoría | Expenses by category
 */
export async function getExpensesByCategory(user_id, connection = db) {
  const [rows] = await connection.query(
    `SELECT c.name AS category, SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.type_id = 2
    GROUP BY c.name
    ORDER BY total DESC`,
    [user_id]
  );
  return rows;
}

/**
 * Evolución mensual de gastos | Monthly expenses evolution
 */
export async function getMonthlyExpenses(user_id, connection = db) {
  const [rows] = await connection.query(
    `SELECT YEAR(t.created_at) AS year, MONTH(t.created_at) AS month, SUM(t.amount) AS total
    FROM transactions t
    WHERE t.user_id = ? AND t.type_id = 2
    GROUP BY year, month
    ORDER BY year, month`,
    [user_id]
  );
  return rows;
}
