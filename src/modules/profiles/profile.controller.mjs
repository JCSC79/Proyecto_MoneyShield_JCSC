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
 *         description: No autorizado | Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Prohibido | Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 */
router.get('/', authenticate, authorize([1]), async (req, res) => {
  const result = await profileService.getAllProfiles();
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /profiles:
 *   post:
 *     tags: [Profiles]
 *     summary: Crea un nuevo perfil | Create a new profile
 *     description: Solo accesible por administradores | Only accessible by admins
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del perfil | Profile name
 *                 example: "Administrador"
 *     responses:
 *       201:
 *         description: Perfil creado exitosamente | Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Solicitud inválida | Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid request"
 *       401:
 *         description: No autorizado | Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Prohibido | Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 */
router.post('/', authenticate, authorize([1]), async (req, res) => {
  const { name } = req.body;
  const result = await profileService.createProfile(name);
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     tags: [Profiles]
 *     summary: Obtiene un perfil por ID | Get a profile by ID
 *     description: Solo accesible por administradores | Only accessible by admins
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del perfil | Profile ID
 *     responses:
 *       200:
 *         description: Perfil encontrado | Profile found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: No encontrado | Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Profile not found"
 *       401:
 *         description: No autorizado | Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Prohibido | Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 */
router.get('/:id', authenticate, authorize([1]), async (req, res) => {
  const result = await profileService.getProfileById(req.params.id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

/**
 * @swagger
 * /profiles/{id}:
 *   delete:
 *     tags: [Profiles]
 *     summary: Elimina un perfil por ID | Delete a profile by ID
 *     description: Solo accesible por administradores | Only accessible by admins
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del perfil | Profile ID
 *     responses:
 *       200:
 *         description: Perfil eliminado exitosamente | Profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile deleted"
 *       404:
 *         description: No encontrado | Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Profile not found"
 *       401:
 *         description: No autorizado | Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Prohibido | Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 */
router.delete('/:id', authenticate, authorize([1]), async (req, res) => {
  const result = await profileService.deleteProfile(req.params.id);
  if (result.success) {
    res.status(200).json({ message: 'Profile deleted' });
  } else {
    res.status(result.error.code).json({ error: result.error.message });
  }
});

export default router;
