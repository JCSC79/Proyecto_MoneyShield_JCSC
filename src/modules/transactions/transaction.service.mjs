// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';
import db from '../../db/DBHelper.mjs';
import { Result } from '../../utils/result.mjs';
import { isValidId } from '../../utils/validation.mjs';

// Clases de error personalizadas // Custom error classes
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

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

// Configuración  | Configuration
// Configuración de precisión decimal y monto máximo | Decimal precision and max amount configuration
const DECIMAL_PRECISION = 2;
const MAX_AMOUNT = 1_000_000;
let othersCategoryId = null;

// Helpers

const isAmountValid = amount =>
  typeof amount === 'number' &&
  amount > 0 &&
  amount <= MAX_AMOUNT &&
  Number.isFinite(amount) &&
  Number(amount.toFixed(DECIMAL_PRECISION)) === amount;

async function getOthersCategoryId() {
  if (!othersCategoryId) {
    const [rows] = await db.query(
      'SELECT id FROM categories WHERE name = ? LIMIT 1',
      ['Others']
    );
    if (!rows.length) {
      throw new Error('Default category "Others" not found');
    }
    othersCategoryId = rows[0].id;
  }
  return othersCategoryId;
}

// Servicio | Service

export async function getAllTransactions(filter) {
  try {
    const transactions = await transactionDao.getAllTransactions(filter);
    return Result.Success(transactions);
  } catch (error) {
    console.error('Error en getAllTransactions:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getTransactionById(id) {
  if (!isValidId(id)) {
    return Result.Fail('Invalid transaction ID', 400);
  }
  const numericId = Number(id);
  try {
    const transaction = await transactionDao.getTransactionById(numericId);
    return transaction
      ? Result.Success(transaction)
      : Result.Fail('Transaction not found', 404);
  } catch (error) {
    console.error('Error en getTransactionById:', error);
    return Result.Fail('Internal server error', 500);
  }
}


export async function createTransaction(data) {
  const requiredFields = ['user_id', 'type_id', 'amount'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  });

  // Asignar categoría 'Others' si es necesario | Assign 'Others' category if not provided
  if (!data.category_id) {
    data.category_id = await getOthersCategoryId();
  }

  // Validaciones comunes | Common validations
  await validateTransactionData(data);

  // Transacción para atomicidad | Transaction for atomicity
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const transaction = await transactionDao.createTransaction(data, connection);
    await connection.commit();

    return transaction;
  } catch (error) {
    await connection?.rollback();
    throw error;
  } finally {
    connection?.release();
  }
}

export async function updateTransaction(id, fields) {
  if (!isValidId(id)) {
    throw new ValidationError('Invalid transaction ID');
  }
  const numericId = Number(id);

  const ALLOWED_FIELDS = ['user_id', 'type_id', 'category_id', 'amount', 'description'];
  const validKeys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
  if (validKeys.length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  // Validar datos actualizados | Validate updated data
  await validateTransactionData(fields, numericId);

  // Transacción para atomicidad| Transaction for atomicity
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const updated = await transactionDao.updateTransaction(numericId, fields, connection);
    if (!updated) {
      throw new NotFoundError('Transaction not found');
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

export async function deleteTransaction(id) {
  if (!isValidId(id)) {
    throw new ValidationError('Invalid transaction ID');
  }
  const numericId = Number(id);

  const deleted = await transactionDao.deleteTransaction(numericId);
  if (!deleted) {
    throw new NotFoundError('Transaction not found');
  }

  return deleted;
}

// Validaciones comunes | Common validations
async function validateTransactionData(data, existingId = null) {
  // Validar relaciones | Validate relationships
  if (data.user_id) {
    const userExists = await transactionDao.userExists(data.user_id);
    if (!userExists) {  
      throw new ValidationError('User does not exist');
    }
  }

  if (data.type_id) {
    const typeExists = await transactionDao.typeExists(data.type_id);
    if (!typeExists) {  
      throw new ValidationError('Transaction type does not exist');
    }
  }

  if (data.category_id) {
    const categoryExists = await transactionDao.categoryExists(data.category_id);
    if (!categoryExists) {
      throw new ValidationError('Category does not exist');
    }
  }

  // Validar monto | Validate amount
  if (data.amount) {
    if (!isAmountValid(data.amount)) {
      throw new ValidationError(
        `Amount must be positive, up to $${MAX_AMOUNT} with ${DECIMAL_PRECISION} decimals`
      );
    }
  }
}

// =================== REPORTES FINANCIEROS ===================

export async function getUserBalance(user_id) {
  return transactionDao.getUserBalance(user_id);
}

export async function getExpensesByCategory(user_id) {
  return transactionDao.getExpensesByCategory(user_id);
}

export async function getMonthlyExpenses(user_id) {
  return transactionDao.getMonthlyExpenses(user_id);
}

export async function getPeriodicBalance(user_id, period = 'week') {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
  if (!['week', 'month'].includes(period)) {
    throw new ValidationError('Invalid period (must be "week" or "month")');
  }
  return transactionDao.getPeriodicBalance(user_id, period);
}

export async function getTopCategories(user_id, { year, month, limit } = {}) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    throw new ValidationError('Invalid year');
  }
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    throw new ValidationError('Invalid month');
  }
  if (limit && (isNaN(limit) || limit < 1 || limit > 20)) {
    throw new ValidationError('Invalid limit');
  }
  return transactionDao.getTopCategories(user_id, { year, month, limit });
}

export async function getSpendingPatterns(user_id, { year, month, mode } = {}) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    throw new ValidationError('Invalid year');
  }
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    throw new ValidationError('Invalid month');
  }
  if (mode && !['week', 'month'].includes(mode)) {
    throw new ValidationError('Invalid mode (must be "week" or "month")');
  }
  return transactionDao.getSpendingPatterns(user_id, { year, month, mode });
}

export async function getMonthlyForecast(user_id) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
  return transactionDao.getMonthlyForecast(user_id);
}

