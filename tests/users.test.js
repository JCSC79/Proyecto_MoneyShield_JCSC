import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Users API', () => {
  let createdUserId;

  // GET all users
  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // POST: fail with missing fields
  it('should fail to create a user with missing fields', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        first_name: 'Test'
        // missing last_name, email, password_hash, profile_id
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // POST: fail with invalid email format
  it('should fail to create a user with invalid email', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        first_name: 'Invalid',
        last_name: 'Email',
        email: 'not-an-email',
        password_hash: 'secret',
        profile_id: 2
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // POST: fail with invalid profile_id
  it('should fail to create a user with invalid profile_id', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: `invalidprofile${Date.now()}@example.com`,
        password_hash: 'secret',
        profile_id: 9999 // assuming this doesn't exist
      });
    expect([400, 404]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('error');
  });

  // POST: success
  it('should create a user with valid data', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: `testuser${Date.now()}@example.com`,
        password_hash: 'secret',
        profile_id: 2,
        base_budget: 1000.00,
        base_saving: 200.00
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).not.toHaveProperty('password_hash');
    createdUserId = res.body.id;
  });

  // POST: fail with duplicate email
  it('should fail to create a user with duplicate email', async () => {
    const email = `duplicate${Date.now()}@example.com`;
    // Create first user
    await request(app).post('/users').send({
      first_name: 'Dup',
      last_name: 'User',
      email,
      password_hash: 'secret',
      profile_id: 2
    });
    // Try to create second user with same email
    const res = await request(app).post('/users').send({
      first_name: 'Dup2',
      last_name: 'User2',
      email,
      password_hash: 'secret',
      profile_id: 2
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GET by ID (success)
  it('should get a user by ID', async () => {
    const res = await request(app).get(`/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
    expect(res.body).toHaveProperty('first_name');
    expect(res.body).toHaveProperty('last_name');
    expect(res.body).toHaveProperty('email');
    expect(res.body).not.toHaveProperty('password_hash');
  });

  // GET by ID (fail)
  it('should fail to get a non-existent user', async () => {
    const res = await request(app).get('/users/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // PUT: update all fields
  it('should update a user', async () => {
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .send({
        first_name: 'Updated',
        last_name: 'User',
        email: `updated${Date.now()}@example.com`,
        password_hash: 'newsecret',
        profile_id: 2,
        base_budget: 2000.00,
        base_saving: 400.00
      });
    expect([200, 204]).toContain(res.statusCode);
  });

  // PATCH: update some fields
  it('should partially update a user', async () => {
    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .send({
        first_name: 'Patched'
      });
    expect([200, 204]).toContain(res.statusCode);
  });

  // PATCH: fail with invalid email
  it('should fail to patch user with invalid email', async () => {
    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .send({ email: 'bademail' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // PATCH: fail with invalid profile_id
  it('should fail to patch user with invalid profile_id', async () => {
    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .send({ profile_id: 9999 });
    expect([400, 404]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('error');
  });

  // DELETE: success
  it('should delete a user', async () => {
    const res = await request(app).delete(`/users/${createdUserId}`);
    expect([200, 204]).toContain(res.statusCode);
  });

  // DELETE: fail
  it('should fail to delete a non-existent user', async () => {
    const res = await request(app).delete('/users/999999');
    expect([400, 404]).toContain(res.statusCode);
  });

  // GET by ID after delete
  it('should fail to get a deleted user', async () => {
    const res = await request(app).get(`/users/${createdUserId}`);
    expect([404, 400]).toContain(res.statusCode);
  });

  // Close DB pool after all tests
  afterAll(async () => {
    await db.end();
  });
});
