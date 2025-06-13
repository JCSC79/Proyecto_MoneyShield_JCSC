// src/modules/users/user.service.mjs

import * as userDao from './user.dao.mjs';
import db from '../../db/DBHelper.mjs';
import bcrypt from 'bcryptjs'; // Librería para encriptar contraseñas | Library for password hashing
import { Result } from '../../utils/result.mjs';
import { isValidEmail, isStrongPassword, isValidId } from '../../utils/validation.mjs';

// Clases de error personalizadas | Custom error classes

// class ValidationError extends Error {// Error de validación personalizada | Custom validation error
//   constructor(message) {
//     super(message);
//     this.name = 'ValidationError';
//     this.status = 400;
//   }
// }

// class NotFoundError extends Error {// Error de no encontrado personalizada | Custom not found error
//   constructor(message) {
//     super(message);
//     this.name = 'NotFoundError';
//     this.status = 404;
//   }
// }

class ConflictError extends Error {// Error de conflicto personalizada | Custom conflict error
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

// Nueva validateUserId usando utils | New validateUserId using utils
function validateUserId(id) {
  if (!isValidId(id)) {
    throw new ValidationError('Invalid user ID');
  }
}

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
  if (!user) {
    return null;
  }
  const { password_hash, ...rest } = user;
  return rest;
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
// Actualizar la función getUserById
export async function getUserById(id) {
  try {
    // Validación usando utils (devuelve Result)
    if (!isValidId(id)) {
      return Result.Fail('Invalid user ID', 400);
    }

    const user = await userDao.getUserById(id);
    
    if (!user) {
      return Result.Fail('User not found', 404);
    }
    
    return Result.Success(omitPassword(user));
  } catch (error) {
    return Result.Fail('Internal server error', 500);
  }
}

// Eliminé las clases de error personalizadas (ValidationError, NotFoundError, etc.)
// Ya no son necesarias gracias el patrón Result


/**
 * Crear un nuevo usuario | Create a new user (Modificación 13/06/2023)
 */
export async function createUser(userData) {
  try {
    // 1. Validación de campos requeridos
    const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return Result.Fail(`Missing required field: ${field}`, 400);
      }
    }

    // 2. Validación de formato de contraseña
    if (!isStrongPassword(userData.password_hash)) {
      return Result.Fail(
        'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
        400
      );
    }

    // 3. Validación de formato de email
    if (!isValidEmail(userData.email)) {
      return Result.Fail('Invalid email format', 400);
    }

    // 4. Validación de unicidad de email
    const existing = await userDao.getUserByEmail(userData.email);
    if (existing) {
      return Result.Fail('Email already exists', 409);
    }

    // 5. Validación de perfil existente
    const profileExists = await userDao.profileExists(userData.profile_id);
    if (!profileExists) {
      return Result.Fail('Profile does not exist', 400);
    }

    // 6. Hashear contraseña
    const hashedPassword = await bcrypt.hash(userData.password_hash, 10);
    userData.password_hash = hashedPassword;

    // 7. Transacción de base de datos
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const user = await userDao.createUser(userData, connection);
      await connection.commit();

      return Result.Success(omitPassword(user));
    } catch (error) {
      // Rollback en caso de error
      if (connection) await connection.rollback();
      return Result.Fail('Database operation failed', 500);
    } finally {
      // Liberar conexión siempre
      if (connection) connection.release();
    }
  } catch (error) {
    // Capturar errores inesperados
    return Result.Fail('Internal server error', 500);
  }
}

/**
 * Actualiza completamente un usuario | Fully update a user
 */
export async function editUser(id, userData) {
  validateUserId(id);
  
  // Valida campos requeridos | Validate required fields
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  // Validaciones comunes | Common validations
  await commonValidations(id, userData);

  // Hashear la contraseña si está presente | Hash the password if present
  if (userData.password_hash) {
    userData.password_hash = await bcrypt.hash(userData.password_hash, 10);
  }

  // Actualizar usuario | Update user
  const updated = await userDao.updateUser(id, userData);
  if (!updated) {
    throw new NotFoundError('User not found');
  }
  return true;
}

/**
 * Actualizar parcialmente un usuario | Partially update a user
 */
export async function patchUser(id, fields) {
  validateUserId(id);
  
  // Validar campos permitidos | Validate allowed fields
  const invalidFields = Object.keys(fields).filter(f => !ALLOWED_PATCH_FIELDS.has(f));
  if (invalidFields.length > 0) {
    throw new ValidationError(`Invalid fields: ${invalidFields.join(', ')}`);
  }

  // Validaciones comunes | Common validations
  await commonValidations(id, fields);

  // Hashear la contraseña si está presente | Hash the password if present
  if (fields.password_hash) {
    fields.password_hash = await bcrypt.hash(fields.password_hash, 10);
  }

  // Actualizar | Update user
  const updated = await userDao.patchUser(id, fields);
  if (!updated) {
    throw new NotFoundError('User not found or no valid fields to update');
  }
  return true;
}

/**
 * Eliminar un usuario | Delete a user (Modificado 13/6/2023)
 */
export async function deleteUser(id) {
  try {
    if (!isValidId(id)) {
      return Result.Fail('Invalid user ID', 400);
    }

    const deleted = await userDao.deleteUser(id);
    return deleted 
      ? Result.Success(true)
      : Result.Fail('User not found', 404); // <-- Manejar no encontrado
  } catch (error) {
    return Result.Fail('Internal server error', 500);
  }
}


// Funciones de ayuda | Helper functions
async function commonValidations(id, data) {
  // Validar email si está presente | Validate email if present
  if (data.email) {
    if (!isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }
    const existing = await userDao.getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      throw new ConflictError('Email already exists');
    }
  }

  // Validar profile_id si está presente | Validate profile_id if present
  if (data.profile_id) {
    const profileExists = await userDao.profileExists(data.profile_id);
    if (!profileExists) {
      throw new ValidationError('Profile does not exist');
    }
  }

  // Validar password si está presente | Validate password if present
  if (data.password_hash && !isStrongPassword(data.password_hash)) {
    throw new ValidationError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
  }
}