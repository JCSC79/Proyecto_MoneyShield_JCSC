// src/modules/auth/auth.controller.mjs

import express from 'express';
import * as authService from './auth.service.mjs';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get JWT | Iniciar sesión y obtener JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, JWT returned
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  if (result.success) {
    res.json({ token: result.data });
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

export default router;
