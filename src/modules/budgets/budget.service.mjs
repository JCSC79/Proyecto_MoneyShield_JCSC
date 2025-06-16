// src/modules/budgets/budget.service.mjs

import * as budgetDao from './budget.dao.mjs';
import db from '../../db/DBHelper.mjs';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

const isValidId = id => Number.isInteger(Number(id)) && Number(id) > 0;
const isValidAmount = amount => typeof amount === 'number' && amount > 0 && Number.isFinite(amount);

export async function getAllBudgets(filter) {
  return budgetDao.getAllBudgets(filter);
}

export async function getBudgetById(id) {
  if (!isValidId(id)) {
    throw new ValidationError('Invalid budget ID');
  }
  const budget = await budgetDao.getBudgetById(Number(id));
  if (!budget) {
    throw new NotFoundError('Budget not found');
  }
  return budget;
}

export async function createBudget(data) {
  const requiredFields = ['user_id', 'category_id', 'budget_type', 'year', 'amount'];
  requiredFields.forEach(field => { if (!data[field]) throw new ValidationError(`Missing required field: ${field}`); });
  if (!isValidAmount(data.amount)) {
    throw new ValidationError('Amount must be a positive number');
  }
  if (!isValidId(data.user_id) || !(await budgetDao.userExists(data.user_id))) {
    throw new ValidationError('User does not exist');
  }
  if (!isValidId(data.category_id) || !(await budgetDao.categoryExists(data.category_id))) {
    throw new ValidationError('Category does not exist');
  }
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const budget = await budgetDao.createBudget(data, connection);
    await connection.commit();
    return budget;
  } catch (error) {
    await connection?.rollback();
    throw error;
  } finally {
    connection?.release();
  }
}

export async function updateBudget(id, fields) {
  if (!isValidId(id)) {
    throw new ValidationError('Invalid budget ID');
  }
  if (fields.amount && !isValidAmount(fields.amount)) {
    throw new ValidationError('Amount must be a positive number');
  }
  if (fields.user_id && (!isValidId(fields.user_id) || !(await budgetDao.userExists(fields.user_id)))) {
    throw new ValidationError('User does not exist');
  }
  if (fields.category_id && (!isValidId(fields.category_id) || !(await budgetDao.categoryExists(fields.category_id)))) {
    throw new ValidationError('Category does not exist');
  }
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const updated = await budgetDao.updateBudget(Number(id), fields, connection);
    if (!updated) {
      throw new NotFoundError('Budget not found');
    }
    await connection.commit();
    return updated;
  } catch (error) {
    await connection?.rollback();
    throw error;
  } finally {
    connection?.release();
  }
}

export async function deleteBudget(id) {
  if (!isValidId(id)) {
    throw new ValidationError('Invalid budget ID');
  }
  const deleted = await budgetDao.deleteBudget(Number(id));
  if (!deleted) {
    throw new NotFoundError('Budget not found');
  }
  return deleted;
}

// Función para obtener el presupuesto restante para un usuario | Function to get remaining budget for a user
// Esta función asume que la tabla de presupuestos tiene una columna para el presupuesto total y el monto gastado | This function assumes that the budget table has a column for total budget and spent amount
export async function getRemainingBudget(user_id) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
  return await budgetDao.getRemainingBudget(user_id);
}

// Función para obtener alertas de presupuesto según un porcentaje umbral (80%) | Function to get budget alerts based on a threshold percentage
export async function getBudgetAlerts(user_id, threshold = 80) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
  if (threshold < 0 || threshold > 100 || isNaN(threshold)) {
    throw new ValidationError('Threshold must be between 0 and 100');
  }
  return await budgetDao.getBudgetAlerts(user_id, threshold);
}

