// src/modules/budgets/budget.service.mjs

import * as budgetDao from './budget.dao.mjs';
import db from '../../db/DBHelper.mjs';
import { Result } from '../../utils/result.mjs';
import { checkRequiredFields, isValidId, isPositiveNumber } from '../../utils/validation.mjs';


export async function getAllBudgets(filter) {
  try {
    const budgets = await budgetDao.getAllBudgets(filter);
    return Result.Success(budgets);
  } catch (error) {
    console.error('Error en getAllBudgets:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getBudgetById(id) {
  if (!isValidId(id)) {
    return Result.Fail('Invalid budget ID', 400);
  }
  const budget = await budgetDao.getBudgetById(Number(id));
  return budget
    ? Result.Success(budget)
    : Result.Fail('Budget not found', 404);
}

export async function createBudget(data) {
  const requiredFields = ['user_id', 'category_id', 'budget_type', 'year', 'amount'];
  const missingField = checkRequiredFields(data, requiredFields);
  if (missingField) {
    return Result.Fail(`Missing required field: ${missingField}`, 400);
  }
  if (!isPositiveNumber(data.amount)) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (!isValidId(data.user_id) || !(await budgetDao.userExists(data.user_id))) {
    return Result.Fail('User does not exist', 400);
  }
  if (!isValidId(data.category_id) || !(await budgetDao.categoryExists(data.category_id))) {
    return Result.Fail('Category does not exist', 400);
  }

// Verificar si ya existe un presupuesto igual
  if (await budgetDao.budgetExists({
    user_id: data.user_id,
    category_id: data.category_id,
    year: data.year,
    month: data.month,
    budget_type: data.budget_type
  })) {
    return Result.Fail('Budget already exists for this user, category, period and type', 409);
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const budget = await budgetDao.createBudget(data, connection);
    await connection.commit();
    return Result.Success(budget);
  } catch (error) {
    await connection?.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return Result.Fail('Budget already exists for this user, category, and period', 409);
    }

    console.error('Error en createBudget:', error);
    return Result.Fail('Internal server error', 500);
  } finally {
    connection?.release();
  }
}

export async function updateBudget(id, fields) {
  if (!isValidId(id)) {
    return Result.Fail('Invalid budget ID', 400);
  }
  if (fields.amount && !isPositiveNumber(fields.amount)) {
    return Result.Fail('Amount must be a positive number', 400);
  }
  if (fields.user_id && (!isValidId(fields.user_id) || !(await budgetDao.userExists(fields.user_id)))) {
    return Result.Fail('User does not exist', 400);
  }
  if (fields.category_id && (!isValidId(fields.category_id) || !(await budgetDao.categoryExists(fields.category_id)))) {
    return Result.Fail('Category does not exist', 400);
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const updated = await budgetDao.updateBudget(Number(id), fields, connection);
    if (!updated) {
      await connection.rollback();
      return Result.Fail('Budget not found', 404);
    }
    await connection.commit();
    return Result.Success(true);
  } catch (error) {
    await connection?.rollback();
    console.error('Error en updateBudget:', error);
    return Result.Fail('Internal server error', 500);
  } finally {
    connection?.release();
  }
}

export async function deleteBudget(id) {
  if (!isValidId(id)) {
    return Result.Fail('Invalid budget ID', 400);
  }
  try {
    const deleted = await budgetDao.deleteBudget(Number(id));
    return deleted
      ? Result.Success(true)
      : Result.Fail('Budget not found', 404);
  } catch (error) {
    console.error('Error en deleteBudget:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getRemainingBudget(user_id) {
  if (!isValidId(user_id)) {
    return Result.Fail('Invalid user ID', 400);
  }
  try {
    const data = await budgetDao.getRemainingBudget(user_id);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getRemainingBudget:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function getBudgetAlerts(user_id, threshold = 80) {
  if (!isValidId(user_id)) {
    return Result.Fail('Invalid user ID', 400);
  }
  if (threshold < 0 || threshold > 100 || isNaN(threshold)) {
    return Result.Fail('Threshold must be between 0 and 100', 400);
  }
  try {
    const data = await budgetDao.getBudgetAlerts(user_id, threshold);
    return Result.Success(data);
  } catch (error) {
    console.error('Error en getBudgetAlerts:', error);
    return Result.Fail('Internal server error', 500);
  }
}

