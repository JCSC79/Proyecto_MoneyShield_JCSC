import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Transactions API (full integration, extended)', () => {
  let adminToken;
  const validTypeId = 1;
  const validCategoryId = 1;
  const invalidTypeId = 99999;
  const invalidCategoryId = 99999;
  let createdTransactionId;
  let othersCategoryId;

  beforeAll(async () => {
    // Login como admin
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@money.com', password: '3lManduc0.56' });
    adminToken = loginRes.body.token;

    // Crear/obtener categoría "Others"
    await db.query(`
      INSERT INTO categories (name)
      SELECT 'Others' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Others')
    `);
    const [rows] = await db.query('SELECT id FROM categories WHERE name = "Others" LIMIT 1');
    othersCategoryId = rows[0].id;
  });

  // 1. Crear transacción válida con category_id (esta será la base para update/delete)
  it('should create a valid transaction with category_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: 100.50,
        description: 'Compra supermercado'
      });
    expect(res.statusCode).toBe(201);
    createdTransactionId = res.body.id;
    expect(res.body).toMatchObject({
      type_id: validTypeId,
      category_id: validCategoryId,
      amount: 100.5,
      description: 'Compra supermercado'
    });
  });

  // 2. Crear transacción válida sin category_id (debe usar "Others")
  it('should create a valid transaction without category_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type_id: validTypeId,
        amount: 200.00,
        description: 'Sin categoría'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.category_id).toBe(othersCategoryId);
  });

  // Casos que deben fallar
  it('should fail with amount as string', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type_id: validTypeId, category_id: validCategoryId, amount: "100.50" });
    expect(res.statusCode).toBe(400);
  });

  it('should fail with negative amount', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type_id: validTypeId, category_id: validCategoryId, amount: -50 });
    expect(res.statusCode).toBe(400);
  });

  it('should fail with missing amount', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type_id: validTypeId, category_id: validCategoryId });
    expect(res.statusCode).toBe(400);
  });

  it('should fail with missing type_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category_id: validCategoryId, amount: 100 });
    expect(res.statusCode).toBe(400);
  });

  it('should fail with non-existent user (should be ignored)', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type_id: validTypeId, category_id: validCategoryId, amount: 100 });
    expect(res.statusCode).toBe(201); // Ya no falla por user_id inválido
  });

  it('should fail with non-existent type_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type_id: invalidTypeId, category_id: validCategoryId, amount: 50 });
    expect(res.statusCode).toBe(400);
  });

  it('should fail with non-existent category_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type_id: validTypeId, category_id: invalidCategoryId, amount: 50 });
    expect(res.statusCode).toBe(400);
  });

  it('should get all transactions', async () => {
    const res = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a transaction by ID', async () => {
    const res = await request(app)
      .get(`/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('should fail to get transaction by invalid ID', async () => {
    const res = await request(app)
      .get('/transactions/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  // === BLOQUE SEGURO PARA UPDATE/PATCH/DELETE ===
  describe('Updates and Deletions', () => {
    it('should fully update a transaction', async () => {
      const res = await request(app)
        .put(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type_id: validTypeId,
          category_id: validCategoryId,
          amount: 300.00,
          description: 'Actualización completa'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.description).toBe('Actualización completa');
    });

    it('should partially update a transaction', async () => {
      const res = await request(app)
        .patch(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 350.00 });
      expect(res.statusCode).toBe(200);
      expect(Number(res.body.amount)).toBeCloseTo(350.00, 2);
    });

    it('should fail to update with invalid category_id', async () => {
      const res = await request(app)
        .patch(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ category_id: invalidCategoryId });
      expect(res.statusCode).toBe(400);
    });

    it('should fail to update non-existent transaction', async () => {
      const res = await request(app)
        .patch('/transactions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 500 });
      expect(res.statusCode).toBe(404);
    });

    it('should delete a transaction', async () => {
      const res = await request(app)
        .delete(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should fail to delete non-existent transaction', async () => {
      const res = await request(app)
        .delete(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // Reportes
  it('should return user balance', async () => {
    const res = await request(app)
      .get('/transactions/report/balance')
      .query({ user_id: 1 })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('should return expenses by category', async () => {
    const res = await request(app)
      .get('/transactions/report/expenses-by-category')
      .query({ user_id: 1 })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('should return monthly expenses evolution', async () => {
    const res = await request(app)
      .get('/transactions/report/monthly-expenses')
      .query({ user_id: 1 })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  afterAll(async () => {
    await db.end();
  });
});
