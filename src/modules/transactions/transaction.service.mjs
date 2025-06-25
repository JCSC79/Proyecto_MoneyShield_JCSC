// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';
import db from '../../db/DBHelper.mjs';
import { Result } from '../../utils/result.mjs';
import { validateUserId, validateTransactionData, checkRequiredFields } from '../../utils/validation.mjs';
import { DEFAULT_CATEGORY_NAME } from '../../constants/financial.mjs';

let othersCategoryId = null;

// Helper: Obtener ID de categoría "Others"
async function getOthersCategoryId() {
  if (!othersCategoryId) {
    try {
      const [rows] = await db.query(
        'SELECT id FROM categories WHERE name = ? LIMIT 1',
        [DEFAULT_CATEGORY_NAME]
      );
      
      if (!rows.length) {
        const [result] = await db.query(
          'INSERT INTO categories (name) VALUES (?)',
          [DEFAULT_CATEGORY_NAME]
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

// Servicios | Services

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
  // Valida campos requeridos
  const requiredFields = ['user_id', 'type_id', 'amount'];
  const missingField = checkRequiredFields(data, requiredFields);
  if (missingField) {
    return Result.Fail(`Missing required field: ${missingField}`, 400);
  }

  // Asigna categoría 'Others' si es necesario
  if (!data.category_id) {
    const categoryResult = await getOthersCategoryId();
    if (!categoryResult.success) {
      return categoryResult;
    }
    data.category_id = categoryResult.data;
  }

  // Validaciones comunes
  const validationResult = await validateTransactionData(data, transactionDao);
  if (!validationResult.success) {
    return validationResult;
  }

  try {
    const transaction = await transactionDao.createTransaction(data);
    return Result.Success(transaction);
  } catch (error) {
    console.error('Error en createTransaction:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function updateTransaction(id, fields) {
  const ALLOWED_FIELDS = ['user_id', 'type_id', 'category_id', 'amount', 'description'];
  const validKeys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
  if (validKeys.length === 0) {
    return Result.Fail('No valid fields to update', 400);
  }
  // Valida datos actualizados
  const validationResult = await validateTransactionData(fields, transactionDao);
  if (!validationResult.success) {
    return validationResult;
  }
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

export async function getUserBalance(user_id) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) {
    return idValidation;
  }
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
  if (!idValidation.success) {
    return idValidation;
  }
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
  if (!idValidation.success) {
    return idValidation;
  }
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
  if (!idValidation.success) {
    return idValidation;
  }
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
  if (!idValidation.success) {
    return idValidation;
  }
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
  if (!idValidation.success) {
    return idValidation;
  }
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
  if (!idValidation.success) {
    return idValidation;
  }
  try {
    const data = await transactionDao.getMonthlyForecast(idValidation.data);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getMonthlyForecast:', error);
    return Result.Fail('Internal server error', 500);
  }
}