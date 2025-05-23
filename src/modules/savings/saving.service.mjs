import * as savingsDao from './saving.dao.mjs';
import db from '../../db/DBHelper.mjs';

// Clases de error personalizadas | Custom error classes
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

// Campos requeridos para creación | Required fields for creation
const REQUIRED_FIELDS = ['user_id', 'type_id', 'name', 'amount'];

/**
 * Validar ID de ahorro | Validate saving ID
 */
function validateSavingId(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid saving ID');
  }
}

/**
 * Validar datos de ahorro | Validate saving data
 */
function validateSavingData(data, isUpdate = false) {
  for (const field of REQUIRED_FIELDS) {
    if (!isUpdate && !data[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }
  if (data.amount !== undefined && (isNaN(data.amount) || data.amount < 0)) {
    throw new ValidationError('Amount must be a positive number');
  }
  if (data.target_amount !== undefined && data.target_amount !== null && (isNaN(data.target_amount) || data.target_amount < 0)) {
    throw new ValidationError('Target amount must be a positive number');
  }
  if (data.target_date && isNaN(Date.parse(data.target_date))) {
    throw new ValidationError('Invalid target date');
  }
}

/**
 * Obtener todos los ahorros de un usuario | Get all savings for a user
 */
export async function getAllSavings(user_id) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
  return await savingsDao.getAllSavings(user_id);
}

/**
 * Obtener ahorro por ID | Get saving by ID
 */
export async function getSavingById(id) {
  validateSavingId(id);
  const saving = await savingsDao.getSavingById(id);
  if (!saving) throw new NotFoundError('Saving not found');
  return saving;
}

/**
 * Crear un nuevo ahorro | Create a new saving
 */
export async function createSaving(data) {
  validateSavingData(data);
  // Puedes agregar aquí validaciones adicionales, como existencia de usuario o tipo de ahorro si lo necesitas
  return await savingsDao.createSaving(data);
}

/**
 * Actualizar completamente un ahorro | Fully update a saving
 */
export async function updateSaving(id, data) {
  validateSavingId(id);
  validateSavingData(data, true);
  const updated = await savingsDao.updateSaving(id, data);
  if (!updated) throw new NotFoundError('Saving not found');
  return true;
}

/**
 * Actualizar parcialmente un ahorro | Partially update a saving
 */
export async function patchSaving(id, fields) {
  validateSavingId(id);
  const allowedFields = ['type_id', 'name', 'amount', 'target_amount', 'target_date'];
  const keys = Object.keys(fields).filter(k => allowedFields.includes(k));
  if (keys.length === 0) throw new ValidationError('No valid fields to update');

  // Validaciones parciales
  if (fields.amount !== undefined && (isNaN(fields.amount) || fields.amount < 0)) {
    throw new ValidationError('Amount must be a positive number');
  }
  if (
    fields.target_amount !== undefined &&
    fields.target_amount !== null &&
    (isNaN(fields.target_amount) || fields.target_amount < 0)
  ) {
    throw new ValidationError('Target amount must be a positive number');
  }
  if (fields.target_date && isNaN(Date.parse(fields.target_date))) {
    throw new ValidationError('Invalid target date');
  }
  // Validar que target_amount > amount si ambos están presentes
  if (
    fields.amount !== undefined &&
    fields.target_amount !== undefined &&
    fields.target_amount !== null &&
    fields.target_amount <= fields.amount
  ) {
    throw new ValidationError('Target amount must be greater than amount');
  }

  const updated = await savingsDao.patchSaving(id, fields);
  if (!updated) throw new NotFoundError('Saving not found or no valid fields to update');
  return true;
}

/**
 * Eliminar un ahorro | Delete a saving
 */
export async function deleteSaving(id) {
  validateSavingId(id);
  const deleted = await savingsDao.deleteSaving(id);
  if (!deleted) throw new NotFoundError('Saving not found');
  return true;
}
