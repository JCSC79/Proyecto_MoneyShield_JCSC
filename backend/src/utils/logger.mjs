// src/utils/logger.mjs

import winston from 'winston'; // Importa la librería principal de logging | Import the main logging library
import winstonDailyRotateFile from 'winston-daily-rotate-file'; // Importa el transporte para rotación de archivos | Import the transport for file rotation

// Crea y configura el logger principal de la aplicación
const logger = winston.createLogger({
  // Nivel mínimo de logs a registrar (se puede cambiar usando la variable de entorno LOG_LEVEL)
  level: process.env.LOG_LEVEL || 'info',
  // Metadata por defecto que se añade a cada log
  defaultMeta: { service: 'moneyshield-backend' },
  // Formato de los logs: timestamp + mensaje personalizado + metadata en JSON
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) =>
      `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    )
  ),

  // Transportes: destinos donde se guardan los logs
  transports: [
    // Rotación diaria para errores: guarda solo logs de nivel 'error' en archivos separados por día, comprimidos y conserva solo los últimos 7 días
    new winstonDailyRotateFile({
      filename: 'logs/error-%DATE%.log', // Nombre del archivo con la fecha
      level: 'error',                    // Solo logs de error
      datePattern: 'YYYY-MM-DD',         // Formato de la fecha en el nombre del archivo
      zippedArchive: true,               // Comprime los archivos antiguos
      maxFiles: '7d'                     // Mantiene solo los últimos 7 días (aqui se puede ajustar el número de días)
    }),
    // Rotación diaria para logs generales: guarda todos los logs de nivel info y superiores
    new winstonDailyRotateFile({
      filename: 'logs/combined-%DATE%.log', // Nombre del archivo con fecha
      datePattern: 'YYYY-MM-DD',            // Formato de fecha en el nombre del archivo
      zippedArchive: true,                  // Comprime los archivos antiguos
      maxFiles: '7d'                        // Mantiene solo los últimos 7 días
    }),
  ],
});

//  Añade también la salida por consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(), // Formato simple en consola
  }));
}

export { logger };
