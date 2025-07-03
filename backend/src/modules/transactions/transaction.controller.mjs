// src/modules/transactions/transaction.controller.mjs

import express from 'express';
import * as transactionService from './transaction.service.mjs';
import { validateIdParam } from '../../middlewares/validateParams.middleware.mjs';
import { authenticate } from '../auth/auth.middleware.mjs';
//import { filterBySelfOrAdmin } from '../../middlewares/accessControl.middleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management | Gestión de transacciones
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions (optionally filtered) | Obtener todas las transacciones (opcionalmente filtradas)
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID | Filtrar por ID de usuario
 *       - in: query
 *         name: type_id
 *         schema:
 *           type: integer
 *         description: Filter by type ID | Filtrar por ID de tipo
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (inclusive) | Fecha de inicio (inclusiva)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (inclusive) | Fecha de fin (inclusiva)
 *     responses:
 *       200:
 *         description: List of transactions | Lista de transacciones
 */
// router.get('/', async (req, res) => {
//   const result = await transactionService.getAllTransactions(req.query);
//   if (result.success) {
//     res.status(200).json(result.data);
//   } else {
//     res.status(result.error.code).json({ error: result.error.message });
//   }
// });

router.get('/', authenticate, async (req, res) => {
  try {
    let filter = { ...req.query };

    if (req.user.profile_id !== 1) {
      // Usuario normal: solo puede ver sus propias transacciones
      filter.user_id = req.user.id;
    } else {
      // Admin: si no filtra por user_id, ve todas
      if (filter.user_id) {
        filter.user_id = Number(filter.user_id);
      }
    }

    const result = await transactionService.getAllTransactions(filter);
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(result.error.code).json({ error: result.error.message });
    }
  } catch (error) {
    logger.error(`[Transactions] Error en GET /transactions: ${error.message}`, { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get a transaction by ID | Obtener una transacción por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction found | Transacción encontrada
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.get('/:id', validateIdParam, async (req, res) => {
  const result = await transactionService.getTransactionById(req.params.id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});


/**
 * @swagger
 * /transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new transaction | Crear una nueva transacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - type_id
 *               - amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *                 description: Category ID (optional) | ID de categoría (opcional)
 *               amount:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created | Transacción creada
 *       400:
 *         description: Invalid request | Solicitud inválida
 */
router.post('/', async (req, res) => {
  const result = await transactionService.createTransaction(req.body);
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update a transaction fully | Actualizar completamente una transacción
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
 *             properties:
 *               user_id:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *                 description: Category ID (optional) | ID de categoría (opcional)
 *               amount:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated | Transacción actualizada
 *       400:
 *         description: Invalid request | Solicitud inválida
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.put('/:id', validateIdParam, async (req, res) => {
  const result = await transactionService.updateTransaction(req.params.id, req.body);
  if (result.success) {
    res.status(200).json(result.data); // Cambio 27 junio: Devolver datos actualizados
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     tags: [Transactions]
 *     summary: Partially update a transaction | Actualizar parcialmente una transacción
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
 *               user_id:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *                 description: Category ID (optional) | ID de categoría (opcional)
 *               amount:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction partially updated | Transacción parcialmente actualizada
 *       400:
 *         description: Invalid request | Solicitud inválida
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.patch('/:id', validateIdParam, async (req, res) => {
  const result = await transactionService.updateTransaction(req.params.id, req.body);
  if (result.success) {
    res.status(200).json(result.data); // Cambio 27 junio: Devolver datos actualizados
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction | Eliminar una transacción
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted | Transacción eliminada
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.delete('/:id', validateIdParam, async (req, res) => {
  const result = await transactionService.deleteTransaction(req.params.id);
  if (result.success) {
    res.status(200).json({ success: true, id: Number(req.params.id) }); // Cambio 27 junio: Devolver ID de la transacción eliminada
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

// =================== ENDPOINTS DE REPORTES FINANCIEROS ===================

/**
 * @swagger
 * /transactions/report/balance:
 *   get:
 *     tags: [Transactions]
 *     summary: Get user balance (ingresos - gastos) | Obtener balance del usuario
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID | ID de usuario
 *     responses:
 *       200:
 *         description: User balance | Balance del usuario
 */
router.get('/report/balance', async (req, res) => {
  const result = await transactionService.getUserBalance(req.query.user_id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/report/expenses-by-category:
 *   get:
 *     tags: [Transactions]
 *     summary: Get expenses by category | Obtener gastos por categoría
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID | ID de usuario
 *     responses:
 *       200:
 *         description: Expenses grouped by category | Gastos agrupados por categoría
 */
router.get('/report/expenses-by-category', async (req, res) => {
  const result = await transactionService.getExpensesByCategory(req.query.user_id);
  if (result.success) { 
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/report/monthly-expenses:
 *   get:
 *     tags: [Transactions]
 *     summary: Get monthly expenses evolution | Obtener evolución mensual de gastos
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID | ID de usuario
 *     responses:
 *       200:
 *         description: Monthly expenses evolution | Evolución mensual de gastos
 */
router.get('/report/monthly-expenses', async (req, res) => {
  const result = await transactionService.getMonthlyExpenses(req.query.user_id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/report/periodic-balance:
 *   get:
 *     tags: [Transactions]
 *     summary: Get periodic balance (weekly or monthly) | Obtener balance periódico (semanal o mensual)
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID | ID de usuario
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month]
 *         required: false
 *         description: Period ('week' or 'month'), default 'week' | Periodo ('week' o 'month'), por defecto 'week'
 *     responses:
 *       200:
 *         description: Periodic balance | Balance periódico
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   period:
 *                     type: string
 *                     example: "2025-06"  # o "2025-W23"
 *                   ingresos:
 *                     type: number
 *                     example: 1200.00
 *                   gastos:
 *                     type: number
 *                     example: 800.00
 *                   balance:
 *                     type: number
 *                     example: 400.00
 */
router.get('/report/periodic-balance', async (req, res) => {
  const result = await transactionService.getPeriodicBalance(
    req.query.user_id,
    req.query.period || 'week'
  );
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/report/top-categories:
 *   get:
 *     tags: [Transactions]
 *     summary: Get top spending categories for user (current month by default) | Top categorías de gasto del usuario
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *         required: true
 *         description: "User ID | ID de usuario"
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         required: false
 *         description: "Year (default: current year) | Año (por defecto: actual)"
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *         required: false
 *         description: "Month (default: current month) | Mes (por defecto: actual)"
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         required: false
 *         description: "Max categories to return (default: 3) | Máximo de categorías (por defecto: 3)"
 *     responses:
 *       200:
 *         description: "Top categories | Top categorías"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     example: "Food"
 *                   total:
 *                     type: number
 *                     example: 250.00
 */
router.get('/report/top-categories', async (req, res) => {
  const { user_id, year, month, limit } = req.query;
  const result = await transactionService.getTopCategories(
    user_id,
    {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      limit: limit ? Number(limit) : 3
    }
  );
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/report/spending-patterns:
 *   get:
 *     tags: [Transactions]
 *     summary: Get spending patterns by day of week or day of month | Patrones de gasto por día de la semana o del mes
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *         required: true
 *         description: "User ID | ID de usuario"
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         required: false
 *         description: "Year (optional) | Año (opcional)"
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *         required: false
 *         description: "Month (optional) | Mes (opcional)"
 *       - in: query
 *         name: mode
 *         schema: { type: string, enum: [week, month] }
 *         required: false
 *         description: "Grouping mode: week (default, by day of week) or month (by day of month)"
 *     responses:
 *       200:
 *         description: Spending patterns | Patrones de gasto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: string
 *                     example: "Monday"  # o "15" para día del mes
 *                   total:
 *                     type: number
 *                     example: 120.00
 */
router.get('/report/spending-patterns', async (req, res) => {
  const { user_id, year, month, mode } = req.query;
  const result = await transactionService.getSpendingPatterns(
    user_id,
    {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      mode: mode || 'week'
    }
  );
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /transactions/report/forecast:
 *   get:
 *     tags: [Transactions]
 *     summary: Get monthly spending forecast | Proyección de gasto mensual
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *         required: true
 *         description: "User ID | ID de usuario"
 *     responses:
 *       200:
 *         description: "Forecast data | Datos de proyección"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gasto_actual:
 *                   type: number
 *                   example: 1200.00
 *                 dias_transcurridos:
 *                   type: integer
 *                   example: 5
 *                 dias_mes:
 *                   type: integer
 *                   example: 30
 *                 proyeccion_mes:
 *                   type: number
 *                   example: 7200.00
 */
router.get('/report/forecast', async (req, res) => {
  const result = await transactionService.getMonthlyForecast(req.query.user_id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

export default router;