// src/modules/budgets/budget.controller.mjs

import express from 'express';
import * as budgetService from './budget.service.mjs';

const router = express.Router();

function getStatus(err) {
  return err.status || 400;
}

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management | Gestión de presupuestos
 */

/**
 * @swagger
 * /budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: Get all budgets | Obtener todos los presupuestos
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *         description: Filter by user ID | Filtrar por usuario
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         description: Filter by year | Filtrar por año
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *         description: Filter by month | Filtrar por mes
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *         description: Filter by category | Filtrar por categoría
 *     responses:
 *       200:
 *         description: List of budgets | Lista de presupuestos
 */
router.get('/', async (req, res) => {
  try {
    const budgets = await budgetService.getAllBudgets(req.query);
    res.json(budgets);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     tags: [Budgets]
 *     summary: Get budget by ID | Obtener presupuesto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Budget found | Presupuesto encontrado
 *       404:
 *         description: Budget not found | Presupuesto no encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const budget = await budgetService.getBudgetById(req.params.id);
    res.json(budget);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /budgets:
 *   post:
 *     tags: [Budgets]
 *     summary: Create a new budget | Crear un nuevo presupuesto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, category_id, budget_type, year, amount]
 *             properties:
 *               user_id: { type: integer }
 *               category_id: { type: integer }
 *               budget_type: { type: string, enum: [monthly, annual] }
 *               year: { type: integer }
 *               month: { type: integer }
 *               amount: { type: number }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Budget created | Presupuesto creado
 *       400:
 *         description: Invalid request | Solicitud inválida
 */
router.post('/', async (req, res) => {
  try {
    const budget = await budgetService.createBudget(req.body);
    res.status(201).json(budget);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     tags: [Budgets]
 *     summary: Update budget fully | Actualizar presupuesto completamente
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
 *             properties:
 *               user_id: { type: integer }
 *               category_id: { type: integer }
 *               budget_type: { type: string }
 *               year: { type: integer }
 *               month: { type: integer }
 *               amount: { type: number }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Budget updated | Presupuesto actualizado
 *       404:
 *         description: Budget not found | Presupuesto no encontrado
 */
router.put('/:id', async (req, res) => {
  try {
    await budgetService.updateBudget(req.params.id, req.body);
    res.json({ message: 'Budget updated' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /budgets/{id}:
 *   patch:
 *     tags: [Budgets]
 *     summary: Partially update budget | Actualizar parcialmente presupuesto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: integer }
 *               category_id: { type: integer }
 *               budget_type: { type: string }
 *               year: { type: integer }
 *               month: { type: integer }
 *               amount: { type: number }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Budget partially updated | Presupuesto parcialmente actualizado
 *       404:
 *         description: Budget not found | Presupuesto no encontrado
 */
router.patch('/:id', async (req, res) => {
  try {
    await budgetService.updateBudget(req.params.id, req.body);
    res.json({ message: 'Budget patched' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     tags: [Budgets]
 *     summary: Delete budget | Eliminar presupuesto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Budget deleted | Presupuesto eliminado
 *       404:
 *         description: Budget not found | Presupuesto no encontrado
 */
router.delete('/:id', async (req, res) => {
  try {
    await budgetService.deleteBudget(req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

export default router;
