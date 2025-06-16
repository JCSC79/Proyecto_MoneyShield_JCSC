// src/modules/users/user.service.mjs

import * as userDao from './user.dao.mjs'; // Importa el DAO de usuario | Import user DAO
import db from '../../db/DBHelper.mjs';
import bcrypt from 'bcryptjs'; // Librería para encriptar contraseñas | Library for password hashing
import { Result } from '../../utils/result.mjs'; // Importa clase Result para manejar resultados de operaciones | Import Result class to handle operation results
import { isValidEmail, isStrongPassword, validateUserId } from '../../utils/validation.mjs'; // Importa funciones de validación | Import validation functions



// Campos permitidos para actualización parcial | Allowed fields for partial update
const ALLOWED_PATCH_FIELDS = new Set([
  'first_name', 'last_name', 'email',
  'password_hash', 'profile_id',
  'base_budget', 'base_saving'
]);

// Filtra campos sensibles de usuario | Omit sensitive user fields
function omitPassword(user) {
  if (!user) {
    return null;
  }
  const { password_hash, ...rest } = user;
  return rest;
}

// Obtener todos los usuarios | Get all users
export async function getAllUsers() {
  try {
    const users = await userDao.getAllUsers();
    return Result.Success(users.map(omitPassword));
  } catch (error) {
    console.error("Error en getAllUsers:", error); // Log interno para depuración | Internal log for debugging
    return Result.Fail('Internal server error', 500); // Mensaje y código HTTP de error | Error message and HTTP code
  }
}

// Obtener usuario por ID | Get user by ID
export async function getUserById(id) {
  const idValidation = validateUserId(id);
  if (!idValidation.success) {
    return idValidation;
  }
  try {
    const user = await userDao.getUserById(id);
    return user
      ? Result.Success(omitPassword(user))
      : Result.Fail('User not found', 404);
  } catch (error) {
    console.error("Error en getUserById:", error); // Log interno para depuración | Internal log for debugging
    return Result.Fail('Internal server error', 500); // Mensaje y código HTTP de error | Error message and HTTP code
  }
}

// Crear un nuevo usuario | Create a new user
export async function createUser(userData) {
  // Validar campos requeridos | Validate required fields
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      return Result.Fail(`Missing required field: ${field}`, 400);
    }
  }

  // Validar formato y fortaleza de contraseña | Validate password format and strength
  if (!isStrongPassword(userData.password_hash)) {
    return Result.Fail(
      'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
      400
    );
  }

  // Validar email | Validate email format
  if (!isValidEmail(userData.email)) {
    return Result.Fail('Invalid email format', 400);
  }

  // Validar unicidad de email | Validate email uniqueness
  const existing = await userDao.getUserByEmail(userData.email);
  if (existing) {
    return Result.Fail('Email already exists', 409);
  }

  // Validar perfil existente | Validate existing profile
  const profileExists = await userDao.profileExists(userData.profile_id);
  if (!profileExists) {
    return Result.Fail('Profile does not exist', 400);
  }

  // Hashear la contraseña antes de guardar | Hash the password before saving
  const hashedPassword = await bcrypt.hash(userData.password_hash, 10);
  userData.password_hash = hashedPassword;

  // Transacción para operación atómica | Transaction for atomic operation
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const user = await userDao.createUser(userData, connection);

    await connection.commit();
    return Result.Success(omitPassword(user));
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error en createUser:", error);
    return Result.Fail('Error creating user', 500);
  } finally {
    if (connection) connection.release();
  }
}

// Actualizar completamente un usuario | Fully update a user
export async function editUser(id, userData) {
  const idValidation = validateUserId(id);
  if (!idValidation.success) {
    return idValidation;
  }

  // Validación de campos requeridos | Required fields validation
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      return Result.Fail(`Missing required field: ${field}`, 400);
    }
  }

  // Validaciones comunes | Common validations
  const commonResult = await commonValidations(id, userData);
  if (!commonResult.success) {
    return commonResult;
  }

  // Hashear contraseña si está presente | Hash password if present
  if (userData.password_hash) {
    userData.password_hash = await bcrypt.hash(userData.password_hash, 10);
  }

  try {
    const updated = await userDao.updateUser(id, userData);
    return updated
      ? Result.Success(true)
      : Result.Fail('User not found', 404);
  } catch (error) {
    // Mejora clave: mensaje controlado y código 500 | Controlled message and 500 code
    console.error("Error en editUser:", error); // Log interno
    return Result.Fail('Error updating user', 500); //  Mensaje seguro
  }
}

// Actualizar parcialmente un usuario | Patch a user
export async function patchUser(id, fields) {
  const idValidation = validateUserId(id);
  if (!idValidation.success) {
    return idValidation;
  }

  const invalidFields = Object.keys(fields).filter(f => !ALLOWED_PATCH_FIELDS.has(f));
  if (invalidFields.length > 0) {
    return Result.Fail(`Invalid fields: ${invalidFields.join(', ')}`, 400);
  }

  const commonResult = await commonValidations(id, fields);
  if (!commonResult.success) {
    return commonResult;
  }

  if (fields.password_hash) {
    fields.password_hash = await bcrypt.hash(fields.password_hash, 10);
  }

  try {
    const updated = await userDao.patchUser(id, fields);
    return updated
      ? Result.Success(true)
      : Result.Fail('User not found or no valid fields to update', 404);
  } catch (error) {
    console.error("Error en patchUser:", error); // Log interno para depuración | Internal log for debugging
    return Result.Fail('Error patching user', 500); // Mensaje seguro | Safe message
  }
}

// Eliminar un usuario | Delete a user
export async function deleteUser(id) {
  const idValidation = validateUserId(id);
  if (!idValidation.success) {
    return idValidation;
  }

  try {
    const userExists = await userDao.getUserById(id);
    if (!userExists) {
      return Result.Fail('User not found', 404);
    }
    const deleted = await userDao.deleteUser(id);
    return deleted
      ? Result.Success(true)
      : Result.Fail('Delete operation failed', 500);
  } catch (error) {
    console.error("Error en deleteUser:", error); // Log interno para depuración | Internal log for debugging
    return Result.Fail('Error deleting user', 500); // Mensaje seguro | Safe message
  }
}

// Helpers de validación comunes | Common validation helpers
async function commonValidations(id, data) {
  if (data.email) {
    if (!isValidEmail(data.email)) {
      return Result.Fail('Invalid email format', 400);
    }
    const existing = await userDao.getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      return Result.Fail('Email already exists', 409);
    }
  }
  if (data.profile_id) {
    const profileExists = await userDao.profileExists(data.profile_id);
    if (!profileExists) {
      return Result.Fail('Profile does not exist', 400);
    }
  }
  if (data.password_hash && !isStrongPassword(data.password_hash)) {
    return Result.Fail('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 400);
  }
  return Result.Success(true);
}
