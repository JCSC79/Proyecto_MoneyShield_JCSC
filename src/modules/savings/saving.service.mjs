// src/modules/savings/saving.service.mjs

import * as savingsDao from './saving.dao.mjs';
import { isValidId, validateId, checkRequiredFields } from '../../utils/validation.mjs';
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
  if (data.amount !== undefined && (isNaN(data.amount) || data.amount < 0)) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (data.target_amount !== undefined && data.target_amount !== null && (isNaN(data.target_amount) || data.target_amount < 0)) {
    return Result.Fail('Target amount must be a positive number', 400);
  }
  if (data.target_date && isNaN(Date.parse(data.target_date))) {
    return Result.Fail('Invalid target date', 400);
  }
  return Result.Success(true);
}

/**
 * Obtener todos los ahorros de un usuario | Get all savings for a user
 */
export async function getAllSavings(user_id) {
  const idValidation = validateId(user_id);
  if (!idValidation.success) return idValidation;
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
  if (!isValidId(id)) {
    return Result.Fail('Invalid saving ID', 400);
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
  // Valida campos requeridos
  const missingField = checkRequiredFields(data, ['user_id', 'type_id', 'name', 'amount']);
  if (missingField) {
    return Result.Fail(`Missing required field: ${missingField}`, 400);
  }

  // Validaciones adicionales
  if (isNaN(data.amount) || data.amount < 0) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (data.target_amount !== undefined && data.target_amount !== null &&
      (isNaN(data.target_amount) || data.target_amount < 0)) {
    return Result.Fail('Target amount must be a positive number', 400);
  }
  if (data.target_date && isNaN(Date.parse(data.target_date))) {
    return Result.Fail('Invalid target date', 400);
  }

  if (
    data.target_amount !== undefined &&
    data.target_amount !== null &&
    data.target_amount <= data.amount
  ) {
    return Result.Fail('Target amount must be greater than current amount', 400);
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
  if (!isValidId(id)) {
    return Result.Fail('Invalid saving ID', 400);
  }

  // Valida campos requeridos para actualización completa
  const missingField = checkRequiredFields(data, ['type_id', 'name', 'amount']);
  if (missingField) {
    return Result.Fail(`Missing required field: ${missingField}`, 400);
  }

  // Validaciones de formato y dominio
  if (isNaN(data.amount) || data.amount < 0) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (data.target_amount !== undefined && data.target_amount !== null &&
      (isNaN(data.target_amount) || data.target_amount < 0)) {
    return Result.Fail('Target amount must be a positive number', 400);
  }
  if (data.target_date && isNaN(Date.parse(data.target_date))) {
    return Result.Fail('Invalid target date', 400);
  }

  try {
    const updated = await savingsDao.updateSaving(id, data);
    return updated
      ? Result.Success(true)
      : Result.Fail('Saving not found', 404);
  } catch (error) {
    console.error('Error en updateSaving:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Actualizar parcialmente un ahorro | Partially update a saving
 */
export async function patchSaving(id, fields) {
  // Valida ID
  if (!isValidId(id)) {
    return Result.Fail('Invalid saving ID', 400);
  }

  // Filtra campos permitidos
  const allowedFields = ['type_id', 'name', 'amount', 'target_amount', 'target_date'];
  const keys = Object.keys(fields).filter(k => allowedFields.includes(k));
  if (keys.length === 0) {
    return Result.Fail('No valid fields to update', 400);
  }

  // Validaciones parciales
  if (fields.amount !== undefined && (isNaN(fields.amount) || fields.amount < 0)) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (
    fields.target_amount !== undefined &&
    fields.target_amount !== null &&
    (isNaN(fields.target_amount) || fields.target_amount < 0)
  ) {
    return Result.Fail('Target amount must be a positive number', 400);
  }
  if (fields.target_date && isNaN(Date.parse(fields.target_date))) {
    return Result.Fail('Invalid target date', 400);
  }
  // Validamos que target_amount > amount si ambos están presentes
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
  if (!isValidId(id)) {
    return Result.Fail('Invalid saving ID', 400);
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
  if (!isValidId(user_id)) {
    return Result.Fail('Invalid user ID', 400);
  }
  try {
    const data = await savingsDao.getSavingsProgress(user_id);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getSavingsProgress:', error);
    return Result.Fail('Internal server error', 500);
  }
}