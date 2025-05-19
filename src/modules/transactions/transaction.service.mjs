// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';
// CAMBIO: Importar la conexión a la base de datos directamente
import db from '../../db/DBHelper.mjs';

/**
 * Validar que amount sea un número positivo
 * Validate that amount is a positive number
 */
function isValidAmount(amount) {
  return typeof amount === 'number' && amount > 0;
}

/**
 * Obtener todas las transacciones con filtros
 * Get all transactions with filters
 */
export async function getAllTransactions(filter) {
  return await transactionDao.getAllTransactions(filter);
}

/**
 * Obtener una transacción por ID
 * Get a transaction by ID
 */
export async function getTransactionById(id) {
  if (!id || isNaN(id) || id <= 0) {
    const error = new Error('Invalid transaction ID');
    error.status = 400;
    throw error;
  }
  const transaction = await transactionDao.getTransactionById(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.status = 404;
    throw error;
  }
  return transaction;
}

/**
 * Crear una nueva transacción
 * Create a new transaction
 */
export async function createTransaction(data) {
  const requiredFields = ['user_id', 'type_id', 'amount'];
  for (const field of requiredFields) {
    if (!data[field]) {
      const error = new Error(`Missing required field: ${field}`);
      error.status = 400;
      throw error;
    }
  }

  // CAMBIO: Usar la conexión db directamente para buscar el id de "Others"
  // Si no se envía category_id, buscar el id de "Others"
  // If category_id is not sent, look for the "Others" category id
  if (!('category_id' in data) || data.category_id === null || data.category_id === undefined) {
    const [rows] = await db.query(
      'SELECT id FROM categories WHERE name = ? LIMIT 1',
      ['Others']
    );
    if (!rows.length) {
      const error = new Error('Default category "Others" not found');
      error.status = 500;
      throw error;
    }
    data.category_id = rows[0].id;
  }

  // Validar existencia de user_id y type_id
  const userOk = await transactionDao.userExists(data.user_id);
  if (!userOk) {
    const error = new Error('User does not exist');
    error.status = 400;
    throw error;
  }
  const typeOk = await transactionDao.typeExists(data.type_id);
  if (!typeOk) {
    const error = new Error('Transaction type does not exist');
    error.status = 400;
    throw error;
  }
  // Validar existencia de category_id (ya sea el enviado o el de Others)
  const categoryOk = await transactionDao.categoryExists(data.category_id);
  if (!categoryOk) {
    const error = new Error('Category does not exist');
    error.status = 400;
    throw error;
  }
  // Validar amount positivo
  if (!isValidAmount(data.amount)) {
    const error = new Error('Amount must be a positive number');
    error.status = 400;
    throw error;
  }
  return await transactionDao.createTransaction(data);
}

/**
 * Actualizar una transacción existente (PUT o PATCH)
 * Update an existing transaction (PUT or PATCH)
 */
export async function updateTransaction(id, fields) {
  if (!id || isNaN(id) || id <= 0) {
    const error = new Error('Invalid transaction ID');
    error.status = 400;
    throw error;
  }
  if (!fields || Object.keys(fields).length === 0) {
    const error = new Error('No fields to update');
    error.status = 400;
    throw error;
  }
  // Validar existencia de user_id y type_id si se envían
  if (fields.user_id) {
    const userOk = await transactionDao.userExists(fields.user_id);
    if (!userOk) {
      const error = new Error('User does not exist');
      error.status = 400;
      throw error;
    }
  }
  if (fields.type_id) {
    const typeOk = await transactionDao.typeExists(fields.type_id);
    if (!typeOk) {
      const error = new Error('Transaction type does not exist');
      error.status = 400;
      throw error;
    }
  }
  // Validar existencia de category_id si se envía
  if ('category_id' in fields && fields.category_id !== null && fields.category_id !== undefined) {
    const categoryOk = await transactionDao.categoryExists(fields.category_id);
    if (!categoryOk) {
      const error = new Error('Category does not exist');
      error.status = 400;
      throw error;
    }
  }
  if (fields.amount && !isValidAmount(fields.amount)) {
    const error = new Error('Amount must be a positive number');
    error.status = 400;
    throw error;
  }
  const updated = await transactionDao.updateTransaction(id, fields);
  if (!updated) {
    const error = new Error('Transaction not found');
    error.status = 404;
    throw error;
  }
  return updated;
}

/**
 * Eliminar una transacción por ID
 * Delete a transaction by ID
 */
export async function deleteTransaction(id) {
  if (!id || isNaN(id) || id <= 0) {
    const error = new Error('Invalid transaction ID');
    error.status = 400;
    throw error;
  }
  const deleted = await transactionDao.deleteTransaction(id);
  if (!deleted) {
    const error = new Error('Transaction not found');
    error.status = 404;
    throw error;
  }
  return deleted;
}
