// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';
import db from '../../db/DBHelper.mjs';
import { Result } from '../../utils/result.mjs';
import { validateUserId, validateTransactionData, checkRequiredFields } from '../../utils/validation.mjs';
import { DEFAULT_CATEGORY_NAME } from '../../constants/financial.mjs';
import { Errors } from '../../constants/errorMessages.mjs'; // Importamos los mensajes centralizados | Import centralized error messages
import { logger } from '../../utils/logger.mjs';  // Importamos el logger centralizado | Import centralized logger

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
      logger.error(`[Transactions] Error en getOthersCategoryId: ${error.message}`, { error }); // Cambio 27 junio
      return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
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
    logger.error(`[Transactions] Error en getAllTransactions: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}

export async function getTransactionById(id) {
  try {
    const transaction = await transactionDao.getTransactionById(Number(id));
    return transaction
      ? Result.Success(transaction)
      : Result.Fail(Errors.NOT_FOUND('Transaction'), 404); // Usamos el mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Transactions] Error en getTransactionById: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}

export async function createTransaction(data) {
  // Valida campos requeridos
  const requiredFields = ['user_id', 'type_id', 'amount'];
  const missingField = checkRequiredFields(data, requiredFields);
  if (missingField) {
    return Result.Fail(Errors.MISSING_FIELD(missingField), 400); // Usamos el mensaje de error centralizado 26 de junio
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
    logger.error(`[Transactions] Error en createTransaction: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}

export async function updateTransaction(id, fields) {
  const ALLOWED_FIELDS = ['user_id', 'type_id', 'category_id', 'amount', 'description'];
  const validKeys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
  if (validKeys.length === 0) {
    return Result.Fail(Errors.INVALID_UPDATE, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  // Valida datos actualizados
  const validationResult = await validateTransactionData(fields, transactionDao);
  if (!validationResult.success) {
    return validationResult;
  }
  try {
    const updated = await transactionDao.updateTransaction(Number(id), fields);
    if (!updated) {
      return Result.Fail(Errors.NOT_FOUND('Transaction'), 404);
    }
    const updatedTransaction = await transactionDao.getTransactionById(Number(id));
    return Result.Success(updatedTransaction); // ← Devuelve el objeto
  } catch (error) {
    logger.error(`[Transactions] Error en updateTransaction: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}

export async function deleteTransaction(id) {
  try {
    const deleted = await transactionDao.deleteTransaction(Number(id));
    return deleted
      ? Result.Success(true)
      : Result.Fail(Errors.NOT_FOUND('Transaction'), 404); // Usamos el mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Transactions] Error en deleteTransaction: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
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
    logger.error(`[Transactions] Error en getUserBalance: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
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
    logger.error(`[Transactions] Error en getExpensesByCategory: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
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
    logger.error(`[Transactions] Error en getMonthlyExpenses: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}

export async function getPeriodicBalance(user_id, period = 'week') {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) {
    return idValidation;
  }
  if (!['week', 'month'].includes(period)) {
    return Result.Fail(Errors.INVALID_PERIOD, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  try {
    const data = await transactionDao.getPeriodicBalance(idValidation.data, period);
    return Result.Success(data);
  } catch (error) {
    logger.error(`[Transactions] Error en getPeriodicBalance: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}

export async function getTopCategories(user_id, { year, month, limit } = {}) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) {
    return idValidation;
  }
  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    return Result.Fail(Errors.INVALID_YEAR, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    return Result.Fail(Errors.INVALID_MONTH, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  if (limit && (isNaN(limit) || limit < 1 || limit > 20)) {
    return Result.Fail(Errors.INVALID_LIMIT, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  try {
    const data = await transactionDao.getTopCategories(idValidation.data, { year, month, limit });
    return Result.Success(data);
  } catch (error) {
    logger.error(`[Transactions] Error en getTopCategories: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}

export async function getSpendingPatterns(user_id, { year, month, mode } = {}) {
  const idValidation = validateUserId(user_id);
  if (!idValidation.success) {
    return idValidation;
  }
  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    return Result.Fail(Errors.INVALID_YEAR, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    return Result.Fail(Errors.INVALID_MONTH, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  if (mode && !['week', 'month'].includes(mode)) {
    return Result.Fail(Errors.INVALID_MODE, 400); // Usamos el mensaje de error centralizado 26 de junio
  }
  try {
    const data = await transactionDao.getSpendingPatterns(idValidation.data, { year, month, mode });
    return Result.Success(data);
  } catch (error) {
    logger.error(`[Transactions] Error en getSpendingPatterns: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
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
    logger.error(`[Transactions] Error en getMonthlyForecast: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Usamos el mensaje de error centralizado 26 de junio
  }
}