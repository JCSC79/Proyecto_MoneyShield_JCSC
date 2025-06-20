import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Profiles API', () => {
  let createdProfileId;
  let adminToken;
  const testProfileName = `TestProfile_${Date.now()}`;
  const shortName = 'A';

  // 1. Obtenemos token de administrador ANTES de los tests
  beforeAll(async () => {
    // Credenciales de un usuario administrador en la base de pruebas
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@money.com', 
        password: '3lManduc0.56'
      });
    
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
  if (testProfileName) {
    await db.query('DELETE FROM profiles WHERE name = ?', [testProfileName]);
  }
  await db.end();
});

  // 1. POST: Crear perfil (éxito)
  it('should create a new profile', async () => {
    const res = await request(app)
      .post('/profiles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: testProfileName });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(testProfileName);
    createdProfileId = res.body.id;
  });

  // 2. POST: Crea perfil (nombre muy corto)
  it('should fail to create profile with short name', async () => {
    const res = await request(app)
      .post('/profiles')
      .set('Authorization', `Bearer ${adminToken}`) // 🔑 Añadir token
      .send({ name: shortName });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/al menos 2 caracteres|at least 2 characters/i);
  });

  // 3. POST: Crea perfil (nombre duplicado)
  it('should fail to create duplicate profile', async () => {
    const res = await request(app)
      .post('/profiles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: testProfileName });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  // 4. GET: Obtiene todos los perfiles
  it('should get all profiles', async () => {
    const res = await request(app)
      .get('/profiles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(profile => profile.name === testProfileName)).toBe(true);
  });

  // 5. GET: Perfil por ID (éxito)
  it('should get profile by ID', async () => {
    const res = await request(app)
      .get(`/profiles/${createdProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdProfileId);
  });

  // 6. DELETE: Elimina perfil
  it('should delete profile', async () => {
    const res = await request(app)
      .delete(`/profiles/${createdProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    
    // Verifica eliminación
    const [rows] = await db.query('SELECT * FROM profiles WHERE id = ?', [createdProfileId]);
    expect(rows.length).toBe(0);
  });
});
