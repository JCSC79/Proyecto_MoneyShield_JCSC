// src/modules/auth/auth.service.mjs

import jwt from 'jsonwebtoken';
import { decrypt } from '../../utils/encryption.mjs'; // Importa la función de encriptación
import * as userDao from '../users/user.dao.mjs';
import { Result } from '../../utils/result.mjs';
import { Errors } from '../../constants/errorMessages.mjs'; // Importamos los mensajes de error
import { logger } from '../../utils/logger.mjs'; // Importamos el logger para registrar errores
import { isValidEmail } from '../../utils/validation.mjs'; // Importamos la función de validación de email

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

export async function login(email, password) {
  if (!email || !password) {
    return Result.Fail(Errors.MISSING_FIELD('Email and password'), 400);
  }
  if (!isValidEmail(email)) {
    return Result.Fail(Errors.INVALID_EMAIL, 400);
  }
  try {
    const user = await userDao.getUserByEmail(email);
    if (!user) {
      return Result.Fail(Errors.FORBIDDEN, 401);
    }

    // 1. Desciframos la contraseña guardada
    const originalPassword = decrypt(user.password_hash);

    // 2. Comparamos el valor descifrado con la contraseña recibida
    if (!originalPassword || originalPassword !== password) {
      return Result.Fail(Errors.FORBIDDEN, 401);
    }

    // 3. Si va bien, genera el token y responde
    const payload = {
      id: user.id,
      email: user.email,
      profile_id: user.profile_id
    };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    });
    return Result.Success(token);
  } catch (error) {
    if (!error.message?.includes('Credenciales')) {
      logger.error(`[Auth] Error in login: ${error.message}`, { error });
    }
    return Result.Fail(Errors.INTERNAL, 500);
  }
}

