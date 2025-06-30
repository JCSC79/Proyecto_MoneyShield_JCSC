// src/db/withTransaction.mjs

import db  from './DBHelper.mjs'; // Importar la conexión a la base de datos desde DBHelper | Import the database connection from DBHelper
import { Result } from '../utils/result.mjs'; // Importar la clase Result para manejar resultados | Import the Result class to handle results
import { Errors } from '../constants/errorMessages.mjs'; // Importar los mensajes de error centralizados | Import centralized error messages
import { logger } from '../utils/logger.mjs'; // Importar el logger para registrar errores | Import the logger to log errors

export async function withTransaction(callback) {
  const connection = await db.getConnection(); // Obtenemos la conexión a la base de datos | Get the database connection
  try {
    await connection.beginTransaction(); // Iniciamos la transacción | Start the transaction
    const result = await callback(connection); // Ejecutamos el callback con la conexión | Execute the callback with the connection
    await connection.commit(); // Confirmamos la transacción | Commit the transaction
    return result;
  } catch (error) {
    logger.error(`[DB] Error en withTransaction: ${error.message}`, { error }); // Registramos el error con el logger | Log the error with the logger
    await connection.rollback(); // Revertimos la transacción en caso de error | Rollback the transaction in case of error
    return Result.Fail(Errors.INTERNAL, 500); // Retornamos un error centralizado | Return a centralized error
  } finally {
    connection.release(); // Liberamos la conexión | Release the connection
  }
}
