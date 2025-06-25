import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Transactions API (full integration, extended)', () => {
  // IDs de prueba - AJUSTAR según datos reales
  const validUserId = 1;
  const validTypeId = 1;
  const validCategoryId = 1;
  const invalidUserId = 99999;
  const invalidTypeId = 99999;
  const invalidCategoryId = 99999;

  let createdTransactionId;
  let createdTransactionId2;
  let othersCategoryId;


  beforeAll(async () => {
  // Crear categoría "Others" si no existe
  await db.query(`
    INSERT INTO categories (name)
    SELECT 'Others' FROM DUAL
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Others')
  `);

  // Obtener el ID de la categoría "Others"
  const [rows] = await db.query('SELECT id FROM categories WHERE name = "Others" LIMIT 1');
  if (!rows.length) throw new Error('Category "Others" must exist in the database for tests');
  othersCategoryId = rows[0].id;
});


  // 1. Crear transacción válida con category_id
  it('should create a valid transaction with category_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: 100.50,
        description: 'Compra supermercado'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdTransactionId = res.body.id;
    expect(res.body).toMatchObject({
      user_id: validUserId,
      type_id: validTypeId,
      category_id: validCategoryId,
      amount: 100.50,
      description: 'Compra supermercado'
    });
  });

  // 2. Crear transacción válida sin category_id (debe asignar Others)
  it('should create a valid transaction without category_id (should assign "Others")', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        amount: 200.00,
        description: 'Sin categoría'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdTransactionId2 = res.body.id;
    expect(res.body.category_id).toBe(othersCategoryId);
  });

  // 3. Crear transacción con amount como string numérico (debe fallar)
  it('should fail to create a transaction (amount as string)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: "100.50",
        description: 'String amount'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 4. Crear transacción con amount negativo
  it('should fail to create a transaction (negative amount)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: -50,
        description: 'Negativo'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 5. Crear transacción sin amount
  it('should fail to create a transaction (missing amount)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: validCategoryId,
        description: 'Falta amount'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 6. Crear transacción sin user_id
  it('should fail to create a transaction (missing user_id)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: 100,
        description: 'Falta user_id'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 7. Crear transacción sin type_id
  it('should fail to create a transaction (missing type_id)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        category_id: validCategoryId,
        amount: 100,
        description: 'Falta type_id'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 8. Crear transacción con user_id inexistente
  it('should fail to create a transaction (non-existent user)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: invalidUserId,
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: 50,
        description: 'Usuario inexistente'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 9. Crear transacción con type_id inexistente
  it('should fail to create a transaction (non-existent type)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: invalidTypeId,
        category_id: validCategoryId,
        amount: 50,
        description: 'Tipo inexistente'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 10. Crear transacción con category_id inexistente
  it('should fail to create a transaction (non-existent category)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: invalidCategoryId,
        amount: 50,
        description: 'Categoría inexistente'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 11. Obtener todas las transacciones
  it('should get all transactions', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 12. Obtener transacción por ID válido
  it('should get a transaction by ID', async () => {
    const res = await request(app).get(`/transactions/${createdTransactionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdTransactionId);
  });

  // 13. Obtener transacción por ID inválido
  it('should fail to get a transaction by invalid ID', async () => {
    const res = await request(app).get('/transactions/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // 14. Obtener transacción por ID no numérico
  it('should fail to get a transaction by non-numeric ID', async () => {
    const res = await request(app).get('/transactions/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 15. Filtro por user_id
  it('should filter transactions by user_id', async () => {
    const res = await request(app).get(`/transactions?user_id=${validUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 16. Filtro por type_id
  it('should filter transactions by type_id', async () => {
    const res = await request(app).get(`/transactions?type_id=${validTypeId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 17. Filtro por rango de fechas (from)
  it('should filter transactions from a date', async () => {
    const res = await request(app).get('/transactions?from=2020-01-01T00:00:00.000Z');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 18. Filtro por rango de fechas (to)
  it('should filter transactions to a date', async () => {
    const res = await request(app).get('/transactions?to=2100-01-01T00:00:00.000Z');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 19. Filtro combinado
  it('should filter transactions by multiple filters', async () => {
    const res = await request(app).get(`/transactions?user_id=${validUserId}&type_id=${validTypeId}&from=2020-01-01T00:00:00.000Z&to=2100-01-01T00:00:00.000Z`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 20. Actualizar transacción (PUT) válido
  it('should fully update a transaction', async () => {
    const res = await request(app)
      .put(`/transactions/${createdTransactionId}`)
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: 300.00,
        description: 'Actualización completa'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // 21. Actualizar transacción (PATCH) válido
  it('should partially update a transaction', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId}`)
      .send({
        amount: 350.00
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // 22. Actualizar transacción con category_id inválido
  it('should fail to update a transaction with invalid category_id', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId}`)
      .send({
        category_id: invalidCategoryId
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 23. Actualizar transacción con user_id inválido
  it('should fail to update a transaction with invalid user_id', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId}`)
      .send({
        user_id: invalidUserId
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 24. Actualizar transacción con type_id inválido
  it('should fail to update a transaction with invalid type_id', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId}`)
      .send({
        type_id: invalidTypeId
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 25. Actualizar transacción inexistente
  it('should fail to update a non-existent transaction', async () => {
    const res = await request(app)
      .patch('/transactions/999999')
      .send({
        amount: 500
      });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // 26. Eliminar transacción válida
  it('should delete a transaction', async () => {
    const res = await request(app).delete(`/transactions/${createdTransactionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // 27. Eliminar transacción inexistente
  it('should fail to delete a non-existent transaction', async () => {
    const res = await request(app).delete(`/transactions/${createdTransactionId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // 28. PUT con body vacío
  it('should fail to update with empty body', async () => {
    const res = await request(app)
      .put(`/transactions/${createdTransactionId2}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 29. PATCH con body vacío
  it('should fail to patch with empty body', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId2}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 30. DELETE con ID no numérico
  it('should fail to delete with non-numeric ID', async () => {
    const res = await request(app).delete('/transactions/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  //=========================Test para funcionalidades especiales=========================

// 31. Balance general después de transacciones
it('should return correct user balance after income and expense transactions', async () => {
  // Limpia transacciones previas del usuario de prueba
  await db.query('DELETE FROM transactions WHERE user_id = ?', [validUserId]);

  // 1. Crea ingreso
  await request(app)
    .post('/transactions')
    .send({ user_id: validUserId, type_id: 1, category_id: validCategoryId, amount: 500, description: 'Ingreso' });

  // 2. Crea gasto
  await request(app)
    .post('/transactions')
    .send({ user_id: validUserId, type_id: 2, category_id: validCategoryId, amount: 200, description: 'Gasto' });

  // 3. Consulta balance
  const res = await request(app)
    .get('/transactions/report/balance')
    .query({ user_id: validUserId });

  expect(res.statusCode).toBe(200);
  expect(Number(res.body)).toBe(300); // Convertido a número para comparación
});

// 32. Gastos por categoría
it('should return expenses grouped by category', async () => {
  // Limpia transacciones previas
  await db.query('DELETE FROM transactions WHERE user_id = ?', [validUserId]);

  // Crea gastos
  await request(app)
    .post('/transactions')
    .send({ user_id: validUserId, type_id: 2, category_id: validCategoryId, amount: 150 });
  
  await request(app)
    .post('/transactions')
    .send({ user_id: validUserId, type_id: 2, category_id: othersCategoryId, amount: 300 });

  // Obtiene nombres reales de las categorías
  const [cat1] = await db.query('SELECT name FROM categories WHERE id = ?', [validCategoryId]);
  const [cat2] = await db.query('SELECT name FROM categories WHERE id = ?', [othersCategoryId]);
  const cat1Name = cat1[0].name;
  const cat2Name = cat2[0].name;

  // Consulta reporte
  const res = await request(app)
    .get('/transactions/report/expenses-by-category')
    .query({ user_id: validUserId });

  expect(res.statusCode).toBe(200);
  
  // Filtra y normaliza
  const testCategories = res.body.filter(item =>
    [cat1Name, cat2Name].includes(item.category)
  ).map(item => ({
    category: item.category,
    total: Number(item.total)
  }));

  // Verifica
  expect(testCategories).toEqual(
    expect.arrayContaining([
      { category: cat1Name, total: 150 },
      { category: cat2Name, total: 300 }
    ])
  );
});

// 33. Evolución mensual de gastos
it('should return monthly expenses evolution', async () => {
  // Limpia transacciones previas del usuario de prueba
  await db.query('DELETE FROM transactions WHERE user_id = ?', [validUserId]);

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

  // Gasto en el mes pasado
  await db.query(
    `INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at)
     VALUES (?, 2, ?, 100, 'Gasto mes pasado', ?)`,
    [validUserId, validCategoryId, lastMonth]
  );

  // Gasto en el mes actual
  await request(app)
    .post('/transactions')
    .send({
      user_id: validUserId,
      type_id: 2,
      category_id: validCategoryId,
      amount: 200,
      description: 'Gasto mes actual'
    });

  // Consulta reporte
  const res = await request(app)
    .get('/transactions/report/monthly-expenses')
    .query({ user_id: validUserId });

  expect(res.statusCode).toBe(200);

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentData = res.body.find(item =>
    item.month === currentMonth && item.year === currentYear
  );

  expect(Number(currentData.total)).toBe(200); // Convertido a número
});



  // Cierra el pool de la base de datos al final de todos los tests
  afterAll(async () => {
    await db.end();
  });
});
