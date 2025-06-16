// src/utils/validation.mjs

// This module provides utility functions for validating various types of input.
// Este módulo proporciona funciones utilitarias para validar varios tipos de entrada.
import { Result } from '../utils/result.mjs'; // Importamos la clase Result para manejar resultados de operaciones | Import Result class to handle operation results

// Validamos si el ID es un número entero positivo | Validate if the ID is a positive integer
export function isValidId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

// Validamos el formato del email | Validate email format
export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Verificamos si la contraseña es fuerte | Check if the password is strong
export function isStrongPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

// Validamos ID usando Result | Validate ID using Result
export function validateUserId(id) {
  return isValidId(id)
    ? Result.Success(id)
    : Result.Fail('Invalid user ID', 400);
}