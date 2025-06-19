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
export function validateId(id) {
  return isValidId(id)
    ? Result.Success(id)
    : Result.Fail('Invalid user ID', 400);
}

export function checkRequiredFields(obj, fields) {
  return fields.find(field => !obj[field]);
}

// Nuevas validaciones agregadas | New validations added (19 de junio)

// Validamos si el valor es un número positivo | Validate if the value is a positive number
export function isPositiveNumber(value) {
  return typeof value === 'number' && value >= 0 && Number.isFinite(value);
}

// Validamos si el monto está dentro del rango y tiene la cantidad de decimales especificada | Validate if the amount is within range and has specified decimals
export function isAmountInRange(amount, max, decimals = 2) {
  return isPositiveNumber(amount) &&
    amount <= max &&
    Number(amount.toFixed(decimals)) === amount;
}

// Validamos si la fecha es válida | Validate if the date is valid
export function isValidDate(dateStr) {
  return !isNaN(Date.parse(dateStr)) && dateStr.trim() !== '';
}

// Validamos si el string no está vacío | Validate if the string is not empty
export function isNonEmptyString(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

// Validamos si el valor es un enumerado válido | Validate if the value is a valid enum
export function isValidEnumValue(value, allowedValues) {
  return Array.isArray(allowedValues) && allowedValues.includes(value);
}

