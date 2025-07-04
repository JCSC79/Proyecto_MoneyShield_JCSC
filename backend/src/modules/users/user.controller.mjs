// src/modules/users/user.controller.mjs

import express from 'express'; // Importamos express | Import el servicio de usuario
import * as userService from './user.service.mjs'; // Importamos el servicio de usuario | Import user service
import { authenticate, authorize } from '../auth/auth.middleware.mjs'; // Importamos middleware de autenticación y autorización | Import authentication and authorization middleware
import { validateIdParam } from '../../middlewares/validateParams.middleware.mjs'; // Importamos middleware de validación de parámetros | Import parameter validation middleware
import { allowSelfOrAdmin } from '../../middlewares/accessControl.middleware.mjs'; // Importamos middleware de control de acceso | Import access control middleware

const router = express.Router(); // Crear un router de Express | Create an Express router

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile | Obtener perfil de usuario actual
 *     responses:
 *       200:
 *         description: User profile | Perfil de usuario
 *       404:
 *         description: User not found | Usuario no encontrado
 */
router.get('/me', authenticate, async (req, res) => {
  const result = await userService.getUserById(req.user.id);
  result.success
    ? res.status(200).json(result.data)
    : res.status(result.error.code).json({ error: result.error.message });
});


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management | Gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users | Obtener todos los usuarios
 *     responses:
 *       200:
 *         description: List of users | Lista de usuarios
 */
router.get('/', authenticate, authorize([1]), async (req, res) => {
  const result = await userService.getAllUsers();
  result.success
    ? res.json(result.data)
    : res.status(result.error.code).json({ error: result.error.message });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID | Obtener usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found | Usuario encontrado
 *       404:
 *         description: User not found | Usuario no encontrado
 */
router.get('/:id', validateIdParam, authenticate, allowSelfOrAdmin, async (req, res) => {
  const result = await userService.getUserById(req.params.id);
  result.success
    ? res.status(200).json(result.data)
    : res.status(result.error.code).json({ error: result.error.message });
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user | Crear un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password_hash, profile_id]
 *             properties:
 *               first_name: {type: string}
 *               last_name: {type: string}
 *               email: {type: string, format: email}
 *               password_hash: {type: string}
 *               profile_id: {type: integer, enum: [1, 2]} # 1 = admin, 2 = user
 *               base_budget: {type: number, default: 0}
 *               base_saving: {type: number, default: 0}
 *     responses:
 *      201:
 *        description: User created | Usuario creado
 *      400:
 *        description: Bad request | Solicitud incorrecta
 */
router.post('/', async (req, res) => {
  const userData = req.body;
  const result = await userService.createUser(userData);
  result.success
    ? res.status(201).json(result.data)
    : res.status(result.error.code).json({ error: result.error.message });
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user fully | Actualizar usuario completamente
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
 *               - first_name
 *               - last_name
 *               - email
 *               - password_hash
 *               - profile_id
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password_hash:
 *                 type: string
 *               profile_id:
 *                 type: integer
 *               base_budget:
 *                 type: number
 *               base_saving:
 *                 type: number
 *     responses:
 *       200:
 *         description: User updated | Usuario actualizado
 *       404:
 *         description: User not found | Usuario no encontrado
 *       409:
 *         description: Email already exists | El email ya existe
 */
router.put('/:id', validateIdParam, authenticate, allowSelfOrAdmin, async (req, res) => {
  const result = await userService.editUser(req.params.id, req.body);
  result.success
    ? res.status(200).json(result.data) //Cambio 27 de junio para devolver datos actualizados
    : res.status(result.error.code).json({ error: result.error.message });
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Partially update user | Actualizar parcialmente usuario
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password_hash:
 *                 type: string
 *               profile_id:
 *                 type: integer
 *               base_budget:
 *                 type: number
 *               base_saving:
 *                 type: number
 *     responses:
 *       200:
 *         description: User partially updated | Usuario parcialmente actualizado
 *       404:
 *         description: User not found or no fields to update | Usuario no encontrado o sin campos para actualizar
 *       409:
 *         description: Email already exists | El email ya existe
 */
router.patch('/:id', validateIdParam, authenticate, allowSelfOrAdmin, async (req, res) => {
  const result = await userService.patchUser(req.params.id, req.body);
  result.success
    ? res.status(200).json(result.data) // Cambio 27 de junio para devolver datos actualizados
    : res.status(result.error.code).json({ error: result.error.message });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user | Eliminar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted | Usuario eliminado
 *       404:
 *         description: User not found | Usuario no encontrado
 */
router.delete('/:id', validateIdParam, authenticate, allowSelfOrAdmin, async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  result.success
    ? res.status(200).json({ success: true, id: Number(req.params.id) }) // Cambio 27 de junio para devolver ID eliminado
    : res.status(result.error.code).json({ error: result.error.message });
});

export default router;