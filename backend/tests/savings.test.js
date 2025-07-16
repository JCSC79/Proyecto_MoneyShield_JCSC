import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Savings API', () => {
  let createdSavingId;
  let adminToken;
  const testSavingType = 1;

  const baseSaving = {
    type_id: testSavingType,
    name: 'Vacaciones 2025',
    amount: 500,
    target_amount: 2000,
    target_date: '2025-12-31'
  };

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@money.com',
        password: '3lManduc0.56'
      });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    if (createdSavingId) {
      await db.query('DELETE FROM savings WHERE id = ?', [createdSavingId]);
    }
    await db.end();
  });

  it('should create saving with target', async () => {
    const res = await request(app)
      .post('/savings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(baseSaving);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      type_id: baseSaving.type_id,
      name: baseSaving.name,
      amount: baseSaving.amount,
      target_amount: baseSaving.target_amount,
      target_date: baseSaving.target_date
    });
    createdSavingId = res.body.id;
  });

  it('should create saving without target', async () => {
    const res = await request(app)
      .post('/savings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...baseSaving,
        name: 'Ahorro sin meta',
        target_amount: null,
        target_date: null
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.target_amount).toBeNull();
    expect(res.body.target_date).toBeNull();
  });

  it('should fail to create saving with invalid amount', async () => {
    const res = await request(app)
      .post('/savings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...baseSaving,
        amount: -100
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/positive number/i);
  });

  it('should fail if target_amount is less than amount', async () => {
    const res = await request(app)
      .post('/savings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...baseSaving,
        amount: 1000,
        target_amount: 500
      });

    expect(res.statusCode).toBe(400);
  });

  it('should get all savings for user', async () => {
    const res = await request(app)
      .get('/savings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get saving by ID', async () => {
    const res = await request(app)
      .get(`/savings/${createdSavingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdSavingId);
  });

  it('should fail to get non-existent saving', async () => {
    const res = await request(app)
      .get('/savings/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should fully update saving', async () => {
    const updatedData = {
      type_id: testSavingType,
      name: 'Vacaciones actualizadas',
      amount: 800,
      target_amount: 2500,
      target_date: '2026-01-01'
    };

    const res = await request(app)
      .put(`/savings/${createdSavingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);

    const [rows] = await db.query('SELECT name, amount, target_amount, target_date FROM savings WHERE id = ?', [createdSavingId]);
    expect(rows[0].name).toBe(updatedData.name);
    expect(Number(rows[0].amount)).toBe(updatedData.amount);
    expect(Number(rows[0].target_amount)).toBe(updatedData.target_amount);
    const dbDate = rows[0].target_date instanceof Date
      ? rows[0].target_date.toISOString().slice(0, 10)
      : rows[0].target_date.slice(0, 10);
    expect(dbDate).toBe(updatedData.target_date);
  });

  it('should partially update saving (name)', async () => {
    const res = await request(app)
      .patch(`/savings/${createdSavingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nombre parcial' });

    expect(res.statusCode).toBe(200);

    const [rows] = await db.query('SELECT name FROM savings WHERE id = ?', [createdSavingId]);
    expect(rows[0].name).toBe('Nombre parcial');
  });

  it('should partially update saving (amount)', async () => {
    const res = await request(app)
      .patch(`/savings/${createdSavingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 1234 });

    expect(res.statusCode).toBe(200);

    const [rows] = await db.query('SELECT amount FROM savings WHERE id = ?', [createdSavingId]);
    expect(Number(rows[0].amount)).toBe(1234);
  });

  it('should fail to patch with invalid fields', async () => {
    const res = await request(app)
      .patch(`/savings/${createdSavingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ invalid_field: 'nope' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/valid fields/i);
  });

  it('should delete saving', async () => {
    const res = await request(app)
      .delete(`/savings/${createdSavingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    const [rows] = await db.query('SELECT * FROM savings WHERE id = ?', [createdSavingId]);
    expect(rows.length).toBe(0);
  });

  it('should fail to delete non-existent saving', async () => {
    const res = await request(app)
      .delete('/savings/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should return savings progress with target', async () => {
    const savingRes = await request(app)
      .post('/savings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type_id: testSavingType,
        name: 'Ahorro con progreso',
        amount: 500,
        target_amount: 2000,
        target_date: '2025-12-31'
      });
    const savingId = savingRes.body.id;

    const res = await request(app)
      .get('/savings/report/progress')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    const savingProgress = res.body.find(item => item.id === savingId);
    expect(savingProgress).toBeDefined();
    expect(Number(savingProgress.progress_percent)).toBe(25); // (500/2000)*100
    expect(savingProgress.days_left).toBeGreaterThan(0);
  });

  it('should return savings progress without target', async () => {
    const savingRes = await request(app)
      .post('/savings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type_id: testSavingType,
        name: 'Ahorro sin meta',
        amount: 300,
        target_amount: null,
        target_date: null
      });
    const savingId = savingRes.body.id;

    const res = await request(app)
      .get('/savings/report/progress')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    const savingProgress = res.body.find(item => item.id === savingId);
    expect(savingProgress).toBeDefined();
    expect(savingProgress.progress_percent).toBeNull();
    expect(savingProgress.days_left).toBeNull();
  });

  it('should update progress after adding to savings', async () => {
    const savingRes = await request(app)
      .post('/savings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type_id: testSavingType,
        name: 'Ahorro para actualizar',
        amount: 1000,
        target_amount: 5000,
        target_date: '2026-06-01'
      });
    const savingId = savingRes.body.id;

    await request(app)
      .patch(`/savings/${savingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2500 });

    const res = await request(app)
      .get('/savings/report/progress')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    const savingProgress = res.body.find(item => item.id === savingId);
    expect(Number(savingProgress.progress_percent)).toBe(50); // (2500/5000)*100
  });

});
