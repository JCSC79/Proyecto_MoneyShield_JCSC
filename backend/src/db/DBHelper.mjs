// src/db/DBHelper.mjs

/**
 * Helper de conexión a la base de datos MySQL usando pool de conexiones.
 * Database connection helper using MySQL pool.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.mjs';
import { Result } from '../utils/result.mjs';
import { Errors } from '../constants/errorMessages.mjs';
dotenv.config();

// Comprobación de variables de entorno requeridas | Required env check
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`[DBHelper] Warning: Missing environment variable ${key}`);
  }
}

// Crea el pool de conexiones
// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
});

// Helper para obtener una conexión directa
// Helper to get a direct connection
export async function getConnection() {
  return pool.getConnection();
}

// Helper para ejecutar consultas usando el pool (promesa)
// Helper to execute queries using the pool (promise)
export async function query(sql, params) {
  return pool.query(sql, params);
}

// Helper para cerrar el pool (para las pruebas)
// Helper to close the pool (useful in tests)
export async function end() {
  return pool.end();
}

// Ensayo para sustituir withTransaction 11 de julio
export const transactionQuery = async (sql, params) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.query(sql, params);
    await connection.commit();
    return result;
  } catch (error) {
    logger.error(`[DB] Error en transactionQuery: ${error.message}`, { error });
    if (connection) await connection.rollback();
    return Result.Fail(Errors.INTERNAL, 500);
  } finally {
    if (connection) connection.release();
  }
};

// Exporta el pool y los helpers
// Export pool and helpers
export default {
  pool,
  query,
  getConnection,
  end,
  transactionQuery,
};
