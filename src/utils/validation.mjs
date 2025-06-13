// src/utils/validation.mjs

// This module provides utility functions for validating various types of input.
// Este módulo proporciona funciones utilitarias para validar varios tipos de entrada.

export function isValidId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function isStrongPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}
