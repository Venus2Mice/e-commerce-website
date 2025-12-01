process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import db from '../src/models';

describe('Bill API', () => {
  let customerCookie;
  let adminCookie;
  let productId;
  let createdBillId;
  let customerId; // Added to store customer ID

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    // --- Setup Admin for product creation ---
    const roleCreateClothes = await db.Role.create({ url: '/api/clothes/create', description: 'Create Clothes' });
    const adminGroup = await db.Group.create({ id: 1, name: 'Admin', description: 'Admin Group' });
    await db.Group_Role.create({ groupId: 1, roleId: roleCreateClothes.id });

    await request(app).post('/api/user/register').send({
      email: 'admin@test.com',
      password: 'admin123',
      phoneNumber: '1111111111',
      firstName: 'Admin',
      lastName: 'Test',
      gender: 'Male',
      groupId: 1
    });

    const adminLoginRes = await request(app).post('/api/user/login').send({
      loginAcc: 'admin@test.com',
      password: 'admin123'
    });
    adminCookie = adminLoginRes.headers['set-cookie'].find(c => c.startsWith('user='));

    // Create a product as Admin
    const createProductRes = await request(app)
      .post('/api/clothes/create')
      .set('Cookie', [adminCookie])
      .send({
        name: 'Test Product',
        contentMarkdown: '## Test Content',
        discount: 5,
        price: 50,
        type: 'SHIRT',
        category: 'MEN',
        imgArray: ['base64testimage'],
        stockData: [{ color: 'Green', size: 'M', stock: 10 }]
      });
    
    expect(createProductRes.statusCode).toBe(200);
    expect(createProductRes.body.EC).toBe(0);

    const getProductRes = await request(app).get('/api/clothes/get?type=ALL');
    expect(getProductRes.body.DT.length).toBeGreaterThan(0);
    productId = getProductRes.body.DT[0].id;


    // --- Setup Customer for bill creation ---
    const roleCreateBill = await db.Role.create({ url: '/api/bill/create', description: 'Create Bill' });
    const roleGetBill = await db.Role.create({ url: '/api/bill/get', description: 'Get Bill' });
    const roleDeleteBill = await db.Role.create({ url: '/api/bill/delete', description: 'Delete Bill' });
    const roleUpdateBill = await db.Role.create({ url: '/api/bill/update', description: 'Update Bill' });


    const customerGroup = await db.Group.create({ id: 3, name: 'Customer', description: 'Customer Group' }); 
    await db.Group_Role.create({ groupId: 3, roleId: roleCreateBill.id });
    await db.Group_Role.create({ groupId: 3, roleId: roleGetBill.id });
    await db.Group_Role.create({ groupId: 3, roleId: roleDeleteBill.id });
    await db.Group_Role.create({ groupId: 3, roleId: roleUpdateBill.id });


    const customerRegisterRes = await request(app).post('/api/user/register').send({
      email: 'customer@test.com',
      password: 'customer123',
      phoneNumber: '2222222222',
      firstName: 'Customer',
      lastName: 'Test',
      gender: 'Female',
      groupId: 3
    });

    const customerLoginRes = await request(app).post('/api/user/login').send({
      loginAcc: 'customer@test.com',
      password: 'customer123'
    });
    customerCookie = customerLoginRes.headers['set-cookie'].find(c => c.startsWith('user='));
    customerId = customerLoginRes.body.DT.id; // Store customer ID

  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('POST /api/bill/create - should create a new bill (checkout)', async () => {
    const res = await request(app)
      .post('/api/bill/create')
      .set('Cookie', [customerCookie])
      .send({
        userId: customerId, // Corrected: use stored customerId
        time: new Date().toISOString(), // Required by service
        amount: 50, 
        type: 'RECEIVED', 
        colorSizeData: [{ 
          clothesId: productId,
          color: 'Green',
          size: 'M',
          stock: 1 // Corrected: stock for ShoppingCart.bulkCreate
        }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    expect(res.body.EM).toBe('Create bill completed!');
    
    // Fetch the created bill ID for subsequent tests
    const getBillsRes = await request(app)
        .get('/api/bill/get?type=PAGINATION&page=0&pageSize=10') // Changed to PAGINATION
        .set('Cookie', [customerCookie]);
    
    expect(getBillsRes.statusCode).toBe(200);
    expect(getBillsRes.body.EC).toBe(0);
    expect(getBillsRes.body.DT.data.length).toBeGreaterThan(0);
    createdBillId = getBillsRes.body.DT.data[0].id;
  });

  test('GET /api/bill/get - should retrieve customer bills', async () => {
    const res = await request(app)
      .get('/api/bill/get?type=PAGINATION&page=0&pageSize=10') // Changed to PAGINATION
      .set('Cookie', [customerCookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    expect(res.body.DT.data).toBeInstanceOf(Array);
    expect(res.body.DT.data.length).toBeGreaterThan(0);
  });

  test('PUT /api/bill/update - should successfully update a bill', async () => {
    const res = await request(app)
      .put('/api/bill/update')
      .set('Cookie', [customerCookie])
      .send({
          id: createdBillId,
          amount: 60,
          status: 'Confirmed',
          bankName: 'Test Bank',
          accountNumber: '123456789',
          note: 'Updated Note'
      });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
  });


  test('DELETE /api/bill/delete - should delete a bill', async () => {
    const res = await request(app)
      .delete(`/api/bill/delete?id=${createdBillId}`)
      .set('Cookie', [customerCookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);
    expect(res.body.EM).toBe('Delete bill completed!');
  });
});