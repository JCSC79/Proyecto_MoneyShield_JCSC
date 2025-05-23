import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Savings API', () => {
  let createdSavingId;
  const testUserId = 1; // Asegúrate de que existe en la BD
  const testSavingType = 1; // Asegúrate de que existe en la BD

  // Datos de prueba base
  const baseSaving = {
    user_id: testUserId,
    type_id: testSavingType,
    name: 'Vacaciones 2025',
    amount: 500,
    target_amount: 2000,
    target_date: '2025-12-31'
  };

  afterAll(async () => {
    if (createdSavingId) {
      await db.query('DELETE FROM savings WHERE id = ?', [createdSavingId]);
    }
    await db.end();
  });

  // POST: Crear ahorro (con target)
  it('should create saving with target', async () => {
    const res = await request(app)
      .post('/savings')
      .send(baseSaving);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      user_id: baseSaving.user_id,
      type_id: baseSaving.type_id,
      name: baseSaving.name,
      amount: baseSaving.amount,
      target_amount: baseSaving.target_amount,
      target_date: baseSaving.target_date
    });
    createdSavingId = res.body.id;
  });

  // POST: Crear ahorro (sin target)
  it('should create saving without target', async () => {
    const res = await request(app)
      .post('/savings')
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

  // POST: Fallar con monto inválido
  it('should fail to create saving with invalid amount', async () => {
    const res = await request(app)
      .post('/savings')
      .send({
        ...baseSaving,
        amount: -100
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/positive number/i);
  });

  // POST: Fallar con target_amount menor que amount
  it('should fail if target_amount is less than amount', async () => {
    const res = await request(app)
      .post('/savings')
      .send({
        ...baseSaving,
        amount: 1000,
        target_amount: 500
      });

    expect(res.statusCode).toBe(400);
  });

  // GET: Todos los ahorros del usuario
  it('should get all savings for user', async () => {
    const res = await request(app)
      .get('/savings')
      .query({ user_id: testUserId });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // GET: Ahorro por ID
  it('should get saving by ID', async () => {
    const res = await request(app).get(`/savings/${createdSavingId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdSavingId);
  });

  // GET: Ahorro inexistente
  it('should fail to get non-existent saving', async () => {
    const res = await request(app).get('/savings/999999');
    expect(res.statusCode).toBe(404);
  });

  // PUT: Actualización completa (todos los campos)
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
      .send(updatedData);

    expect(res.statusCode).toBe(200);

    // Verificar actualización en BD
    const [rows] = await db.query('SELECT name, amount, target_amount, target_date FROM savings WHERE id = ?', [createdSavingId]);
    expect(rows[0].name).toBe(updatedData.name);
    expect(Number(rows[0].amount)).toBe(updatedData.amount);
    expect(Number(rows[0].target_amount)).toBe(updatedData.target_amount);
    // CORRECCIÓN: comparar solo la parte de la fecha
    const dbDate = rows[0].target_date instanceof Date
      ? rows[0].target_date.toISOString().slice(0, 10)
      : rows[0].target_date.slice(0, 10);
    expect(dbDate).toBe(updatedData.target_date);
  });

  // PATCH: Actualización parcial (solo nombre)
  it('should partially update saving (name)', async () => {
    const res = await request(app)
      .patch(`/savings/${createdSavingId}`)
      .send({ name: 'Nombre parcial' });

    expect(res.statusCode).toBe(200);

    const [rows] = await db.query('SELECT name FROM savings WHERE id = ?', [createdSavingId]);
    expect(rows[0].name).toBe('Nombre parcial');
  });

  // PATCH: Actualización parcial (solo amount)
  it('should partially update saving (amount)', async () => {
    const res = await request(app)
      .patch(`/savings/${createdSavingId}`)
      .send({ amount: 1234 });

    expect(res.statusCode).toBe(200);

    const [rows] = await db.query('SELECT amount FROM savings WHERE id = ?', [createdSavingId]);
    expect(Number(rows[0].amount)).toBe(1234);
  });

  // PATCH: Fallar con campos inválidos
  it('should fail to patch with invalid fields', async () => {
    const res = await request(app)
      .patch(`/savings/${createdSavingId}`)
      .send({ invalid_field: 'nope' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/valid fields/i);
  });

  // DELETE: Eliminar ahorro
  it('should delete saving', async () => {
    const res = await request(app).delete(`/savings/${createdSavingId}`);
    expect(res.statusCode).toBe(200);

    // Verificar eliminación
    const [rows] = await db.query('SELECT * FROM savings WHERE id = ?', [createdSavingId]);
    expect(rows.length).toBe(0);
  });

  // DELETE: Fallar al eliminar ahorro inexistente
  it('should fail to delete non-existent saving', async () => {
    const res = await request(app).delete('/savings/999999');
    expect(res.statusCode).toBe(404);
  });
});
