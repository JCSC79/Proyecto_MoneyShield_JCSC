// src/modules/savings/saving.controller.mjs

import express from 'express';
import * as savingsService from './saving.service.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Savings
 *   description: Savings management | Gestión de ahorros
 */

// Helper para status HTTP según error
function getStatus(err) {
  return err.status || 400;
}

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
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    const savings = await savingsService.getAllSavings(user_id);
    res.json(savings);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
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
router.get('/:id', async (req, res) => {
  try {
    const saving = await savingsService.getSavingById(req.params.id);
    res.json(saving);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
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
router.post('/', async (req, res) => {
  try {
    const saving = await savingsService.createSaving(req.body);
    res.status(201).json(saving);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
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
router.put('/:id', async (req, res) => {
  try {
    await savingsService.updateSaving(req.params.id, req.body);
    res.json({ message: 'Saving updated' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
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
router.delete('/:id', async (req, res) => {
  try {
    await savingsService.deleteSaving(req.params.id);
    res.json({ message: 'Saving deleted' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

export default router;
