process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import db from '../src/models';

describe('Clothes API', () => {
  let adminCookie;
  let createdClothesId;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    // 1. Create Admin Group & Role
    const roleCreate = await db.Role.create({ url: '/api/clothes/create', description: 'Create Clothes' });
    const roleUpdate = await db.Role.create({ url: '/api/clothes/update', description: 'Update Clothes' });
    const roleDelete = await db.Role.create({ url: '/api/clothes/delete', description: 'Delete Clothes' });
    
    const adminGroup = await db.Group.create({ id: 1, name: 'Admin', description: 'Admin Group' });
    
    await db.Group_Role.create({ groupId: 1, roleId: roleCreate.id });
    await db.Group_Role.create({ groupId: 1, roleId: roleUpdate.id });
    await db.Group_Role.create({ groupId: 1, roleId: roleDelete.id });

    // 2. Create Admin User
    await request(app).post('/api/user/register').send({
      email: 'admin@store.com',
      password: 'admin123',
      phoneNumber: '9999999999',
      firstName: 'Admin',
      lastName: 'User',
      gender: 'Male',
      groupId: 1 // Admin
    });

    // 3. Login to get Cookie
    const loginRes = await request(app).post('/api/user/login').send({
      loginAcc: 'admin@store.com',
      password: 'admin123'
    });

    const cookies = loginRes.headers['set-cookie'];
    adminCookie = cookies.find(c => c.startsWith('user='));
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('GET /api/clothes/get - should be public and return empty list initially', async () => {
    const res = await request(app).get('/api/clothes/get?type=ALL'); // Service requires type=ALL
    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    expect(res.body.DT).toBeInstanceOf(Array);
    expect(res.body.DT.length).toBe(0);
  });

  test('POST /api/clothes/create - should fail if not authenticated', async () => {
    const res = await request(app).post('/api/clothes/create').send({ name: 'T-Shirt' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/clothes/create - should create clothes with Admin permission', async () => {
    const res = await request(app)
      .post('/api/clothes/create')
      .set('Cookie', [adminCookie])
      .send({
        name: 'Cool T-Shirt',
        description: 'A very cool shirt', // Not used directly but good to have
        contentMarkdown: '## Cool Shirt', // Required
        discount: 10, // Required
        price: 100,
        type: 'TSHIRT',
        category: 'MEN',
        imgArray: ['base64string'], // Required array
        stockData: [ // Required array
            { color: 'Red', size: 'M', stock: 10 },
            { color: 'Blue', size: 'L', stock: 5 }
        ]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    
    // Fetch ID to verify
    const getRes = await request(app).get('/api/clothes/get?type=ALL');
    expect(getRes.body.DT.length).toBeGreaterThan(0);
    createdClothesId = getRes.body.DT[0].id;
  });

  test('PUT /api/clothes/update - should update clothes', async () => {
    const res = await request(app)
      .put('/api/clothes/update')
      .set('Cookie', [adminCookie])
      .send({
        type: 'OTHER', // Required by service
        data: {
            id: createdClothesId,
            name: 'Updated T-Shirt',
            price: 150,
            type: 'TSHIRT',
            category: 'MEN',
            discount: 15,
            contentMarkdown: '## Updated Content',
            color_size: [ // Service expects 'color_size' for update, not 'stockData'
                { color: 'Red', size: 'M', stock: 20 }
            ]
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
  });

  test('DELETE /api/clothes/delete - should delete clothes', async () => {
    const res = await request(app)
      .delete(`/api/clothes/delete?id=${createdClothesId}`)
      .set('Cookie', [adminCookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
  });
});
