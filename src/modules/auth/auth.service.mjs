import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as userDao from '../users/user.dao.mjs';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
  }
}

export async function login(email, password) {
  if (!email || !password) throw new AuthError('Email and password are required');

  // Busca el usuario por email (incluye password_hash) | Find user by email (includes password_hash)
  const user = await userDao.getUserByEmail(email);
  if (!user) throw new AuthError('Invalid credentials');

  // Compara la contraseña ingresada con la hasheada | Compare the entered password with the hashed one
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AuthError('Invalid credentials');

  // Crea el payload del token (puedes agregar más campos si quieres) | Create the token payload (you can add more fields if you want)
  const payload = {
    id: user.id,
    email: user.email,
    profile_id: user.profile_id
  };
 
  // Firma el token | Sign the token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return token;
}
