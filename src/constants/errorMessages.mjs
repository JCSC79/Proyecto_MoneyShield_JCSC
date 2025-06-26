//  src/constants/errorMessages.mjs

export const Errors = {
  INVALID_ID: (entity = 'ID') => `Invalid ${entity}`,
  MISSING_FIELD: (field) => `Missing required field: ${field}`,
  ALREADY_EXISTS: (entity) => `${entity} already exists`,
  NOT_FOUND: (entity) => `${entity} not found`,
  AMOUNT_POSITIVE: 'Amount must be a positive number',
  INVALID_EMAIL: 'Invalid email address',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_PASSWORD: 'Password must be at least 8 characters, contain uppercase, lowercase and a number',
  INVALID_DATE: 'Invalid date',
  INVALID_THRESHOLD: 'Threshold must be between 0 and 100',
  FORBIDDEN: 'Forbidden',
  INTERNAL: 'Internal server error',
  INVALID_UPDATE: 'No valid fields to update',
  INVALID_PERIOD: 'Invalid period (must be "week" or "month")',
  INVALID_YEAR: 'Invalid year',
  INVALID_MONTH: 'Invalid month',
  INVALID_LIMIT: 'Invalid limit',
  INVALID_MODE: 'Invalisd mode (must be "week" or "month")',
  TARGET_AMOUNT_POSITIVE: 'Target amount must be a positive number',
  TARGET_AMOUNT_GREATER: 'Target amount must be greater than amount',
  MIN_LENGTH: (field, min) => `${field} must be at least ${min} characters long`,
  AMOUNT_RANGE: (max, precision) => `Amount must be positive, up to $${max} with ${precision} decimals`
  // ...agregamos aquí otros mensajes comunes de ser necesarios
};
