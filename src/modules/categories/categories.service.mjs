import * as categoryDao from './categories.dao.mjs';

// Clases de error personalizadas | Custom error classes
class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError'; this.status = 400; }
}
class NotFoundError extends Error {
  constructor(message) { super(message); this.name = 'NotFoundError'; this.status = 404; }
}
class ConflictError extends Error {
  constructor(message) { super(message); this.name = 'ConflictError'; this.status = 409; }
}

/**
 * Obtener todas las categorías | Get all categories
 */
export async function getAllCategories() {
  return await categoryDao.getAllCategories();
}

/**
 * Obtener categoría por ID | Get category by ID
 */
export async function getCategoryById(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid category ID');
  }
  const category = await categoryDao.getCategoryById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  return category;
}

/**
 * Crear nueva categoría | Create new category
 */
export async function createCategory({ name }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ValidationError('Category name is required');
  }
  if (await categoryDao.categoryExistsByName(name.trim())) {
    throw new ConflictError('Category name already exists');
  }
  return await categoryDao.createCategory({ name: name.trim() });
}

/**
 * Actualizar categoría | Update category
 */
export async function updateCategory(id, { name }) {
  if (!id || isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid category ID');
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ValidationError('Category name is required');
  }
  const updated = await categoryDao.updateCategory(id, { name: name.trim() });
  if (!updated) {
    throw new NotFoundError('Category not found');
  }
  return true;
}

/**
 * Eliminar categoría | Delete category
 */
export async function deleteCategory(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid category ID');
  }
  const deleted = await categoryDao.deleteCategory(id);
  if (!deleted) {
    throw new NotFoundError('Category not found');
  }
  return true;
}
