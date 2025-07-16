// src/middlewares/accessControl.middleware.mjs

import * as transactionService from '../modules/transactions/transaction.service.mjs';
import * as budgetService from '../modules/budgets/budget.service.mjs';
import * as savingsService from '../modules/savings/saving.service.mjs';

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

export async function allowSelfOrAdminTransaction (req, res, next) {
  const result = await transactionService.getTransactionById(req.params.id);
  if (!result.success) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  const transaction = result.data;
  if (req.user.profile_id === 1 || transaction.user_id === req.user.id) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

// Esa función se usa para forzar un filtro por el usuario actual en las consultas de transacciones. (OJO: 4 de julio de 2025)
// export function forceSelfFilter(req, res, next) {
//   let filtro = { ...req.query }; // Copiar el filtro actual
//   if (req.user.profile_id !== 1) {
//     filtro.user_id = req.user.id; // Forzar filtro por el usuario actual si no es admin
//     //req.query.user_id = req.user.id; // Forzar filtro por el usuario actual si no es admin
//   } else {
//     if (filtro.user_id) {
//       filtro.user_id = Number(filtro.user_id); // Asegurar que user_id sea un número
//       //req.query.user_id = Number(req.query.user_id);
//     }
//   }
//   req.filtroForzado = filtro; // Guarda el filtro forzado en req para uso posterior
//   next();
// }

export function forceSelfFilter(req, res, next) {
  const queryUserId = req.query.user_id ? Number(req.query.user_id) : undefined;

  let filtro = { ...req.query };

  // Si NO es admin, siempre forzamos su propio user_id
  if (req.user.profile_id !== 1) {
    filtro.user_id = req.user.id;
  } else {
    // Si es admin y pasó user_id válido por query, usamos ese
    if (queryUserId && Number.isInteger(queryUserId) && queryUserId > 0) {
      filtro.user_id = queryUserId;
    } else {
      // Admin pero no pasó user_id → usamos el suyo como fallback
      filtro.user_id = req.user.id;
    }
  }

  req.filtroForzado = filtro;
  next();
}


export async function allowSelfOrAdminBudget(req, res, next) {
  const result = await budgetService.getBudgetById(req.params.id);
  if (!result.success) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  const budget = result.data;
  if (req.user.profile_id === 1 || budget.user_id === req.user.id) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

export async function allowSelfOrAdminSaving(req, res, next) {
  const result = await savingsService.getSavingById(req.params.id);
  if (!result.success) {
    return res.status(404).json({ error: 'Saving not found' });
  }
  const saving = result.data;
  if (req.user.profile_id === 1 || saving.user_id === req.user.id) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}