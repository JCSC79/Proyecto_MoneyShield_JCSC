// src/modules/savings/saving.controller.mjs

import express from 'express';
import * as savingsService from './saving.service.mjs';
import { validateIdParam } from '../../middlewares/validateParams.middleware.mjs';
import { authenticate } from '../auth/auth.middleware.mjs';
import { allowSelfOrAdminSaving, forceSelfFilter } from '../../middlewares/accessControl.middleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Savings
 *   description: Savings management | Gestión de ahorros
 */

/**
 * @swagger
 * /savings:
 *   get:
 *     tags: [Savings]
 *     summary: Get all savings for a user | Obtener todos los ahorros de un usuario
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of savings | Lista de ahorros
 */
router.get('/', authenticate, forceSelfFilter, async (req, res) => {
  const result = await savingsService.getAllSavings({ user_id: req.filtroForzado.user_id});
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /savings/{id}:
 *   get:
 *     tags: [Savings]
 *     summary: Get saving by ID | Obtener ahorro por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saving found | Ahorro encontrado
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 */
router.get('/:id', validateIdParam, authenticate, allowSelfOrAdminSaving, async (req, res) => {
  const result = await savingsService.getSavingById(req.params.id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /savings:
 *   post:
 *     tags: [Savings]
 *     summary: Create new saving | Crear un nuevo ahorro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - type_id
 *               - name
 *               - amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               target_amount:
 *                 type: number
 *                 nullable: true
 *               target_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Saving created | Ahorro creado
 *       400:
 *         description: Invalid request | Solicitud inválida
 */
router.post('/', authenticate, async (req, res) => {
  const data = { ...req.body, user_id: req.user.id }; // Aseguramos que el user_id sea del usuario autenticado
  const result = await savingsService.createSaving(data);
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /savings/{id}:
 *   put:
 *     tags: [Savings]
 *     summary: Update saving fully | Actualizar ahorro completamente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_id
 *               - name
 *               - amount
 *             properties:
 *               type_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               target_amount:
 *                 type: number
 *                 nullable: true
 *               target_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Saving updated | Ahorro actualizado
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 */
router.put('/:id', validateIdParam,  authenticate, allowSelfOrAdminSaving, async (req, res) => {
  const result = await savingsService.updateSaving(req.params.id, req.body);
  if (result.success) {
    res.status(200).json(result.data); // Cambio 27 de junio
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /savings/{id}:
 *   patch:
 *     tags: [Savings]
 *     summary: Partially update saving | Actualizar parcialmente un ahorro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type_id: { type: integer }
 *               name: { type: string }
 *               amount: { type: number }
 *               target_amount: { type: number, nullable: true }
 *               target_date: { type: string, format: date, nullable: true }
 *     responses:
 *       200:
 *         description: Saving partially updated | Ahorro parcialmente actualizado
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 *       400:
 *         description: Invalid request | Solicitud inválida
 */
router.patch('/:id', validateIdParam, authenticate, allowSelfOrAdminSaving, async (req, res) => {
  const result = await savingsService.patchSaving(req.params.id, req.body);
  if (result.success) {
    res.status(200).json(result.data); // Cambio 27 de junio
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /savings/{id}:
 *   delete:
 *     tags: [Savings]
 *     summary: Delete saving | Eliminar ahorro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saving deleted | Ahorro eliminado
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 */
router.delete('/:id', validateIdParam, authenticate, allowSelfOrAdminSaving, async (req, res) => {
  const result = await savingsService.deleteSaving(req.params.id);
  if (result.success) {
    res.status(200).json({ success: true, id: Number(req.params.id) }); // Cambio 27 de junio
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /savings/report/progress:
 *   get:
 *     tags: [Savings]
 *     summary: Get savings progress for a user | Progreso de ahorros de un usuario
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: "Savings progress | Progreso de ahorros"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 1 }
 *                   name: { type: string, example: "Vacaciones" }
 *                   amount: { type: number, example: 500.00 }
 *                   target_amount: { type: number, example: 2000.00 }
 *                   target_date: { type: string, format: date, example: "2025-12-31" }
 *                   progress_percent: { type: number, example: 25.00 }
 *                   days_left: { type: integer, example: 180 }
 */
router.get('/report/progress', authenticate, forceSelfFilter, async (req, res) => {
  const result = await savingsService.getSavingsProgress({ user_id: req.filtroForzado.user_id });
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

export default router;
