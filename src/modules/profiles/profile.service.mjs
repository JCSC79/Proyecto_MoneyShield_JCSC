// src/modules/profiles/profile.service.mjs

import * as profileDao from './profile.dao.mjs';

/**
 * Obtiene todos los perfiles | Get all profiles
 * @returns {Promise<Array>} Lista de perfiles
 */
export async function getAllProfiles() {
  return await profileDao.getAllProfiles();
}

// (Opcional) Si necesitamos crear perfiles nuevos desde la API
export async function createProfile(name) {
  if (!name || name.trim().length < 2) {
    throw new Error('El nombre del perfil debe tener al menos 2 caracteres | Profile name must be at least 2 characters');
  }
  return await profileDao.createProfile(name);
}
