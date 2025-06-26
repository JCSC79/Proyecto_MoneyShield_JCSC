// src/modules/profiles/profile.service.mjs

import * as profileDao from './profile.dao.mjs';
import { Result } from '../../utils/result.mjs';
import { isNonEmptyString } from '../../utils/validation.mjs';
import { Errors } from '../../constants/errorMessages.mjs'; // Importamos los mensajes de error

/**
 * Obtiene todos los perfiles | Get all profiles
 */
export async function getAllProfiles() {
  try {
    const profiles = await profileDao.getAllProfiles();
    return Result.Success(profiles);
  } catch (error) {
    console.error('Error en getAllProfiles:', error);
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

/**
 * Crear un nuevo perfil | Create a new profile
 */
export async function createProfile(name) {
  if (!isNonEmptyString(name) || name.trim().length < 2) {
    return Result.Fail(Errors.MIN_LENGTH('Profile name',2), 400); // Mensaje de error centralizado 26 de junio
  }
  try {
    const profile = await profileDao.createProfile(name.trim());
    return Result.Success(profile);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return Result.Fail(Errors.ALREADY_EXISTS('Profile'), 409); // Mensaje de error centralizado 26 de junio
    }
    console.error('Error en createProfile:', error);
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

//=========================================================
export async function getProfileById(id) {
  try {
    const profile = await profileDao.getProfileById(id);
    return profile
      ? Result.Success(profile)
      : Result.Fail(Errors.NOT_FOUND('Profile'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    console.error('Error en getProfileById:', error);
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}

export async function deleteProfile(id) {
  try {
    const deleted = await profileDao.deleteProfile(id);
    return deleted
      ? Result.Success(true)
      : Result.Fail(Errors.NOT_FOUND('Profile'), 404); // Mensaje de error centralizado 26 de junio
  } catch (error) {
    console.error('Error en deleteProfile:', error);
    return Result.Fail(Errors.INTERNAL, 500); // Mensaje de error centralizado 26 de junio
  }
}
