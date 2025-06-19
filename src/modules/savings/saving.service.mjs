// src/modules/savings/saving.service.mjs

import * as savingsDao from './saving.dao.mjs';
import { validateId, checkRequiredFields, isPositiveNumber, isValidDate } from '../../utils/validation.mjs';
import { Result } from '../../utils/result.mjs';


// Campos requeridos para creación | Required fields for creation
const REQUIRED_FIELDS = ['user_id', 'type_id', 'name', 'amount'];

/**
 * Validar datos de ahorro | Validate saving data
 */
export function validateSavingData(data, isUpdate = false) {
  if (!isUpdate) {
    const missingField = checkRequiredFields(data, REQUIRED_FIELDS);
    if (missingField) {
      return Result.Fail(`Missing required field: ${missingField}`, 400);
    }
  }
  if (data.amount !== undefined && !isPositiveNumber(data.amount)) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (data.target_amount !== undefined && data.target_amount !== null && !isPositiveNumber(data.target_amount)) {
    return Result.Fail('Target amount must be a positive number', 400);
  }
  if (data.target_date && !isValidDate(data.target_date)) {
    return Result.Fail('Invalid target date', 400);
  }
  if (
    data.target_amount !== undefined &&
    data.target_amount !== null &&
    data.amount !== undefined &&
    data.target_amount <= data.amount
  ) {
    return Result.Fail('Target amount must be greater than current amount', 400);
  }
  return Result.Success(true);
}

/**
 * Obtener todos los ahorros de un usuario | Get all savings for a user
 */
export async function getAllSavings(user_id) {
  const idValidation = validateId(user_id);
  if (!idValidation.success) {
    return idValidation;
  }
  try {
    const savings = await savingsDao.getAllSavings(user_id);
    return Result.Success(savings);
  } catch (error) {
    console.error('Error en getAllSavings:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Obtener ahorro por ID | Get saving by ID
 */
export async function getSavingById(id) {
  const idValidation = validateId(id, 'saving ID');
  if (!idValidation.success) {
    return idValidation;
  }
  try {
    const saving = await savingsDao.getSavingById(id);
    return saving
      ? Result.Success(saving)
      : Result.Fail('Saving not found', 404);
  } catch (error) {
    console.error('Error en getSavingById:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Crear un nuevo ahorro | Create a new saving
 */
export async function createSaving(data) {
  const validation = validateSavingData(data);
  if (!validation.success) {
    return validation;
  }
  try {
    const saving = await savingsDao.createSaving(data);
    return Result.Success(saving);
  } catch (error) {
    console.error('Error en createSaving:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Actualizar completamente un ahorro | Fully update a saving
 */
export async function updateSaving(id, data) {
  const idValidation = validateId(id, 'saving ID');
  if (!idValidation.success) {
    return idValidation;
  }
  const validation = validateSavingData(data, true);
  if (!validation.success) {
    return validation;
  }
  try {
    const updated = await savingsDao.updateSaving(id, data);
    return updated
      ? Result.Success(true)
      : Result.Fail('Saving not found or no valid fields to update', 404);
  } catch (error) {
    console.error('Error en updateSaving:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Actualizar parcialmente un ahorro | Partially update a saving
 */
export async function patchSaving(id, fields) {
  const idValidation = validateId(id, 'saving ID');
  if (!idValidation.success) {
    return idValidation;
  }
  const allowedFields = ['type_id', 'name', 'amount', 'target_amount', 'target_date'];
  const keys = Object.keys(fields).filter(k => allowedFields.includes(k));
  if (keys.length === 0) {
    return Result.Fail('No valid fields to update', 400);
  }
  // Validaciones parciales usando helpers
  if (fields.amount !== undefined && !isPositiveNumber(fields.amount)) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (fields.target_amount !== undefined && fields.target_amount !== null && !isPositiveNumber(fields.target_amount)) {
    return Result.Fail('Target amount must be a positive number', 400);
  }
  if (fields.target_date && !isValidDate(fields.target_date)) {
    return Result.Fail('Invalid target date', 400);
  }
  if (
    fields.amount !== undefined &&
    fields.target_amount !== undefined &&
    fields.target_amount !== null &&
    fields.target_amount <= fields.amount
  ) {
    return Result.Fail('Target amount must be greater than amount', 400);
  }
  try {
    const updated = await savingsDao.patchSaving(id, fields);
    return updated
      ? Result.Success(true)
      : Result.Fail('Saving not found or no valid fields to update', 404);
  } catch (error) {
    console.error('Error en patchSaving:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Eliminar un ahorro | Delete a saving
 */
export async function deleteSaving(id) {
  const idValidation = validateId(id, 'saving ID');
  if (!idValidation.success) {
    return idValidation;
  }
  try {
    const deleted = await savingsDao.deleteSaving(id);
    return deleted
      ? Result.Success(true)
      : Result.Fail('Saving not found', 404);
  } catch (error) {
    console.error('Error en deleteSaving:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Obtener progreso de ahorros de un usuario | Get savings progress for a user
 */
export async function getSavingsProgress(user_id) {
  const idValidation = validateId(id, 'user ID');
  if (!idValidation.success) {
    return idValidation;
  }
  try {
    const data = await savingsDao.getSavingsProgress(user_id);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getSavingsProgress:', error);
    return Result.Fail('Internal server error', 500);
  }
}