// src/modules/budgets/budget.controller.mjs

import express from 'express';
import * as budgetService from './budget.service.mjs';
import { validateIdParam } from '../../middlewares/validateParams.middleware.mjs';
import { authenticate } from '../auth/auth.middleware.mjs';
import { allowSelfOrAdminBudget, forceSelfFilter } from '../../middlewares/accessControl.middleware.mjs';

const router = express.Router();

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
router.get('/', authenticate, forceSelfFilter, async (req, res) => {
  const result = await budgetService.getAllBudgets(req.query);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.get('/:id', validateIdParam, authenticate, allowSelfOrAdminBudget, async (req, res) => {
  const result = await budgetService.getBudgetById(req.params.id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
 *             required: [category_id, budget_type, year, amount]
 *             properties:
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
router.post('/', authenticate, async (req, res) => {
  const data = { ...req.body, user_id: req.user.id }; // Aseguramos que el user_id sea del usuario autenticado
  const result = await budgetService.createBudget(data);
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.put('/:id', validateIdParam, authenticate, allowSelfOrAdminBudget, async (req, res) => {
  const result = await budgetService.updateBudget(req.params.id, req.body);
  if (result.success) {
    res.status(200).json(result.data); // Cambio 27 junio
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.patch('/:id', validateIdParam, authenticate, allowSelfOrAdminBudget, async (req, res) => {
  const result = await budgetService.updateBudget(req.params.id, req.body);
  if (result.success) {
    res.status(200).json(result.data); // Cambio 27 junio
  } else {
    res.status(result.error.code).json({ error: result.error.message });
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
router.delete('/:id', validateIdParam, authenticate, allowSelfOrAdminBudget, async (req, res) => {
  const result = await budgetService.deleteBudget(req.params.id);
  if (result.success) {
    res.status(200).json({ success: true, id: Number(req.params.id) }); // Cambio 27 junio
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /budgets/report/remaining:
 *   get:
 *     tags: [Budgets]
 *     summary: Get remaining budget by category | Presupuesto restante por categoría
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *         required: true
 *         description: "User ID | ID de usuario"
 *     responses:
 *       200:
 *         description: Remaining budget data | Datos de presupuesto restante
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: integer
 *                     example: 3
 *                   category:
 *                     type: string
 *                     example: "Housing"
 *                   budget:
 *                     type: number
 *                     example: 750.00
 *                   spent:
 *                     type: number
 *                     example: 1200.00
 *                   remaining:
 *                     type: number
 *                     example: -450.00
 */
router.get('/report/remaining', authenticate, forceSelfFilter, async (req, res) => {
  const user_id = Number(req.query.user_id);
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  const result = await budgetService.getRemainingBudget(req.filtroForzado.user_id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /budgets/report/alerts:
 *   get:
 *     tags: [Budgets]
 *     summary: Get budget alerts when spending exceeds a threshold | Alertas de presupuesto
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *         required: true
 *         description: "User ID | ID de usuario"
 *       - in: query
 *         name: threshold
 *         schema: { type: integer }
 *         required: false
 *         description: "Alert threshold (default 80) | Umbral de alerta (por defecto 80)"
 *     responses:
 *       200:
 *         description: "Budget alerts | Alertas de presupuesto"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: integer
 *                     example: 2
 *                   category:
 *                     type: string
 *                     example: "Supermercado"
 *                   budget:
 *                     type: number
 *                     example: 500.00
 *                   spent:
 *                     type: number
 *                     example: 400.00
 *                   percentage_spent:
 *                     type: number
 *                     example: 80.00
 */
router.get('/report/alerts', authenticate, forceSelfFilter, async (req, res) => {
  const user_id = Number(req.query.user_id);
  const threshold = req.query.threshold ? Number(req.query.threshold) : 80;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  const result = await budgetService.getBudgetAlerts(user_id, threshold);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

export default router;
