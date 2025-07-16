import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Categories API', () => {
  let createdCategoryId;
  let adminToken;
  const testCategoryName = `TestCategory_${Date.now()}`;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@money.com', password: '3lManduc0.56' });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    if (createdCategoryId) {
      await db.query('DELETE FROM categories WHERE id = ?', [createdCategoryId]);
    }
    await db.end();
  });

  // 1. POST: Crear categoría (éxito)
  it('should create a new category', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: testCategoryName, type: 'expense' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(testCategoryName);
    createdCategoryId = res.body.id;
  });

  // 2. POST: Crear categoría (nombre duplicado)
  it('should fail to create duplicate category', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: testCategoryName, type: 'expense' });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  // 3. GET: Todas las categorías
  it('should get all categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.some(cat => cat.name === testCategoryName)).toBe(true);
  });

  // 4. GET: Categoría por ID (éxito)
  it('should get category by ID', async () => {
    const res = await request(app).get(`/categories/${createdCategoryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdCategoryId);
  });

  // 5. GET: Categoría por ID (no existe)
  it('should fail to get non-existent category', async () => {
    const res = await request(app).get('/categories/999999');
    expect(res.statusCode).toBe(404);
  });

  // 6. PUT: Actualizar categoría
  it('should update category', async () => {
    const newName = 'UpdatedCategory';
    const res = await request(app)
      .put(`/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: newName, type: 'expense' }); // Requiere enviar type

    expect(res.statusCode).toBe(200);

    // Verificar actualización en BD
    const [rows] = await db.query('SELECT name FROM categories WHERE id = ?', [createdCategoryId]);
    expect(rows[0].name).toBe(newName);
  });

  // 7. DELETE: Eliminar categoría
  it('should delete category', async () => {
    const res = await request(app)
      .delete(`/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    // Verificar eliminación en BD
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [createdCategoryId]);
    expect(rows.length).toBe(0);
  });
});
