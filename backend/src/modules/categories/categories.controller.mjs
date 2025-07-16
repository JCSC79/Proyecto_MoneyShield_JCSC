// src/modules/categories/categories.controller.mjs

import express from 'express';
import * as categoryService from './categories.service.mjs';
import { validateIdParam } from '../../middlewares/validateParams.middleware.mjs';
import { authenticate, authorize } from '../auth/auth.middleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management | Gestión de categorías
 */

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
  const result = await categoryService.getAllCategories();
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.get('/:id', validateIdParam, async (req, res) => {
  const result = await categoryService.getCategoryById(req.params.id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.post('/', authenticate, authorize([1]), async (req, res) => {
  const result = await categoryService.createCategory(req.body);
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.put('/:id', authenticate, authorize([1]), validateIdParam, async (req, res) => {
  const result = await categoryService.updateCategory(req.params.id, req.body);
  if (result.success) {
    res.status(200).json({ message: 'Category updated' });
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.delete('/:id', authenticate, authorize([1]), validateIdParam, async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  if (result.success) {
    res.status(200).json({ message: 'Category deleted' });
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

export default router;
