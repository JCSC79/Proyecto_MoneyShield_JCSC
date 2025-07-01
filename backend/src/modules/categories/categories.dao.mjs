// src/modules/categories/categories.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 * Obtener todas las categorías | Get all categories
 */
export async function getAllCategories() {
  const [rows] = await db.query(
    `SELECT id, name FROM categories ORDER BY name`
  );
  return rows;
}

/**
 * Obtener categoría por ID | Get category by ID
 */
export async function getCategoryById(id) {
  const [rows] = await db.query(
    `SELECT id, name FROM categories WHERE id = ?`,
    [id]
  );
  return rows[0];
}

/**
 * Crear nueva categoría | Create new category
 */
export async function createCategory({ name }) {
  const [result] = await db.query(
    `INSERT INTO categories (name) VALUES (?)`,
    [name]
  );
  return { id: result.insertId, name };
}

/**
 * Actualizar categoría | Update category
 */
export async function updateCategory(id, { name }) {
  const [result] = await db.query(
    `UPDATE categories SET name = ? WHERE id = ?`,
    [name, id]
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
