import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Budgets API', () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const fechaTransaccion = `${currentYear}-${String(currentMonth).padStart(2,'0')}-15`;
  const fechaTransaccion2 = `${currentYear}-${String(currentMonth).padStart(2,'0')}-10`;

  let createdBudgetId;
  let adminToken;

  const validCategoryId = 2;
  const anotherCategoryId = 3;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@money.com', password: '3lManduc0.56' });

    adminToken = loginRes.body.token;
  });

  beforeEach(async () => {
    await db.query(
      'DELETE FROM budgets WHERE id != ? AND category_id = ? AND year = ? AND month = ? AND budget_type = ?',
      [createdBudgetId || -1, validCategoryId, currentYear, currentMonth, 'monthly']
    );
  });

  it('should get all budgets', async () => {
    const res = await request(app)
      .get('/budgets')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fail to create a budget with missing fields', async () => {
    const res = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category_id: validCategoryId });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should fail to create a budget with negative amount', async () => {
    const res = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category_id: validCategoryId,
        budget_type: 'monthly',
        year: currentYear,
        month: currentMonth,
        amount: -100
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should fail to create a budget with non-existent category', async () => {
    const res = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category_id: 99999,
        budget_type: 'monthly',
        year: currentYear,
        month: currentMonth,
        amount: 500
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should create a budget with valid data', async () => {
    const res = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category_id: validCategoryId,
        budget_type: 'monthly',
        year: currentYear,
        month: currentMonth,
        amount: 1000,
        notes: 'Test budget'
      });
    expect(res.statusCode).toBe(201);
    createdBudgetId = res.body.id;
    expect(res.body).toHaveProperty('id');
  });

  it('should get a budget by ID', async () => {
    const res = await request(app)
      .get(`/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdBudgetId);
  });

  it('should fail to get a non-existent budget', async () => {
    const res = await request(app)
      .get('/budgets/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should update a budget fully', async () => {
    const res = await request(app)
      .put(`/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category_id: anotherCategoryId,
        budget_type: 'monthly',
        year: currentYear,
        month: currentMonth,
        amount: 1500,
        notes: 'Updated budget'
      });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should partially update a budget', async () => {
    const res = await request(app)
      .patch(`/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2000 });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should delete a budget', async () => {
    const res = await request(app)
      .delete(`/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, id: expect.any(Number) });
  });

  it('should fail to delete a non-existent budget', async () => {
    const res = await request(app)
      .delete('/budgets/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should fail to get a deleted budget', async () => {
    const res = await request(app)
      .get(`/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should return correct remaining budget after expenses', async () => {
    await db.query('DELETE FROM transactions WHERE user_id = 1');
    await db.query('DELETE FROM budgets WHERE category_id = ? AND year = ? AND month = ?', 
      [validCategoryId, currentYear, currentMonth]);

    await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category_id: validCategoryId,
        budget_type: 'monthly',
        year: currentYear,
        month: currentMonth,
        amount: 1000
      });

    await db.query(
      `INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at)
       VALUES (?, 2, ?, 300, 'Gasto test', ?)`,
      [1, validCategoryId, fechaTransaccion]
    );

    const res = await request(app)
      .get('/budgets/report/remaining')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ user_id: 1 });

    expect(res.statusCode).toBe(200);
    const cat = res.body.find(item => item.category_id === validCategoryId);
    expect(cat).toBeDefined();
    expect(Number(cat.budget)).toBe(1000);
    expect(Number(cat.spent)).toBe(300);
    expect(Number(cat.remaining)).toBe(700);
  });

  it('should return budget alerts when spent exceeds threshold', async () => {
    await db.query('DELETE FROM transactions WHERE user_id = 1');
    await db.query('DELETE FROM budgets WHERE category_id = ? AND year = ? AND month = ?', 
      [validCategoryId, currentYear, currentMonth]);

    await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category_id: validCategoryId,
        budget_type: 'monthly',
        year: currentYear,
        month: currentMonth,
        amount: 400
      });

    await db.query(
      `INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at)
       VALUES (?, 2, ?, 200, 'Gasto test', ?)`,
      [1, validCategoryId, fechaTransaccion2]
    );

    const res = await request(app)
      .get('/budgets/report/alerts')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ user_id: 1, threshold: 25 });

    expect(res.statusCode).toBe(200);
    const cat = res.body.find(item => item.category_id === validCategoryId);
    expect(cat).toBeDefined();
    expect(Number(cat.percentage_spent)).toBeGreaterThanOrEqual(50);
  });

  afterAll(async () => {
    if (createdBudgetId) {
      await db.query('DELETE FROM budgets WHERE id = ?', [createdBudgetId]);
    }
    await db.end();
  });
});
