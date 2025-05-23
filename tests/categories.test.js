import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Categories API', () => {
  let createdCategoryId;
  const testCategoryName = `TestCategory_${Date.now()}`;

  // Limpiar datos después de las pruebas
  afterAll(async () => {
    if (createdCategoryId) {
      await db.query('DELETE FROM categories WHERE id = ?', [createdCategoryId]);
    }
    await db.end();
  });

  // POST: Crear categoría (éxito)
  it('should create a new category', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: testCategoryName });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(testCategoryName);
    createdCategoryId = res.body.id;
  });

  // POST: Crear categoría (nombre duplicado)
  it('should fail to create duplicate category', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: testCategoryName });
    
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  // GET: Todas las categorías
  it('should get all categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.some(cat => cat.name === testCategoryName)).toBe(true);
  });

  // GET: Categoría por ID (éxito)
  it('should get category by ID', async () => {
    const res = await request(app).get(`/categories/${createdCategoryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdCategoryId);
  });

  // GET: Categoría por ID (no existe)
  it('should fail to get non-existent category', async () => {
    const res = await request(app).get('/categories/999999');
    expect(res.statusCode).toBe(404);
  });

  // PUT: Actualizar categoría
  it('should update category', async () => {
    const newName = 'UpdatedCategory';
    const res = await request(app)
      .put(`/categories/${createdCategoryId}`)
      .send({ name: newName });
    
    expect(res.statusCode).toBe(200);
    
    // Verificar actualización en BD
    const [rows] = await db.query('SELECT name FROM categories WHERE id = ?', [createdCategoryId]);
    expect(rows[0].name).toBe(newName);
  });

  // DELETE: Eliminar categoría
  it('should delete category', async () => {
    const res = await request(app).delete(`/categories/${createdCategoryId}`);
    expect(res.statusCode).toBe(200);
    
    // Verificar eliminación
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [createdCategoryId]);
    expect(rows.length).toBe(0);
  });
});
