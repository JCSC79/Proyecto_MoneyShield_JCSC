// src/index.mjs

import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`); // Server listening on port
  console.log(`Swagger docs en http://localhost:${PORT}/api-docs`); // <--- Muestra la URL de Swagger
});
