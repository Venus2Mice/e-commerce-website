process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import db from '../src/models';

describe('Webhook API', () => {
  let customerCookie;
  let adminCookie;
  let productId;
  let createdBillId;
  let colorSizeId;
  let customerId;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    // Setup Admin to create a product
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
        name: 'Webhook Test Product',
        contentMarkdown: '## Test Content',
        discount: 5,
        price: 50,
        type: 'SHIRT',
        category: 'MEN',
        imgArray: ['base64testimage'],
        stockData: [{ color: 'Blue', size: 'L', stock: 10 }]
      });

    expect(createProductRes.statusCode).toBe(200);
    expect(createProductRes.body.EC).toBe(0);

    const getProductRes = await request(app).get('/api/clothes/get?type=ALL');
    productId = getProductRes.body.DT[0].id;
    colorSizeId = getProductRes.body.DT[0].Color_Sizes[0].id;

    // Setup Customer for bill creation
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
      email: 'customer-webhook@test.com',
      password: 'customer123',
      phoneNumber: '2222222222',
      firstName: 'Customer',
      lastName: 'Test',
      gender: 'Female',
      groupId: 3
    });

    const customerLoginRes = await request(app).post('/api/user/login').send({
      loginAcc: 'customer-webhook@test.com',
      password: 'customer123'
    });
    customerCookie = customerLoginRes.headers['set-cookie'].find(c => c.startsWith('user='));
    customerId = customerLoginRes.body.DT.id;
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('POST /api/hooks/payment - missing fields returns error', async () => {
    const res = await request(app).post('/api/hooks/payment').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(-1);
  });

  test('POST /api/hooks/payment - non-parsable description returns error', async () => {
    const webhookPayload = {
      gateway: 'TestBank',
      accountNumber: '000111222',
      transferAmount: 50,
      description: `No digits here`,
      transferType: 'in'
    };

    const webhookRes = await request(app).post('/api/hooks/payment').send(webhookPayload);
    expect(webhookRes.statusCode).toBe(200);
    expect(webhookRes.body.EC).toBe(-1);
  });

  test('POST /api/hooks/payment - non-existent bill id returns error', async () => {
    const webhookPayload = {
      gateway: 'TestBank',
      accountNumber: '000111222',
      transferAmount: 50,
      description: `Payment Invoice-9999`,
      transferType: 'in'
    };

    const webhookRes = await request(app).post('/api/hooks/payment').send(webhookPayload);
    expect(webhookRes.statusCode).toBe(200);
    expect(webhookRes.body.EC).toBe(-1);
  });

  test('POST /api/hooks/payment - valid in transfer updates bill and decrements stock', async () => {
    // Create a bill
    const res = await request(app)
      .post('/api/bill/create')
      .set('Cookie', [customerCookie])
      .send({
        userId: customerId,
        time: new Date().toISOString(),
        amount: 50,
        type: 'RECEIVED',
        colorSizeData: [
          {
            colorSizeId: colorSizeId,
            total: 2
          }
        ]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.EC).toBe(0);

    const getBillsRes = await request(app)
      .get('/api/bill/get?type=PAGINATION&page=0&pageSize=10')
      .set('Cookie', [customerCookie]);

    createdBillId = getBillsRes.body.DT.data[0].id;
    // verify shopping cart exists
    const cartsAfterCreate = await db.ShoppingCart.findAll({ where: { billId: createdBillId } });
    expect(cartsAfterCreate.length).toBeGreaterThan(0);
    // Call webhook with description that includes bill id e.g., 'Invoice-<id>'
    const webhookPayload = {
      gateway: 'TestBank',
      accountNumber: '000111222',
      transferAmount: 50,
      description: `Payment Invoice-${createdBillId}`,
      transferType: 'in'
    };

    const webhookRes = await request(app).post('/api/hooks/payment').send(webhookPayload);
    expect(webhookRes.statusCode).toBe(200);
    expect(webhookRes.body.EC).toBe(0);

    // Check bill status
    const getBillById = await db.Bill.findOne({ where: { id: createdBillId }, include: db.ShoppingCart });
    expect(getBillById.status).toBe('Done');

    // Check color size stock decreased
    const colorSize = await db.Color_Size.findOne({ where: { id: colorSizeId } });
    expect(+colorSize.stock).toBe(8);
  });

  test('POST /api/hooks/payment - duplicate in transfer is idempotent and does not double-decrement', async () => {
    const webhookPayload = {
      gateway: 'TestBank',
      accountNumber: '000111222',
      transferAmount: 50,
      description: `Payment Invoice-${createdBillId}`,
      transferType: 'in'
    };

    const webhookRes = await request(app).post('/api/hooks/payment').send(webhookPayload);
    expect(webhookRes.statusCode).toBe(200);
    expect(webhookRes.body.EC).toBe(0);

    // Check that stock did not decrease again
    const colorSize = await db.Color_Size.findOne({ where: { id: colorSizeId } });
    expect(+colorSize.stock).toBe(8);
  });
});
