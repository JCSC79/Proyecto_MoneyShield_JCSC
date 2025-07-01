// src/modules/users/user.service.mjs

import * as userDao from './user.dao.mjs'; // Importa el DAO de usuario | Import user DAO
import bcrypt from 'bcryptjs'; // Librería para encriptar contraseñas | Library for password hashing
import { Result } from '../../utils/result.mjs'; // Importa clase Result para manejar resultados de operaciones | Import Result class to handle operation results
import { isValidEmail, isStrongPassword, checkRequiredFields, commonUserValidations } from '../../utils/validation.mjs'; // Importa funciones de validación | Import validation functions
import { Errors } from '../../constants/errorMessages.mjs'; // Importa los mensajes centralizados | Import centralized error messages
import { withTransaction } from '../../db/withTransaction.mjs';
import { omitPassword } from '../../utils/omitFields.mjs';
import { logger } from '../../utils/logger.mjs'; // Importa el logger para registrar errores y eventos | Import logger to log errors and events

// Prueba de log manual | Manual log test
logger.error('Prueba de log manual');
logger.info('Prueba de log info');

// Campos permitidos para actualización parcial | Allowed fields for partial update
const ALLOWED_PATCH_FIELDS = new Set([
  'first_name', 'last_name', 'email',
  'password_hash', 'profile_id',
  'base_budget', 'base_saving'
]);

// Obtener todos los usuarios | Get all users
export async function getAllUsers() {
  try {
    const users = await userDao.getAllUsers();
    return Result.Success(users.map(omitPassword));
  } catch (error) {
    logger.error(`[Users] Error en getAllUsers: ${error.message}`, { error }); // Nuevo logger 27 de junio
    return Result.Fail('Internal server error', 500); // Mensaje centralizado 25 de junio
  }
}

// Obtener usuario por ID | Get user by ID
export async function getUserById(id) {
  try {
    const user = await userDao.getUserById(Number(id));
    return user
      ? Result.Success(omitPassword(user))
      : Result.Fail(Errors.NOT_FOUND('User'), 404); // Mensaje centralizado (25 de junio)
  } catch (error) {
    logger.error(`[Users] Error en getUserById: ${error.message}`, { error }); // Nuevo logger 27 de junio
    return Result.Fail('Internal server error', 500); // Mensaje centralizado 25 de junio
  }
}

// Crear un nuevo usuario | Create a new user
export async function createUser(userData) {
  // Validar campos requeridos | Validate required fields
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  const missingField = checkRequiredFields(userData, requiredFields);
  if (missingField) {
    return Result.Fail(Errors.MISSING_FIELD(missingField), 400); // Mensaje centralizado 25 de junio
  }

  // Validar formato y fortaleza de contraseña | Validate password format and strength
  if (!isStrongPassword(userData.password_hash)) {
    return Result.Fail(Errors.INVALID_PASSWORD, 400); // Mensaje centralizado 25 de junio
  }

  // Validar email | Validate email format
  if (!isValidEmail(userData.email)) {
    return Result.Fail(Errors.INVALID_EMAIL, 400); // Mensaje centralizado 25 de junio
  }

  // Validar unicidad de email | Validate email uniqueness
  const existing = await userDao.getUserByEmail(userData.email);
  if (existing) {
    return Result.Fail(Errors.EMAIL_EXISTS, 409); // Mensaje centralizado 25 de junio
  }

  // Validar perfil existente | Validate existing profile
  const profileExists = await userDao.profileExists(userData.profile_id);
  if (!profileExists) {
    return Result.Fail(Errors.NOT_FOUND('Profile'), 400); // Mensaje centralizado 25 de junio
  }

  // Hashear la contraseña antes de guardar | Hash the password before saving
  const hashedPassword = await bcrypt.hash(userData.password_hash, 10);
  userData.password_hash = hashedPassword;

  // Refactor: Usando withTransaction 26 de junio
  const result = await withTransaction(async (connection) => {
    try {
      const user = await userDao.createUser(userData, connection);
      return Result.Success(omitPassword(user));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return Result.Fail(Errors.EMAIL_EXISTS, 409); // Mensaje centralizado 25 de junio
      }
      logger.error(`[Users] Error en createUser (transaction): ${error.message}`, { error }); // Nuevo logger 27 de junio
      return Result.Fail(Errors.INTERNAL, 500); // Mensaje centralizado 25 de junio
    }
  });
  return result;

}

// Actualizar completamente un usuario | Fully update a user
export async function editUser(id, userData) {
  // Validación de campos requeridos | Required fields validation
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  const missingField = checkRequiredFields(userData, requiredFields);
  if (missingField) {
    return Result.Fail(Errors.MISSING_FIELD(missingField), 400); // Mensaje centralizado 25 de junio
  }
  // Validaciones comunes | Common validations
  const commonResult = await commonUserValidations(id, userData, userDao, Errors );
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
      : Result.Fail(Errors.NOT_FOUND('User'), 404); // Mensaje centralizado 25 de junio
  } catch (error) {
    logger.error(`[Users] Error en editUser: ${error.message}`, { error }); // Nuevo logger 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); //  Mensaje centralizado 25 de junio
  }
}

// Actualizar parcialmente un usuario | Patch a user
export async function patchUser(id, fields) {
  const invalidFields = Object.keys(fields).filter(f => !ALLOWED_PATCH_FIELDS.has(f));
  if (invalidFields.length > 0) {
    return Result.Fail(Errors.INVALID_FIELDS(invalidFields.join(', ')), 400); // Mensaje centralizado 25 de junio
  }

  const commonResult = await commonUserValidations(id, fields, userDao, Errors);
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
      : Result.Fail(Errors.NOT_FOUND('User'), 404); // Mensaje centralizado 25 de junio
  } catch (error) {
    logger.error(`[Users] Error en patchUser: ${error.message}`, { error }); // Nuevo logger 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje centralizado 25 de junio
  }
}

// Eliminar un usuario | Delete a user
export async function deleteUser(id) {
  try {
    const userExists = await userDao.getUserById(id);
    if (!userExists) {
      return Result.Fail(Errors.NOT_FOUND('User'), 404); // Mensaje centralizado 25 de junio
    }
    const deleted = await userDao.deleteUser(id);
    return deleted
      ? Result.Success(true)
      : Result.Fail(Errors.OPERATION_FAILED('Delete'), 500); // Mensaje centralizado 25 de junio
  } catch (error) {
    logger.error(`[Users] Error en deleteUser: ${error.message}`, { error }); // Nuevo logger 27 de junio
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje centralizado 25 de junio
  }
}
