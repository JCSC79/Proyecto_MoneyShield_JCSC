// src/modules/categories/categories.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 * Obtener todas las categorías | Get all categories
 */
export async function getAllCategories() {
  const [rows] = await db.query(
    `SELECT id, name, type FROM categories ORDER BY name` // Agregando type 8 de julio 2025
  );
  return rows;
}

/**
 * Obtener categoría por ID | Get category by ID
 */
export async function getCategoryById(id) {
  const [rows] = await db.query(
    `SELECT id, name, type FROM categories WHERE id = ?`, // Agregando type 8 de julio 2025
    [id]
  );
  return rows[0];
}

/**
 * Crear nueva categoría | Create new category
 */
export async function createCategory({ name, type = 'expense' }) {
  const [result] = await db.query(
    `INSERT INTO categories (name, type) VALUES (?, ?)`, //Modificado 8 de julio 2025
    [name, type]
  );
  return { id: result.insertId, name, type };
}

/**
 * Actualizar categoría | Update category
 */
export async function updateCategory(id, { name, type }) {
  const [result] = await db.query(
    `UPDATE categories SET name = ?, type = ? WHERE id = ?`, //Modificado 8 de julio 2025
    [name, type, id]
  );
  return result.affectedRows > 0;
}

/**
 * Eliminar categoría | Delete category
 */
export async function deleteCategory(id) {
  const [result] = await db.query(
    `DELETE FROM categories WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

/**
 * Verificar existencia por nombre | Check if category exists by name
 */
export async function categoryExistsByName(name) {
  const [rows] = await db.query(
    `SELECT id FROM categories WHERE name = ?`,
    [name]
  );
  return rows.length > 0;
}
