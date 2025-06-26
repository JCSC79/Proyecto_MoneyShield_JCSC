// src/utils/validation.mjs

// This module provides utility functions for validating various types of input.
// Este módulo proporciona funciones utilitarias para validar varios tipos de entrada.
import { Result } from '../utils/result.mjs'; // Importamos la clase Result para manejar resultados de operaciones | Import Result class to handle operation results
import { MAX_AMOUNT, DECIMAL_PRECISION } from '../constants/financial.mjs'; // Importamos constantes financieras para validaciones | Import financial constants for validations
import { Errors } from '../constants/errorMessages.mjs'; // Importamos mensajes de error centralizados | Import centralized error messages

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
export function validateId(id, entity = 'ID') {
  return isValidId(id)
    ? Result.Success(id)
    : Result.Fail(Errors.INVALID_ID(entity), 400); // Mensaje centralizado 26 de junio
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

// Validación específica para datos de ahorro | Specific validation for savings data
export function validateSavingData(data, isUpdate = false) {
  const REQUIRED_FIELDS = ['user_id', 'type_id', 'name', 'amount'];
  if (!isUpdate) {
    const missingField = checkRequiredFields(data, REQUIRED_FIELDS);
    if (missingField) {
      return Result.Fail(Errors.MISSING_FIELD(missingField), 400); // Mensaje centralizado 26 de junio
    }
  }
  if (data.amount !== undefined && !isPositiveNumber(data.amount)) {
    return Result.Fail(Errors.AMOUNT_POSITIVE, 400); // Mensaje centralizado 26 de junio
  } 
  if (data.target_amount !== undefined && data.target_amount !== null && !isPositiveNumber(data.target_amount)) {
    return Result.Fail(Errors.AMOUNT_POSITIVE, 400); // Mensaje centralizado 26 de junio
  }
  if (data.target_date && !isValidDate(data.target_date)) {
    return Result.Fail(Errors.INVALID_DATE, 400); // Mensaje centralizado 26 de junio
  }
  if (
    data.target_amount !== undefined &&
    data.target_amount !== null &&
    data.amount !== undefined &&
    data.target_amount <= data.amount
  ) {
    return Result.Fail(Errors.TARGET_AMOUNT_GREATER, 400); // Mensaje centralizado 26 de junio
  }
  return Result.Success(true);
}

// Validación genérica de user_id
export function validateUserId(user_id) {
  if (!user_id || isNaN(user_id) || user_id <= 0) {
    return Result.Fail(Errors.INVALID_ID('user ID'), 400); // Mensaje centralizado 26 de junio
  }
  return Result.Success(Number(user_id));
}

export async function validateTransactionData(data, transactionDao) {
  // Validar relaciones
  if (data.user_id) {
    const userExists = await transactionDao.userExists(data.user_id);
    if (!userExists) {
      return Result.Fail(Errors.NOT_FOUND('User'), 400); // Mensaje centralizado 26 de junio
    }
  }

  if (data.type_id) {
    const typeExists = await transactionDao.typeExists(data.type_id);
    if (!typeExists) {
      return Result.Fail(Errors.NOT_FOUND('Transaction Type'), 400); // Mensaje centralizado 26 de junio
    }
  }

  if (data.category_id) {
    const categoryExists = await transactionDao.categoryExists(data.category_id);
    if (!categoryExists) {
      return Result.Fail(Errors.NOT_FOUND('Category'), 400); // Mensaje centralizado 26 de junio
    }
  }

  // Validar monto
  if (data.amount) {
    if (!isAmountInRange(data.amount, MAX_AMOUNT, DECIMAL_PRECISION)) {
      return Result.Fail(Errors.AMOUNT_RANGE(MAX_AMOUNT, DECIMAL_PRECISION),400); // Mensaje centralizado 26 de junio
    }
  }

  return Result.Success(true);
}

// Validaciones comunes para usuarios (email, perfil, contraseña)
export async function commonUserValidations(id, data, userDao, Errors) {
  if (data.email) {
    if (!isValidEmail(data.email)) {
      return Result.Fail(Errors.INVALID_EMAIL, 400); // Mensaje centralizado 25 de junio
    }
    const existing = await userDao.getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      return Result.Fail(Errors.EMAIL_EXISTS, 409); // Mensaje centralizado 25 de junio
    }
  }
  if (data.profile_id) {
    const profileExists = await userDao.profileExists(data.profile_id);
    if (!profileExists) {
      return Result.Fail(Errors.NOT_FOUND('Profile'), 400); // Mensaje centralizado 25 de junio
    }
  }
  if (data.password_hash && !isStrongPassword(data.password_hash)) {
    return Result.Fail(Errors.INVALID_PASSWORD, 400); // Mensaje centralizado 25 de junio
  }
  return Result.Success(true);
}
