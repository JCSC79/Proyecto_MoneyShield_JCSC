// src/modules/budgets/budget.service.mjs

import * as budgetDao from './budget.dao.mjs';
import { Result } from '../../utils/result.mjs';
import { checkRequiredFields, isValidId, isPositiveNumber } from '../../utils/validation.mjs';
import { Errors } from '../../constants/errorMessages.mjs'; // Importamos los mensajes de error
import { logger } from '../../utils/logger.mjs'; // Importamos el logger

export async function getAllBudgets(filter) {
  try {
    const budgets = await budgetDao.getAllBudgets(filter);
    return Result.Success(budgets);
  } catch (error) {
    logger.error(`[Budgets] Error en getAllBudgets: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

export async function getBudgetById(id) {
  try {
    const budget = await budgetDao.getBudgetById(Number(id));
    return budget
      ? Result.Success(budget)
      : Result.Fail(Errors.NOT_FOUND('Budget'), 404);
  } catch (error) {
    logger.error(`[Budgets] Error en getBudgetById: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500);
  }
}

export async function createBudget(data) {
  const requiredFields = ['user_id', 'category_id', 'budget_type', 'year', 'amount'];
  const missingField = checkRequiredFields(data, requiredFields);
  if (missingField) {
    return Result.Fail(Errors.MISSING_FIELD(missingField), 400); // Mensaje de error centralizado 26 de junio
  }
  if (!isPositiveNumber(data.amount)) {
    return Result.Fail(Errors.AMOUNT_POSITIVE, 400); // Mensaje de error centralizado 26 de junio
  }
  if (!isValidId(data.user_id) || !(await budgetDao.userExists(data.user_id))) {
    return Result.Fail(Errors.NOT_FOUND('User'), 400); // Mensaje de error centralizado 26 de junio
  }
  if (!isValidId(data.category_id) || !(await budgetDao.categoryExists(data.category_id))) {
    return Result.Fail(Errors.NOT_FOUND('Category'), 400); // Mensaje de error centralizado 26 de junio
  }

  // Verificar si ya existe un presupuesto igual
  if (await budgetDao.budgetExists({
    user_id: data.user_id,
    category_id: data.category_id,
    year: data.year,
    month: data.month,
    budget_type: data.budget_type
  })) {
    return Result.Fail(Errors.ALREADY_EXISTS('Budget'), 409); // Mensaje de error centralizado 26 de junio
  }

  let createdBudget;
  try {
    createdBudget = await budgetDao.createBudget(data); // usa el pool por defecto
    return Result.Success(createdBudget);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return Result.Fail(Errors.ALREADY_EXISTS('Budget'), 409);
    }
    logger.error(`[Budgets] Error en createBudget: ${error.message}`, { error });
    return Result.Fail(Errors.INTERNAL, 500);
  }

}

export async function updateBudget(id, fields, currentUser) {
  if ('user_id' in fields && (!currentUser || currentUser.profile_id !== 1)) {
    return Result.Fail('Solo un administrador puede modificar el usuario de un presupuesto (user_id)', 403);
  }
  if (fields.amount && !isPositiveNumber(fields.amount)) {
    return Result.Fail(Errors.AMOUNT_POSITIVE, 400); // Mensaje de error centralizado 26 de junio
  }
  if (fields.user_id && (!isValidId(fields.user_id) || !(await budgetDao.userExists(fields.user_id)))) {
  return Result.Fail(Errors.NOT_FOUND('User'), 400); // Mensaje de error centralizado 26 de junio
  }
  if (fields.category_id && (!isValidId(fields.category_id) || !(await budgetDao.categoryExists(fields.category_id)))) {
    return Result.Fail(Errors.NOT_FOUND('Category'), 400); // Mensaje de error centralizado 26 de junio
  }

  try {
    const updated = await budgetDao.updateBudget(Number(id), fields);
    if (!updated) {
      return Result.Fail(Errors.NOT_FOUND('Budget'), 404);
    }
    const updatedBudget = await budgetDao.getBudgetById(Number(id));
    return Result.Success(updatedBudget);
  } catch (error) {
    logger.error(`[Budgets] Error en updateBudget: ${error.message}`, { error });
    return Result.Fail(Errors.INTERNAL, 500);
  }

}

export async function deleteBudget(id) {
  try {
    const deleted = await budgetDao.deleteBudget(Number(id));
    return deleted
      ? Result.Success(true)
      : Result.Fail(Errors.NOT_FOUND('Budget'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Budgets] Error en deleteBudget: ${error.message}`, { error });
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

export async function getRemainingBudget(user_id) {
  if (!isValidId(user_id)) {
    return Result.Fail(Errors.INVALID_ID('user'), 400); // Mensaje de error centralizado 26 de junio
  }
  try {
    const data = await budgetDao.getRemainingBudget(user_id);
    return Result.Success(data);
  } catch (error) {
    logger.error(`[Budgets] Error en getRemainingBudget: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

export async function getBudgetAlerts(user_id, threshold = 80) {
  if (!isValidId(user_id)) {
    return Result.Fail(Errors.INVALID_ID('user'), 400); // Mensaje de error centralizado 26 de junio
  }
  if (threshold < 0 || threshold > 100 || isNaN(threshold)) {
    return Result.Fail(Errors.INVALID_THRESHOLD, 400); // Mensaje de error centralizado 26 de junio
  }
  try {
    const data = await budgetDao.getBudgetAlerts(user_id, threshold);
    return Result.Success(data);
  } catch (error) {
    logger.error(`[Budgets] Error en getBudgetAlerts: ${error.message}`, { error }); // Cambio 27 junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

