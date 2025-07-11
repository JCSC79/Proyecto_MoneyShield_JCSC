// src/modules/auth/auth.middleware.mjs

import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adjuntamos el payload COMPLETO al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      profile_id: decoded.profile_id
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
}


// Para roles| For role-based authorization
export function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.profile_id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Middleware de autenticación opcional
export function authenticateOptional(req, res, next) {
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        profile_id: decoded.profile_id
      };
    } catch (err) {
      // Si el token es inválido, ignoramos y seguimos como usuario anónimo
    }
  }
  next();
}

