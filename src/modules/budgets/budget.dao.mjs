import db from '../../db/DBHelper.mjs';

// Campos permitidos para actualización | Allowed fields for update
const ALLOWED_UPDATE_FIELDS = new Set([
  'user_id', 'category_id', 'budget_type', 'year', 'month', 'amount', 'notes'
]);

export async function getAllBudgets(filter = {}, connection = db) {
  const { user_id, year, month, category_id } = filter;
  let sql = `
    SELECT b.*, c.name as category_name
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    WHERE 1=1
  `;
  const values = [];
  if (user_id) {
    sql += ' AND b.user_id = ?';
    values.push(user_id); }
  if (year) {
    sql += ' AND b.year = ?';
    values.push(year); }
  if (month) {
    sql += ' AND b.month = ?';
    values.push(month); }
  if (category_id) {
    sql += ' AND b.category_id = ?';
    values.push(category_id); }
  
  sql += ' ORDER BY b.year DESC, b.month DESC, b.category_id';
  const [rows] = await connection.query(sql, values);
  return rows;
}

export async function getBudgetById(id, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return null;
  const [rows] = await connection.query(
    `SELECT b.*, c.name as category_name
     FROM budgets b
     JOIN categories c ON b.category_id = c.id
     WHERE b.id = ?`,
    [numId]
  );
  return rows[0] || null;
}

export async function createBudget(data, connection = db) {
  const { user_id, category_id, budget_type, year, month, amount, notes } = data;
  const [result] = await connection.query(
    `INSERT INTO budgets (user_id, category_id, budget_type, year, month, amount, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, category_id, budget_type, year, month, amount, notes || null]
  );
  return { id: result.insertId, ...data };
}

export async function updateBudget(id, fields, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return false;
  const validFields = Object.keys(fields)
    .filter(key => ALLOWED_UPDATE_FIELDS.has(key))
    .reduce((obj, key) => { obj[key] = fields[key]; return obj; }, {});
  if (Object.keys(validFields).length === 0) return false;
  const setClause = Object.keys(validFields).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(validFields), numId];
  const [result] = await connection.query(
    `UPDATE budgets SET ${setClause} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

export async function deleteBudget(id, connection = db) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return false;
  const [result] = await connection.query('DELETE FROM budgets WHERE id = ?', [numId]);
  return result.affectedRows > 0;
}

// Validaciones de relaciones | Validations for relationships
export async function userExists(user_id, connection = db) {
  const [rows] = await connection.query('SELECT id FROM users WHERE id = ?', [user_id]);
  return rows.length > 0;
}
export async function categoryExists(category_id, connection = db) {
  const [rows] = await connection.query('SELECT id FROM categories WHERE id = ?', [category_id]);
  return rows.length > 0;
}

/**
 * Presupuesto restante por categoría para el mes actual | Remaining budget by category for the current month
 */
export async function getRemainingBudget(user_id, connection = db) {
  const [rows] = await connection.query(
    `SELECT
      b.category_id,
      c.name AS category,
      b.amount AS budget,
      COALESCE(SUM(t.amount), 0) AS spent,
      b.amount - COALESCE(SUM(t.amount), 0) AS remaining
    FROM budgets b
    LEFT JOIN transactions t
      ON b.user_id = t.user_id
      AND b.category_id = t.category_id
      AND t.type_id = 2
      AND YEAR(t.created_at) = YEAR(CURDATE())
      AND MONTH(t.created_at) = MONTH(CURDATE())
    JOIN categories c ON b.category_id = c.id
    WHERE
      b.user_id = ?
      AND b.budget_type = 'monthly'
      AND b.year = YEAR(CURDATE())
      AND b.month = MONTH(CURDATE())
    GROUP BY b.category_id, b.amount, c.name`,
    [user_id]
  );
  return rows;
}
