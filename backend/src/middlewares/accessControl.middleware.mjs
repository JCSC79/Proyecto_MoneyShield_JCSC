// src/middlewares/accessControl.middleware.mjs

import * as transactionService from '../modules/transactions/transaction.service.mjs';
import * as budgetService from '../modules/budgets/budget.service.mjs';
import * as savingsService from '../modules/savings/saving.service.mjs';

// Permite acceder si es admin o si el ID coincide
export function allowSelfOrAdmin(req, res, next) {
  if (req.user.profile_id === 1 || req.user.id === Number(req.params.id)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

// Acceso exclusivo a admins
export function adminOnly(req, res, next) {
  if (req.user.profile_id === 1) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

// Aplica y fuerza filtros seguros
export function forceSelfFilter(req, res, next) {
  const queryUserId = req.query.user_id ? Number(req.query.user_id) : undefined;
  const filtro = { ...req.query };

  if (req.user.profile_id !== 1) {
    filtro.user_id = req.user.id;
  } else {
    filtro.user_id =
      queryUserId && Number.isInteger(queryUserId) && queryUserId > 0
        ? queryUserId
        : req.user.id;
  }

  req.filtroForzado = filtro;
  next();
}

// Middleware Factory compartido para cualquier recurso
export function allowSelfOrAdminFactory(getResourceById, label = 'Resource') {
  return async (req, res, next) => {
    const result = await getResourceById(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: `${label} not found` });
    }

    const resource = result.data;
    if (req.user.profile_id === 1 || resource.user_id === req.user.id) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  };
}

// Instancias generadas para cada recurso
export const allowSelfOrAdminTransaction = allowSelfOrAdminFactory(
  transactionService.getTransactionById,
  'Transaction'
);

export const allowSelfOrAdminBudget = allowSelfOrAdminFactory(
  budgetService.getBudgetById,
  'Budget'
);

export const allowSelfOrAdminSaving = allowSelfOrAdminFactory(
  savingsService.getSavingById,
  'Saving'
);
