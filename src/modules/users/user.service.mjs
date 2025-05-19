// src/modules/users/user.service.mjs
import * as userDao from './user.dao.mjs';

/**
 * Filtra campos sensibles de usuario
 */
function omitPassword(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

/**
 * Valida el formato de un email
 */
function isValidEmail(email) {
  // Expresión regular simple para emails válidos
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  const user = await userDao.getUserById(id);
  return omitPassword(user);
}

/**
 * Crear un nuevo usuario | Create a new user
 */
export async function createUser(userData) {
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  // Validar formato de email
  if (!isValidEmail(userData.email)) {
    throw new Error('Invalid email format');
  }
  // Validar unicidad de email
  const existing = await userDao.getUserByEmail(userData.email);
  if (existing) throw new Error('Email already exists');
  // Validar que el profile_id existe
  const profileOk = await userDao.profileExists(userData.profile_id);
  if (!profileOk) throw new Error('Profile does not exist');
  // Valores por defecto
  if (userData.base_budget === undefined) userData.base_budget = 0;
  if (userData.base_saving === undefined) userData.base_saving = 0;
  const user = await userDao.createUser(userData);
  return omitPassword(user);
}

/**
 * Actualizar completamente un usuario | Fully update a user
 */
export async function editUser(id, userData) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  // Validar formato de email
  if (!isValidEmail(userData.email)) {
    throw new Error('Invalid email format');
  }
  // Validar unicidad de email (si se cambia)
  const existing = await userDao.getUserByEmail(userData.email);
  if (existing && existing.id != id) throw new Error('Email already exists');
  // Validar que el profile_id existe
  const profileOk = await userDao.profileExists(userData.profile_id);
  if (!profileOk) throw new Error('Profile does not exist');
  // Valores por defecto
  if (userData.base_budget === undefined) userData.base_budget = 0;
  if (userData.base_saving === undefined) userData.base_saving = 0;
  return await userDao.updateUser(id, userData);
}

/**
 * Actualizar parcialmente un usuario | Partially update a user
 */
export async function patchUser(id, fields) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  if (!fields || Object.keys(fields).length === 0) {
    throw new Error('No fields to update');
  }
  // Validar formato de email (si se cambia)
  if (fields.email && !isValidEmail(fields.email)) {
    throw new Error('Invalid email format');
  }

  // Validar unicidad de email (si se cambia)
  if (fields.email) {
    const existing = await userDao.getUserByEmail(fields.email);
    if (existing && existing.id != id) throw new Error('Email already exists');
  }
  // Validar profile_id (si se cambia)
  if (fields.profile_id) {
    const profileOk = await userDao.profileExists(fields.profile_id);
    if (!profileOk) throw new Error('Profile does not exist');
  }
  return await userDao.patchUser(id, fields);
}

/**
 * Eliminar un usuario | Delete a user
 */
export async function deleteUser(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  return await userDao.deleteUser(id);
}
