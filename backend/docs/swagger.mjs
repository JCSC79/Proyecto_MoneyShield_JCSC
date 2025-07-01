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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'admin' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensaje de error | Error message' }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Token inválido o no proporcionado | Invalid or missing token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        Forbidden: {
          description: 'Acceso denegado | Forbidden',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: [
    './src/modules/users/*.mjs',
    './src/modules/transactions/*.mjs',
    './src/modules/budgets/*.mjs',
    './src/modules/savings/*.mjs',
    './src/modules/categories/*.mjs',
    './src/modules/profiles/*.mjs',
    './src/modules/auth/*.mjs'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
