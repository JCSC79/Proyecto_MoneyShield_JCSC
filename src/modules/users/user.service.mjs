// src/modules/users/user.service.mjs

import * as userDao from './user.dao.mjs';
import db from '../../db/DBHelper.mjs';

// Clases de error personalizadas | Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

// Expresión regular mejorada para emails | Improved email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Campos permitidos para actualización parcial | Allowed fields for PATCH
const ALLOWED_PATCH_FIELDS = new Set([
  'first_name', 'last_name', 'email', 
  'password_hash', 'profile_id',
  'base_budget', 'base_saving'
]);

/**
 * Filtra campos sensibles de usuario | Filter sensitive user fields
 */
function omitPassword(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

/**
 * Valida formato de email | Validate email format
 */
function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

/**
 * Valida fortaleza de contraseña | Validate password strength
 */
function isStrongPassword(password) {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password);
}

/**
 * Valida ID de usuario | Validate user ID
 */
function validateUserId(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid user ID');
  }
}

/**
 * Obtener todos los usuarios | Get all users
 */
export async function getAllUsers() {
  const users = await userDao.getAllUsers();
  return users.map(omitPassword);
}

/**
 * Obtener usuario por ID | Get user by ID
 */
export async function getUserById(id) {
  validateUserId(id);
  const user = await userDao.getUserById(id);
  if (!user) throw new NotFoundError('User not found');
  return omitPassword(user);
}

/**
 * Crear un nuevo usuario | Create a new user
 */
export async function createUser(userData) {
  // Valida los campos requeridos
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  // Valida formato y fortaleza de contraseña
  if (!isStrongPassword(userData.password_hash)) {
    throw new ValidationError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
  }

  // Valida email
  if (!isValidEmail(userData.email)) {
    throw new ValidationError('Invalid email format');
  }

  // Valida unicidad de email
  const existing = await userDao.getUserByEmail(userData.email);
  if (existing) throw new ConflictError('Email already exists');

  // Valida perfil existente
  const profileExists = await userDao.profileExists(userData.profile_id);
  if (!profileExists) throw new ValidationError('Profile does not exist');

  // Transacción para operación atómica
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Crear usuario
    const user = await userDao.createUser(userData, connection);
    
    await connection.commit();
    return omitPassword(user);
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Actualiza completamente un usuario | Fully update a user
 */
export async function editUser(id, userData) {
  validateUserId(id);
  
  // Valida campos requeridos
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  // Validaciones comunes
  await commonValidations(id, userData);

  // Actualizar
  const updated = await userDao.updateUser(id, userData);
  if (!updated) throw new NotFoundError('User not found');
  return true;
}

/**
 * Actualizar parcialmente un usuario | Partially update a user
 */
export async function patchUser(id, fields) {
  validateUserId(id);
  
  // Validar campos permitidos
  const invalidFields = Object.keys(fields).filter(f => !ALLOWED_PATCH_FIELDS.has(f));
  if (invalidFields.length > 0) {
    throw new ValidationError(`Invalid fields: ${invalidFields.join(', ')}`);
  }

  // Validaciones comunes
  await commonValidations(id, fields);

  // Actualizar
  const updated = await userDao.patchUser(id, fields);
  if (!updated) throw new NotFoundError('User not found or no valid fields to update');
  return true;
}

/**
 * Eliminar un usuario | Delete a user
 */
export async function deleteUser(id) {
  validateUserId(id);
  const deleted = await userDao.deleteUser(id);
  if (!deleted) throw new NotFoundError('User not found');
  return true;
}

// Funciones de ayuda | Helper functions
async function commonValidations(id, data) {
  // Validar email si está presente
  if (data.email) {
    if (!isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }
    const existing = await userDao.getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      throw new ConflictError('Email already exists');
    }
  }

  // Validar profile_id si está presente
  if (data.profile_id) {
    const profileExists = await userDao.profileExists(data.profile_id);
    if (!profileExists) throw new ValidationError('Profile does not exist');
  }

  // Validar password si está presente
  if (data.password_hash && !isStrongPassword(data.password_hash)) {
    throw new ValidationError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
  }
}
