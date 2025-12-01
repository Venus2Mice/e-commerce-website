process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import db from '../src/models';

describe('Auth API', () => {
  beforeAll(async () => {
    // Sync database (create tables)
    await db.sequelize.sync({ force: true });

    // Seed Group and Role for permissions
    const role = await db.Role.create({
      url: '/api/user/get',
      description: 'Get Users'
    });

    const group = await db.Group.create({
      id: 3,
      name: 'Customer',
      description: 'Customer Group'
    });
    
    // Manually create association
    await db.Group_Role.create({
      groupId: 3,
      roleId: role.id
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    phoneNumber: '1234567890',
    firstName: 'Test',
    lastName: 'User',
    gender: 'Male',
    groupId: 3 // Assuming 3 is customer
  };

  test('POST /api/user/register - should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send(testUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    expect(res.body.EM).toBe('Register completed!');
  });

  test('POST /api/user/login - should login successfully', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        loginAcc: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    
    // Check if cookie is set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/user=/);
  });

  test('POST /api/user/login - should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        loginAcc: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.body.EC).not.toBe(0);
  });

  test('GET /api/user/get - should return user list if authenticated', async () => {
    // Login first
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({
        loginAcc: testUser.email,
        password: testUser.password
      });
    
    const cookies = loginRes.headers['set-cookie'];
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));

    const res = await request(app)
      .get('/api/user/get?type=ALL')
      .set('Cookie', [userCookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    expect(res.body.DT).toBeInstanceOf(Array);
  });

  test('POST /api/user/register - should fail with missing fields (Validation)', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        firstName: 'Bad',
        lastName: 'Request'
        // Missing email, password, phone
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.EC).toBe(-1);
  });

  test('GET /api/user/get - should fail 401 if not logged in', async () => {
    const res = await request(app)
      .get('/api/user/get?type=ALL');
      // No Cookie set

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/user/get - should fail 403 if logged in but no permission', async () => {
    // 1. Create a user with a Group that has NO roles
    await db.Group.create({ id: 99, name: 'NoRights', description: 'No Rights' });
    const noRightsUser = {
      email: 'norights@example.com',
      password: 'password123',
      phoneNumber: '0000000000',
      firstName: 'No',
      lastName: 'Rights',
      gender: 'Female',
      groupId: 99 
    };
    
    // Register
    await request(app).post('/api/user/register').send(noRightsUser);

    // 2. Login
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({
        loginAcc: noRightsUser.email,
        password: noRightsUser.password
      });
    
    const cookies = loginRes.headers['set-cookie'];
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));

    // 3. Try to access protected route
    const res = await request(app)
      .get('/api/user/get?type=ALL')
      .set('Cookie', [userCookie]);

    expect(res.statusCode).toBe(403);
  });
});
