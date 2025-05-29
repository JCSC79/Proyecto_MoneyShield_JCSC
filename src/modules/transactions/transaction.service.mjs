// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';
import db from '../../db/DBHelper.mjs';

// Clases de error personalizadas
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

// Configuración
const DECIMAL_PRECISION = 2;
const MAX_AMOUNT = 1_000_000;
let othersCategoryId = null;

// Helpers
const isValidId = id => {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
};
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
    if (!rows.length) throw new Error('Default category "Others" not found');
    othersCategoryId = rows[0].id;
  }
  return othersCategoryId;
}

// Servicio
export async function getAllTransactions(filter) {
  return transactionDao.getAllTransactions(filter);
}

export async function getTransactionById(id) {
  if (!isValidId(id)) throw new ValidationError('Invalid transaction ID');
  const numericId = Number(id);
  const transaction = await transactionDao.getTransactionById(numericId);
  if (!transaction) throw new NotFoundError('Transaction not found');
  return transaction;
}

export async function createTransaction(data) {
  const requiredFields = ['user_id', 'type_id', 'amount'];
  requiredFields.forEach(field => {
    if (!data[field]) throw new ValidationError(`Missing required field: ${field}`);
  });

  // Asignar categoría 'Others' si es necesario
  if (!data.category_id) {
    data.category_id = await getOthersCategoryId();
  }

  // Validaciones comunes
  await validateTransactionData(data);

  // Transacción para atomicidad
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
  if (!isValidId(id)) throw new ValidationError('Invalid transaction ID');
  const numericId = Number(id);

  const ALLOWED_FIELDS = ['user_id', 'type_id', 'category_id', 'amount', 'description'];
  const validKeys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
  if (validKeys.length === 0) throw new ValidationError('No valid fields to update');

  // Validar datos actualizados
  await validateTransactionData(fields, numericId);

  // Transacción para atomicidad
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const updated = await transactionDao.updateTransaction(numericId, fields, connection);
    if (!updated) throw new NotFoundError('Transaction not found');

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
  if (!isValidId(id)) throw new ValidationError('Invalid transaction ID');
  const numericId = Number(id);

  const deleted = await transactionDao.deleteTransaction(numericId);
  if (!deleted) throw new NotFoundError('Transaction not found');

  return deleted;
}

// Validaciones comunes
async function validateTransactionData(data, existingId = null) {
  // Validar relaciones
  if (data.user_id) {
    const userExists = await transactionDao.userExists(data.user_id);
    if (!userExists) throw new ValidationError('User does not exist');
  }

  if (data.type_id) {
    const typeExists = await transactionDao.typeExists(data.type_id);
    if (!typeExists) throw new ValidationError('Transaction type does not exist');
  }

  if (data.category_id) {
    const categoryExists = await transactionDao.categoryExists(data.category_id);
    if (!categoryExists) throw new ValidationError('Category does not exist');
  }

  // Validar monto
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
