// src/middlewares/accessControl.middleware.mjs

export function allowSelfOrAdmin(req, res, next) {
  if (req.user.profile_id === 1 || req.user.id === Number(req.params.id)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

export function adminOnly(req, res, next) {
  if (req.user.profile_id === 1) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

// export function filterBySelfOrAdmin(req, res, next) {
//   if (req.user.profile_id !== 1) {
//     req.query.user_id = req.user.id; // Filtrar por el usuario actual si no es admin
//   } else {
//     if (req.query.user_id) {
//       req.query.user_id = Number(req.query.user_id);
//     }
//   }
//   next();
// }
