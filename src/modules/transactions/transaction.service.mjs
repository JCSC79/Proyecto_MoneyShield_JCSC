// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';
import db from '../../db/DBHelper.mjs';
import { Result } from '../../utils/result.mjs';
import { validateId, isAmountInRange } from '../../utils/validation.mjs';

// Configuración | Configuration
const DECIMAL_PRECISION = 2;
const MAX_AMOUNT = 1_000_000;
let othersCategoryId = null;


async function getOthersCategoryId() {
  if (!othersCategoryId) {
    try {
      const [rows] = await db.query(
        'SELECT id FROM categories WHERE name = ? LIMIT 1',
        ['Others']
      );
      
      if (!rows.length) {
        const [result] = await db.query(
          'INSERT INTO categories (name) VALUES (?)',
          ['Others']
        );
        othersCategoryId = result.insertId;
      } else {
        othersCategoryId = rows[0].id;
      }
      
      return Result.Success(othersCategoryId);
    } catch (error) {
      console.error('Error en getOthersCategoryId:', error);
      return Result.Fail('Error fetching Others category', 500);
    }
  }
  return Result.Success(othersCategoryId);
}


// Validar datos de transacción | Validate transaction data
async function validateTransactionData(data) {
  // Validar relaciones | Validate relationships
  if (data.user_id) {
    const userExists = await transactionDao.userExists(data.user_id);
    if (!userExists) {
      return Result.Fail('User does not exist', 400);
    }
  }

  if (data.type_id) {
    const typeExists = await transactionDao.typeExists(data.type_id);
    if (!typeExists) {
      return Result.Fail('Transaction type does not exist', 400);
    }
  }

  if (data.category_id) {
    const categoryExists = await transactionDao.categoryExists(data.category_id);
    if (!categoryExists) {
      return Result.Fail('Category does not exist', 400);
    }
  }

  // Validar monto | Validate amount
  if (data.amount) {
    if (!isAmountInRange(data.amount, MAX_AMOUNT, DECIMAL_PRECISION)) {
      return Result.Fail(
        `Amount must be positive, up to $${MAX_AMOUNT} with ${DECIMAL_PRECISION} decimals`,
        400
      );
    }
  }

  return Result.Success(true);
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
  const idValidation = validateId(id, 'transaction ID');
  if (!idValidation.success) return idValidation;

  try {
    const transaction = await transactionDao.getTransactionById(Number(id));
    return transaction
      ? Result.Success(transaction)
      : Result.Fail('Transaction not found', 404);
  } catch (error) {
    console.error('Error en getTransactionById:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function createTransaction(data) {
  // Validar campos requeridos
  const requiredFields = ['user_id', 'type_id', 'amount'];
  const missingField = requiredFields.find(field => !data[field]);
  if (missingField) {
    return Result.Fail(`Missing required field: ${missingField}`, 400);
  }

  // Asignar categoría 'Others' si es necesario
  if (!data.category_id) {
    const categoryResult = await getOthersCategoryId();
    if (!categoryResult.success) return categoryResult;
    data.category_id = categoryResult.data;
  }

  // Validaciones comunes
  const validationResult = await validateTransactionData(data);
  if (!validationResult.success) return validationResult;

  try {
    const transaction = await transactionDao.createTransaction(data);
    return Result.Success(transaction);
  } catch (error) {
    console.error('Error en createTransaction:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function updateTransaction(id, fields) {
  const idValidation = validateId(id, 'transaction ID');
  if (!idValidation.success) return idValidation;

  const ALLOWED_FIELDS = ['user_id', 'type_id', 'category_id', 'amount', 'description'];
  const validKeys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
  if (validKeys.length === 0) {
    return Result.Fail('No valid fields to update', 400);
  }

  // Validar datos actualizados
  const validationResult = await validateTransactionData(fields);
  if (!validationResult.success) return validationResult;

  try {
    const updated = await transactionDao.updateTransaction(Number(id), fields);
    return updated
      ? Result.Success(true)
      : Result.Fail('Transaction not found', 404);
  } catch (error) {
    console.error('Error en updateTransaction:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function deleteTransaction(id) {
  const idValidation = validateId(id, 'transaction ID');
  if (!idValidation.success) return idValidation;

  try {
    const deleted = await transactionDao.deleteTransaction(Number(id));
    return deleted
      ? Result.Success(true)
      : Result.Fail('Transaction not found', 404);
  } catch (error) {
    console.error('Error en deleteTransaction:', error);
    return Result.Fail('Internal server error', 500);
  }
}

// =================== REPORTES FINANCIEROS ===================

// Helper para validar user_id en reportes
function validateUserId(user_id) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    return Result.Fail('Invalid user ID', 400);
  }
  return Result.Success(Number(user_id));
}

export async function getUserBalance(user_id) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) return idValidation;

  try {
    const balance = await transactionDao.getUserBalance(idValidation.data);
    return Result.Success(balance);
  } catch (error) {
    console.error('Error en getUserBalance:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getExpensesByCategory(user_id) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) return idValidation;

  try {
    const data = await transactionDao.getExpensesByCategory(idValidation.data);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getExpensesByCategory:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getMonthlyExpenses(user_id) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) return idValidation;

  try {
    const data = await transactionDao.getMonthlyExpenses(idValidation.data);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getMonthlyExpenses:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getPeriodicBalance(user_id, period = 'week') {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) return idValidation;

  if (!['week', 'month'].includes(period)) {
    return Result.Fail('Invalid period (must be "week" or "month")', 400);
  }

  try {
    const data = await transactionDao.getPeriodicBalance(idValidation.data, period);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getPeriodicBalance:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getTopCategories(user_id, { year, month, limit } = {}) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) return idValidation;

  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    return Result.Fail('Invalid year', 400);
  }
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    return Result.Fail('Invalid month', 400);
  }
  if (limit && (isNaN(limit) || limit < 1 || limit > 20)) {
    return Result.Fail('Invalid limit', 400);
  }

  try {
    const data = await transactionDao.getTopCategories(idValidation.data, { year, month, limit });
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getTopCategories:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getSpendingPatterns(user_id, { year, month, mode } = {}) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) return idValidation;

  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    return Result.Fail('Invalid year', 400);
  }
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    return Result.Fail('Invalid month', 400);
  }
  if (mode && !['week', 'month'].includes(mode)) {
    return Result.Fail('Invalid mode (must be "week" or "month")', 400);
  }

  try {
    const data = await transactionDao.getSpendingPatterns(idValidation.data, { year, month, mode });
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getSpendingPatterns:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getMonthlyForecast(user_id) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) return idValidation;

  try {
    const data = await transactionDao.getMonthlyForecast(idValidation.data);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getMonthlyForecast:', error);
    return Result.Fail('Internal server error', 500);
  }
}