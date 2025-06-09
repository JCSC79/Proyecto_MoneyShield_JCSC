// src/modules/users/user.controller.mjs

import express from 'express'; // Importar express | Importar el servicio de usuario
import * as userService from './user.service.mjs'; // Importar el servicio de usuario | Import user service
import { authenticate, authorize } from '../auth/auth.middleware.mjs'; // Importar middleware de autenticación y autorización | Import authentication and authorization middleware

const router = express.Router(); // Crear un router de Express | Create an Express router

/**
 * Middleware: Permite solo admin o el propio usuario
 */
function allowSelfOrAdmin(req, res, next) {
  if (req.user.profile_id === 1 || req.user.id === Number(req.params.id)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management | Gestión de usuarios
 */

// Helper para status HTTP según error | Helper to get HTTP status based on error
function getStatus(err) {
  return err.status || 400;
}

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
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
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
router.get('/:id', authenticate, allowSelfOrAdmin, async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
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
  try {
    // Forzar siempre perfil de usuario normal (profile_id: 2)
    // Esto es para evitar que se creen usuarios con perfil de admin desde el endpoint de creación
    const userData = {
      ...req.body,
      profile_id: 2
    };
    const user = await userService.createUser(userData);
    res.status(201).json(user);
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
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
router.put('/:id', authenticate, allowSelfOrAdmin, async (req, res) => {
  try {
    await userService.editUser(req.params.id, req.body);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
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
router.patch('/:id', authenticate, allowSelfOrAdmin, async (req, res) => {
  try {
    await userService.patchUser(req.params.id, req.body);
    res.json({ message: 'User patched' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
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
router.delete('/:id', authenticate, allowSelfOrAdmin, async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message });
  }
});

export default router;
