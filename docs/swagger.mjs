// docs/swagger.mjs

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MoneyShield API (JCSC Version)',
      version: '1.0.0',
      description: 'REST API documentation for MoneyShield project (JCSC Version)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/modules/users/*.mjs', './src/modules/transactions/*.mjs', './src/modules/budgets/*.mjs', './src/modules/savings/*.mjs', './src/modules/categories/*.mjs', './src/modules/auth/*.mjs'],
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
