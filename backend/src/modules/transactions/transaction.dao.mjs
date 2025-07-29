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
  
  // Filtra campos permitidos | Filter allowed fields
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

/**
 * Balance por semana o mes | Weekly or monthly balance
 */
export async function getPeriodicBalance(user_id, period = 'week', connection = db) {
  let selectPeriod;
  if (period === 'week') {// Si es semanal | If weekly
    selectPeriod = `CONCAT(YEAR(t.created_at), '-W', LPAD(WEEK(t.created_at),2,'0'))`;
  } else {// Si es mensual | If monthly
    selectPeriod = `CONCAT(YEAR(t.created_at), '-', LPAD(MONTH(t.created_at),2,'0'))`;
  }
  const [rows] = await connection.query(// Consulta SQL para balance por periodo | SQL query for periodic balance
    `SELECT
      ${selectPeriod} AS period,
      SUM(CASE WHEN t.type_id = 1 THEN t.amount ELSE 0 END) AS ingresos,
      SUM(CASE WHEN t.type_id = 2 THEN t.amount ELSE 0 END) AS gastos,
      SUM(CASE WHEN t.type_id = 1 THEN t.amount ELSE -t.amount END) AS balance
    FROM transactions t
    WHERE t.user_id = ?
    GROUP BY period
    ORDER BY period`,
    [user_id]
  );
  return rows;
}

/**
 * Top categorías de gasto del usuario en el mes y año indicados (por defecto: mes actual) | Top spending categories for the user in the specified month and year (default: current month)
 */
export async function getTopCategories(user_id, { year, month, limit = 3 } = {}, connection = db) {
  const now = new Date();
  year = year || now.getFullYear();
  month = month || (now.getMonth() + 1);

  const [rows] = await connection.query(
    `SELECT
      c.name AS category,
      SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
      AND t.type_id = 2
      AND YEAR(t.created_at) = ?
      AND MONTH(t.created_at) = ?
    GROUP BY c.name
    ORDER BY total DESC
    LIMIT ?`,
    [user_id, year, month, limit]
  );
  return rows;
}

/**
 * Patrones de gasto por día de la semana | Spending patterns by day of the week
 */
export async function getSpendingPatterns(user_id, { year, month, mode = 'week' } = {}, connection = db) {
  let groupField, selectField;
  if (mode === 'month') {
    groupField = 'DAY(t.created_at)';
    selectField = 'DAY(t.created_at) AS day';
  } else {
    groupField = 'DAYNAME(t.created_at)';
    selectField = 'DAYNAME(t.created_at) AS day';
  }
  let dateFilter = '';
  const params = [user_id];
  if (year) {
    dateFilter += ' AND YEAR(t.created_at) = ?';
    params.push(year);
  }
  if (month) {
    dateFilter += ' AND MONTH(t.created_at) = ?';
    params.push(month);
  }
  const [rows] = await connection.query(
    `SELECT 
      ${selectField},
      SUM(t.amount) AS total
    FROM transactions t
    WHERE t.user_id = ? AND t.type_id = 2
    ${dateFilter}
    GROUP BY ${groupField}
    ORDER BY total DESC`,
    params
  );
  return rows;
}

/**
 * Proyección de gasto mensual | Monthly spending forecast
 */
export async function getMonthlyForecast(user_id, connection = db) {
  const [rows] = await connection.query(
    `SELECT
      SUM(amount) AS gasto_actual,
      DAY(CURDATE()) AS dias_transcurridos,
      DAY(LAST_DAY(CURDATE())) AS dias_mes,
      ROUND(SUM(amount) / DAY(CURDATE()) * DAY(LAST_DAY(CURDATE())), 2) AS proyeccion_mes
    FROM transactions
    WHERE user_id = ?
      AND type_id = 2
      AND YEAR(created_at) = YEAR(CURDATE())
      AND MONTH(created_at) = MONTH(CURDATE())`,
    [user_id]
  );
  return rows[0] || null;
}

/**
 * Ingresos del mes (income for current month)
 */
export async function getIncomeByMonth(user_id, year = null, month = null, connection = db) {
  // Usa año/mes actual si no se dan
  if (!year || !month) {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }
  const [rows] = await connection.query(
    `SELECT SUM(amount) AS ingreso_mes
    FROM transactions
    WHERE user_id = ?
      AND type_id = 1
      AND YEAR(created_at) = ?
      AND MONTH(created_at) = ?`,
    [user_id, year, month]
  );
  return rows[0]?.ingreso_mes || 0;
}

/**
 * Número de movimientos este mes
 */
export async function getMovementsCountByMonth(user_id, year = null, month = null, connection = db) {
  if (!year || !month) {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS movimientos_mes
    FROM transactions
    WHERE user_id = ?
      AND YEAR(created_at) = ?
      AND MONTH(created_at) = ?`,
    [user_id, year, month]
  );
  return rows[0]?.movimientos_mes || 0;
}


