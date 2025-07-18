import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Users API (con autenticación JWT)', () => {
  let adminToken;
  let createdUserId;
  const testEmail = `testuser${Date.now()}@example.com`;
  const strongPassword = 'SecurePass123!';

  const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@money.com';
  const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '3lManduc0.56';

  // Login como admin antes de todos los tests
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = loginRes.body.token;
  });

  // 1. GET all users (solo admin)
  it('should get all users with 200 OK (admin)', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 2. POST: fail with missing fields
  it('should return 400 for incomplete user data', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ first_name: 'Incomplete' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });

  // 3. POST: fail with invalid email
  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: 'invalid-email',
        password: strongPassword,
        profile_id: 2
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  // 4. POST: fail with invalid profile
  it('should return 400 for non-existent profile', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: `nonexistent${Date.now()}@example.com`,
        password: strongPassword,
        profile_id: 9999
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/profile/i);
  });

  // 5. POST: success
  it('should create user with 201 and return sanitized data', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: testEmail,
        password: strongPassword,
        profile_id: 2
      });
    expect(res.statusCode).toBe(201);
    createdUserId = res.body.id;
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,
      profile_id: 2
    });
    expect(res.body).not.toHaveProperty('password_hash');
  });

  // 6. POST: fail duplicate email
  it('should return 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        first_name: 'Duplicate',
        last_name: 'User',
        email: testEmail,
        password: strongPassword,
        profile_id: 2
      });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  // 7. GET by ID
  it('should get user by ID with 200 OK', async () => {
    const res = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdUserId);
  });

  // 8. GET non-existent user
  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .get('/users/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch('User not found');
  });

  // 9. PUT: full update (admin)
  it('should fully update user with 200 OK', async () => {
    const newEmail = `updated${Date.now()}@example.com`;
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        first_name: 'Updated',
        last_name: 'User',
        email: newEmail,
        password_hash: 'NewSecurePass123!',
        profile_id: 2
      });
    expect(res.statusCode).toBe(200);
    const getRes = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.body.email).toBe(newEmail);
  });

  // 10. PATCH: partial update (admin)
  it('should partially update user with 200 OK', async () => {
    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ first_name: 'Patched' });
    expect(res.statusCode).toBe(200);
    const getRes = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.body.first_name).toBe('Patched');
  });

  // 11. DELETE: success (admin)
  it('should delete user with 200 OK', async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  // 12. DELETE non-existent user
  it('should return 404 when deleting non-existent user', async () => {
    const res = await request(app)
      .delete('/users/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  afterAll(async () => {
    await db.end();
  });
  
});
