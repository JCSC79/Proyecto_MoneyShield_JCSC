// src/modules/categories/categories.service.mjs

import * as categoryDao from './categories.dao.mjs';
import { Result } from '../../utils/result.mjs';
import { isNonEmptyString } from '../../utils/validation.mjs';

/**
 * Obtener todas las categorías | Get all categories
 */
export async function getAllCategories() {
  try {
    const categories = await categoryDao.getAllCategories();
    return Result.Success(categories);
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Obtener categoría por ID | Get category by ID
 */
export async function getCategoryById(id) {
  try {
    const category = await categoryDao.getCategoryById(id);
    return category
      ? Result.Success(category)
      : Result.Fail('Category not found', 404);
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Crear nueva categoría | Create new category
 */
export async function createCategory({ name }) {
  if (!isNonEmptyString(name)) {
    return Result.Fail('Category name is required', 400);
  }
  try {
    if (await categoryDao.categoryExistsByName(name.trim())) {
      return Result.Fail('Category name already exists', 409);
    }
    const category = await categoryDao.createCategory({ name: name.trim() });
    return Result.Success(category);
  } catch (error) {
    console.error('Error in createCategory:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Actualizar categoría | Update category
 */
export async function updateCategory(id, { name }) {
  if (!isNonEmptyString(name)) {
    return Result.Fail('Category name is required', 400);
  }
  try {
    const updated = await categoryDao.updateCategory(id, { name: name.trim() });
    return updated
      ? Result.Success(true)
      : Result.Fail('Category not found', 404);
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Eliminar categoría | Delete category
 */
export async function deleteCategory(id) {
  try {
    const deleted = await categoryDao.deleteCategory(id);
    return deleted
      ? Result.Success(true)
      : Result.Fail('Category not found', 404);
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return Result.Fail('Internal server error', 500);
  }
}
