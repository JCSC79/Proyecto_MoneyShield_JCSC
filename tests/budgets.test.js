import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Budgets API', () => {
  let createdBudgetId;
  // Ajustar estos IDs según datos de prueba
  const validUserId = 1;
  const validCategoryId = 2;
  const anotherCategoryId = 3;

   beforeEach(async () => {
  // Solo borra presupuestos que NO sean el creado en los tests
  await db.query(
    'DELETE FROM budgets WHERE id != ? AND user_id = ? AND category_id = ? AND year = ? AND month = ? AND budget_type = ?',
    [createdBudgetId || -1, validUserId, validCategoryId, 2025, 6, 'monthly']
  );
});


  // 1. GET all budgets (should return array)
  it('should get all budgets', async () => {
    const res = await request(app).get('/budgets');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 2. POST: fail with missing fields
  it('should fail to create a budget with missing fields', async () => {
    const res = await request(app)
      .post('/budgets')
      .send({ user_id: validUserId });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 3. POST: fail with invalid amount
  it('should fail to create a budget with negative amount', async () => {
    const res = await request(app)
      .post('/budgets')
      .send({
        user_id: validUserId,
        category_id: validCategoryId,
        budget_type: 'monthly',
        year: 2025,
        month: 6,
        amount: -100
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 4. POST: fail with non-existent user/category
  it('should fail to create a budget with non-existent user', async () => {
    const res = await request(app)
      .post('/budgets')
      .send({
        user_id: 99999,
        category_id: validCategoryId,
        budget_type: 'monthly',
        year: 2025,
        month: 6,
        amount: 500
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should fail to create a budget with non-existent category', async () => {
    const res = await request(app)
      .post('/budgets')
      .send({
        user_id: validUserId,
        category_id: 99999,
        budget_type: 'monthly',
        year: 2025,
        month: 6,
        amount: 500
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // 5. POST: success
  it('should create a budget with valid data', async () => {
    const res = await request(app)
      .post('/budgets')
      .send({
        user_id: validUserId,
        category_id: validCategoryId,
        budget_type: 'monthly',
        year: 2025,
        month: 6,
        amount: 1000,
        notes: 'Test budget'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('user_id', validUserId);
    createdBudgetId = res.body.id;
  });

  // 6. GET by ID (success)
  it('should get a budget by ID', async () => {
    const res = await request(app).get(`/budgets/${createdBudgetId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdBudgetId);
    expect(res.body).toHaveProperty('amount');
  });

  // 7. GET by ID (fail)
  it('should fail to get a non-existent budget', async () => {
    const res = await request(app).get('/budgets/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // 8. PUT: full update
  it('should update a budget fully', async () => {
    const res = await request(app)
      .put(`/budgets/${createdBudgetId}`)
      .send({
        user_id: validUserId,
        category_id: anotherCategoryId,
        budget_type: 'monthly',
        year: 2025,
        month: 7,
        amount: 1500,
        notes: 'Updated budget'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // 9. PATCH: partial update
  it('should partially update a budget', async () => {
    const res = await request(app)
      .patch(`/budgets/${createdBudgetId}`)
      .send({ amount: 2000 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // 10. DELETE: success
  it('should delete a budget', async () => {
    const res = await request(app).delete(`/budgets/${createdBudgetId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // 11. DELETE: fail
  it('should fail to delete a non-existent budget', async () => {
    const res = await request(app).delete(`/budgets/999999`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // 12. GET by ID after delete
  it('should fail to get a deleted budget', async () => {
    const res = await request(app).get(`/budgets/${createdBudgetId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

//=================Tests para funciones adicionales=================
  // 13. Presupuesto restante por categoría
it('should return correct remaining budget after expenses', async () => {
  // Limpia transacciones y presupuestos previos
  await db.query('DELETE FROM transactions WHERE user_id = ?', [validUserId]);
  await db.query('DELETE FROM budgets WHERE user_id = ? AND category_id = ? AND year = ? AND month = ?', 
    [validUserId, validCategoryId, 2025, 6]);

  // Crea presupuesto mensual de 1000
  await request(app)
    .post('/budgets')
    .send({
      user_id: validUserId,
      category_id: validCategoryId,
      budget_type: 'monthly',
      year: 2025,
      month: 6,
      amount: 1000
    });

  // Crea gasto de 300 en la misma categoría y mes
  await db.query(
    `INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at)
     VALUES (?, 2, ?, 300, 'Gasto test', '2025-06-15')`,
    [validUserId, validCategoryId]
  );

  // Consulta presupuesto restante
  const res = await request(app)
    .get('/budgets/report/remaining')
    .query({ user_id: validUserId });

  expect(res.statusCode).toBe(200);

  // Busca la categoría de prueba
  const cat = res.body.find(item => item.category_id === validCategoryId);
  expect(cat).toBeDefined();
  expect(Number(cat.budget)).toBe(1000);
  expect(Number(cat.spent)).toBe(300);
  expect(Number(cat.remaining)).toBe(700);
});

// 14. Alertas de presupuesto (threshold 25%)
it('should return budget alerts when spent exceeds threshold', async () => {
  // Limpia transacciones y presupuestos previos
  await db.query('DELETE FROM transactions WHERE user_id = ?', [validUserId]);
  await db.query('DELETE FROM budgets WHERE user_id = ? AND category_id = ? AND year = ? AND month = ?', 
    [validUserId, validCategoryId, 2025, 6]);

  // Crea presupuesto mensual de 400
  await request(app)
    .post('/budgets')
    .send({
      user_id: validUserId,
      category_id: validCategoryId,
      budget_type: 'monthly',
      year: 2025,
      month: 6,
      amount: 400
    });

  // Crea gasto de 200 en la misma categoría y mes (50% del presupuesto)
  await db.query(
    `INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at)
     VALUES (?, 2, ?, 200, 'Gasto test', '2025-06-10')`,
    [validUserId, validCategoryId]
  );

  // Consulta alertas con threshold 25%
  const res = await request(app)
    .get('/budgets/report/alerts')
    .query({ user_id: validUserId, threshold: 25 });

  expect(res.statusCode).toBe(200);
  // Debe aparecer la categoría en las alertas
  const cat = res.body.find(item => item.category_id === validCategoryId);
  expect(cat).toBeDefined();
  expect(Number(cat.percentage_spent)).toBeGreaterThanOrEqual(50);
});

afterAll(async () => {
  // Limpieza final del presupuesto de prueba
  if (createdBudgetId) {
    await db.query('DELETE FROM budgets WHERE id = ?', [createdBudgetId]);
  }
  await db.end();
});

});
