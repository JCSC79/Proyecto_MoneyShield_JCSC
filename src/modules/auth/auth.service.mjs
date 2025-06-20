// src/modules/auth/auth.service.mjs

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as userDao from '../users/user.dao.mjs';
import { Result } from '../../utils/result.mjs';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

export async function login(email, password) {
  if (!email || !password) {
    return Result.Fail('Email and password are required', 400);
  }

  try {
    const user = await userDao.getUserByEmail(email);
    if (!user) {
      return Result.Fail('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Result.Fail('Invalid credentials', 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      profile_id: user.profile_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return Result.Success(token);
  } catch (error) {
    console.error('Error in auth service:', error);
    return Result.Fail('Internal server error', 500);
  }
}
