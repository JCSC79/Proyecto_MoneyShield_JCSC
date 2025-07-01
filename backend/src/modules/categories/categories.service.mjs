// src/modules/categories/categories.service.mjs

import * as categoryDao from './categories.dao.mjs';
import { Result } from '../../utils/result.mjs';
import { isNonEmptyString } from '../../utils/validation.mjs';
import { Errors } from '../../constants/errorMessages.mjs'; // Importamos los mensajes de error
import { logger } from '../../utils/logger.mjs'; // Importamos el logger para registrar errores

/**
 * Obtener todas las categorías | Get all categories
 */
export async function getAllCategories() {
  try {
    const categories = await categoryDao.getAllCategories();
    return Result.Success(categories);
  } catch (error) {
    logger.error(`[Categories] Error en getAllCategories: ${error.message}`, { error }); // Cambio 30 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
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
      : Result.Fail(Errors.NOT_FOUND('Category'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Categories] Error en getCategoryById: ${error.message}`, { error }); // Cambio 30 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

/**
 * Crear nueva categoría | Create new category
 */
export async function createCategory({ name }) {
  if (!isNonEmptyString(name)) {
    return Result.Fail(Errors.MISSING_FIELD('name'), 400); //Mensaje de error centralizado 26 de junio
  }
  try {
    if (await categoryDao.categoryExistsByName(name.trim())) {
      return Result.Fail(Errors.ALREADY_EXISTS('Category'), 409); // Mensaje de error centralizado 26 de junio
    }
    const category = await categoryDao.createCategory({ name: name.trim() });
    return Result.Success(category);
  } catch (error) {
    logger.error(`[Categories] Error en createCategory: ${error.message}`, { error }); // Cambio 30 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

/**
 * Actualizar categoría | Update category
 */
export async function updateCategory(id, { name }) {
  if (!isNonEmptyString(name)) {
    return Result.Fail(Errors.MISSING_FIELD('name'), 400); // Mensaje de error centralizado 26 de junio
  }
  try {
    const updated = await categoryDao.updateCategory(id, { name: name.trim() });
    return updated
      ? Result.Success(true)
      : Result.Fail(Errors.NOT_FOUND('Category'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Categories] Error en updateCategory: ${error.message}`, { error }); // Cambio 30 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
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
      : Result.Fail(Errors.NOT_FOUND('Category'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    logger.error(`[Categories] Error en deleteCategory: ${error.message}`, { error }); // Cambio 30 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}
