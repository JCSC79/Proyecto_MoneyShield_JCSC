import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Auth API', () => {
  const adminEmail = 'admin@money.com';
  const adminPassword = '3lManduc0.56';

  afterAll(async () => {
    await db.end();
  });

// 1. POST /auth/login - Login with valid credentials| Inicia sesión con credenciales válidas
  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

// 2. POST /auth/login - Fail login with incorrect email or password| Falla al iniciar sesión con email o contraseña incorrectos
  it('should fail login with incorrect email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrong@money.com', password: adminPassword });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

// 3. POST /auth/login - Fail login with incorrect password| Falla al iniciar sesión con contraseña incorrecta
  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: adminEmail, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

// 4. POST /auth/login - Fail login with missing fields| Falla al iniciar sesión con campos faltantes
  it('should fail login with missing fields', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: adminEmail });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

// 5. POST /auth/login - Fail login with empty fields| Falla al iniciar sesión con campos vacíos
it('should fail login with empty fields', async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: '', password: '' });

  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty('error');
});
});
