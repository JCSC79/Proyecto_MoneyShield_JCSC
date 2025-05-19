// src/app.js

// Importa las dependencias principales | Import main dependencies
import express from 'express';
import userRoutes from './modules/users/user.controller.mjs';
import transactionRoutes from './modules/transactions/transaction.controller.mjs';
import setupSwagger from '../docs/swagger.mjs'; // Ajusta la ruta si tu carpeta docs está en otro sitio

const app = express();
app.use(express.json()); // Permite recibir y procesar JSON | Allows receiving and processing JSON

// Monta las rutas de usuarios y transacciones | Mount user and transaction routes
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);

// Configura Swagger | Setup Swagger
setupSwagger(app);

export default app;
