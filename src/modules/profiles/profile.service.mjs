// src/modules/profiles/profile.service.mjs

import * as profileDao from './profile.dao.mjs';
import { Result } from '../../utils/result.mjs';
import { isNonEmptyString } from '../../utils/validation.mjs';

/**
 * Obtiene todos los perfiles | Get all profiles
 */
export async function getAllProfiles() {
  try {
    const profiles = await profileDao.getAllProfiles();
    return Result.Success(profiles);
  } catch (error) {
    console.error('Error en getAllProfiles:', error);
    return Result.Fail(error.message || 'Internal server error', 500);
  }
}

/**
 * Crear un nuevo perfil | Create a new profile
 */
export async function createProfile(name) {
  if (!isNonEmptyString(name) || name.trim().length < 2) {
    return Result.Fail('Profile name must be at least 2 characters', 400);
  }
  try {
    const profile = await profileDao.createProfile(name.trim());
    return Result.Success(profile);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return Result.Fail('Profile name already exists', 409);
    }
    console.error('Error en createProfile:', error);
    return Result.Fail(error.message || 'Internal server error', 500);
  }
}

//=========================================================
export async function getProfileById(id) {
  try {
    const profile = await profileDao.getProfileById(id);
    return profile
      ? Result.Success(profile)
      : Result.Fail('Profile not found', 404);
  } catch (error) {
    console.error('Error en getProfileById:', error);
    return Result.Fail('Internal server error', 500);
  }
}

export async function deleteProfile(id) {
  try {
    const deleted = await profileDao.deleteProfile(id);
    return deleted
      ? Result.Success(true)
      : Result.Fail('Profile not found', 404);
  } catch (error) {
    console.error('Error en deleteProfile:', error);
    return Result.Fail('Internal server error', 500);
  }
}
