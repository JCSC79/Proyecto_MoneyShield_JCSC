// src/db/DBHelper.mjs

/**
 * Helper de conexión a la base de datos MySQL usando pool de conexiones.
 * Database connection helper using MySQL pool.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Comprobación opcional de variables de entorno | Optional env check
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`[DBHelper] Warning: Missing environment variable ${key}`);
  }
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export default db;
