// src/modules/profiles/profile.controller.mjs

import express from 'express';
import * as profileService from './profile.service.mjs';
import { authenticate, authorize } from '../auth/auth.middleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Gestión de perfiles de usuario | User profiles management
 */

/**
 * @swagger
 * /profiles:
 *   get:
 *     tags: [Profiles]
 *     summary: Obtiene todos los perfiles | Get all profiles
 *     description: Solo accesible por administradores | Only accessible by admins
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de perfiles | List of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', authenticate, authorize([1]), async (req, res) => {
  try {
    const profiles = await profileService.getAllProfiles();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ 
      error: err.message || 'Error al obtener perfiles | Error fetching profiles'
    });
  }
});

export default router;
