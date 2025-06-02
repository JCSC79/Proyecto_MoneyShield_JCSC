import express from 'express';
import * as categoryService from './categories.service.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management | Gestión de categorías
 */

// Helper para status HTTP según error | Helper for HTTP status based on error
function getStatus(err) {
  return err.status || 400;
}

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories | Obtener todas las categorías
 *     responses:
 *       200:
 *         description: List of categories | Lista de categorías
 */
router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID | Obtener categoría por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Category found | Categoría encontrada
 *       404:
 *         description: Category not found | Categoría no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create new category | Crear nueva categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Category created | Categoría creada
 *       400:
 *         description: Invalid request | Solicitud inválida
 *       409:
 *         description: Category already exists | La categoría ya existe
 */
router.post('/', async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category | Actualizar categoría
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Category updated | Categoría actualizada
 *       404:
 *         description: Category not found | Categoría no encontrada
 */
router.put('/:id', async (req, res) => {
  try {
    await categoryService.updateCategory(req.params.id, req.body);
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category | Eliminar categoría
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Category deleted | Categoría eliminada
 *       404:
 *         description: Category not found | Categoría no encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

export default router;
