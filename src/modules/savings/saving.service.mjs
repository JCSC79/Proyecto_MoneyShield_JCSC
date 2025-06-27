// src/modules/savings/saving.service.mjs

import * as savingsDao from './saving.dao.mjs';
import { validateId, validateSavingData, isPositiveNumber, isValidDate } from '../../utils/validation.mjs';
import { Result } from '../../utils/result.mjs';
import { Errors } from '../../constants/errorMessages.mjs'; // Importamos los mensajes de error
import { logger } from '../../utils/logger.mjs';  // Importamos el logger para registrar errores

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
    logger.error(`[Savings] Error en getAllSavings: ${error.message}`, { error }); //Cambio 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

/**
 * Obtener ahorro por ID | Get saving by ID
 */
export async function getSavingById(id) {
  try {
    const saving = await savingsDao.getSavingById(id);
    return saving
      ? Result.Success(saving)
      : Result.Fail(Errors.NOT_FOUND('Saving'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Savings] Error en getSavingById: ${error.message}`, { error }); // Cambio 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
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
    logger.error(`[Savings] Error en createSaving: ${error.message}`, { error }); // Cambio 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

/**
 * Actualizar completamente un ahorro | Fully update a saving
 */
export async function updateSaving(id, data) {
  const validation = validateSavingData(data, true);
  if (!validation.success) {
    return validation;
  }
  try {
    const updated = await savingsDao.updateSaving(id, data);
    if (!updated) {
      return Result.Fail(Errors.NOT_FOUND('Saving'), 404);
    }
    const updatedSaving = await savingsDao.getSavingById(id);
    return Result.Success(updatedSaving);
  } catch (error) {
    logger.error(`[Savings] Error en updateSaving: ${error.message}`, { error }); // Cambio 27 de junio
    return Result.Fail(Errors.INTERNAL, 500);
}

}

/**
 * Actualizar parcialmente un ahorro | Partially update a saving
 */
export async function patchSaving(id, fields) {
  const allowedFields = ['type_id', 'name', 'amount', 'target_amount', 'target_date'];
  const keys = Object.keys(fields).filter(k => allowedFields.includes(k));
  if (keys.length === 0) {
    return Result.Fail(Errors.INVALID_UPDATE, 400); // Mensaje de error centralizado 26 de junio
  }
  // Validaciones parciales usando helpers
  if (fields.amount !== undefined && !isPositiveNumber(fields.amount)) {
    return Result.Fail(Errors.AMOUNT_POSITIVE, 400); // Mensaje de error centralizado 26 de junio
  }
  if (fields.target_amount !== undefined && fields.target_amount !== null && !isPositiveNumber(fields.target_amount)) {
    return Result.Fail(Errors.TARGET_AMOUNT_POSITIVE, 400); // Mensaje de error centralizado 26 de junio
  }
  if (fields.target_date && !isValidDate(fields.target_date)) {
    return Result.Fail(Errors.INVALID_DATE, 400); // Mensaje de error centralizado 26 de junio
  }
  if (
    fields.amount !== undefined &&
    fields.target_amount !== undefined &&
    fields.target_amount !== null &&
    fields.target_amount <= fields.amount
  ) {
    return Result.Fail(Errors.TARGET_AMOUNT_GREATER, 400); // Mensaje de error centralizado 26 de junio
  }
  try {
  const updated = await savingsDao.patchSaving(id, fields);
  if (!updated) {
    return Result.Fail(Errors.NOT_FOUND('Saving'), 404);
  }
  const updatedSaving = await savingsDao.getSavingById(id);
  return Result.Success(updatedSaving);
} catch (error) {
  logger.error(`[Savings] Error en patchSaving: ${error.message}`, { error }); // Cambio 27 de junio
  return Result.Fail(Errors.INTERNAL, 500);
}

}

/**
 * Eliminar un ahorro | Delete a saving
 */
export async function deleteSaving(id) {
  try {
    const deleted = await savingsDao.deleteSaving(id);
    return deleted
      ? Result.Success(true)
      : Result.Fail(Errors.NOT_FOUND('Saving'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Savings] Error en deleteSaving: ${error.message}`, { error }); // Cambio 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

/**
 * Obtener progreso de ahorros de un usuario | Get savings progress for a user
 */
export async function getSavingsProgress(user_id) {
  const idValidation = validateId(user_id, 'user ID');
  if (!idValidation.success) {
    return idValidation;
  }
  try {
    const data = await savingsDao.getSavingsProgress(user_id);
    return Result.Success(data);
  } catch (error) {
    logger.error(`[Savings] Error en getSavingsProgress: ${error.message}`, { error }); // Cambio 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}
