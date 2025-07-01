// src/utils/omitFields.mjs

export function omitFields(obj, fields = []) {
  if (!obj) {
    return null; // Si el objeto es nulo, retornamos nulo | If the object is null, return null
  }
  const result = { ...obj }; // Creamos una copia del objeto original | Create a copy of the original object
  for (const field of fields) {
      delete result[field]; // Eliminamos el campo especificado | Delete the specified field
  }
  return result; // Retornamos el objeto modificado | Return the modified object
}

export function omitPassword(user) {
  return omitFields(user, ['password_hash']); // Omitimos el campo de contraseña | Omit the password field
}
