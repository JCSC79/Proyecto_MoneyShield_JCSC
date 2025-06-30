// src/app.js

// Importa las dependencias principales | Import main dependencies
import express from 'express';
import userRoutes from './modules/users/user.controller.mjs';
import transactionRoutes from './modules/transactions/transaction.controller.mjs';
import budgetRoutes from './modules/budgets/budget.controller.mjs';
import savingRoutes from './modules/savings/saving.controller.mjs';
import categoryRoutes from './modules/categories/categories.controller.mjs';
import profileRoutes from './modules/profiles/profile.controller.mjs';
import authRoutes from './modules/auth/auth.controller.mjs';
import setupSwagger from '../docs/swagger.mjs'; // OJO: Ajustar la ruta si la carpeta docs se mueve a otro lugar
import rateLimit from 'express-rate-limit'; // Importa rateLimit para limitar las peticiones

const app = express();
app.use(express.json()); // Permite recibir y procesar JSON | Allows receiving and processing JSON

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limita a 10 peticiones por IP por ventana de tiempo
  message: { error: 'Too many login attempts, please try again later.' }, // Mensaje de error personalizado
  statusCode: 429 // Código de estado para demasiadas peticiones
});

app.use('/auth/login', authLimiter); // Aplica el limitador de peticiones a las rutas de autenticación

// Monta las rutas de usuarios, transacciones, budgets y savings | Mount users, transactions, budgets and savings routes
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);
app.use('/savings', savingRoutes);
app.use('/categories', categoryRoutes);
app.use('/profiles', profileRoutes);
app.use('/auth', authRoutes);

// Configura Swagger | Setup Swagger
setupSwagger(app);

export default app;
