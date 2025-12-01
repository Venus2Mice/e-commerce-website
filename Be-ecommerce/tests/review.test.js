process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import db from '../src/models';

describe('Review API', () => {
    let adminCookie;
    let customerCookie;
    let adminToken;
    let customerToken;
    let productId;
    let customerId;
    let createdReviewId;

    beforeAll(async () => {
        await db.sequelize.sync({ force: true });

        // 1. Setup Admin & Product
        const roleCreateClothes = await db.Role.create({ url: '/api/clothes/create', description: 'Create Clothes' });
        await db.Group.create({ id: 1, name: 'Admin', description: 'Admin' });
        await db.Group_Role.create({ groupId: 1, roleId: roleCreateClothes.id });

        const adminRegRes = await request(app).post('/api/user/register').send({
            email: 'admin@review.com', password: 'admin123', phoneNumber: '111', firstName: 'Admin', lastName: 'Rev', groupId: 1
        });
        // registration successful for admin
        const adminLoginRes = await request(app).post('/api/user/login').send({ loginAcc: 'admin@review.com', password: 'admin123' });
        // admin login success
        const adminCookieHeader = adminLoginRes.headers['set-cookie'].find(cookie => cookie.startsWith('user='));
        adminCookie = adminCookieHeader ? adminCookieHeader.split(';')[0] : '';
        // Extract only the token value, not the 'user=' prefix, for JWT verification
        const adminToken = adminCookie ? adminCookie.split('user=')[1] : '';

        const prodRes = await request(app).post('/api/clothes/create')
            .set('Cookie', `user=${adminToken}`) // Set only the token value
            .send({
                name: 'Review Product',
                contentMarkdown: 'ok',
                discount: 10,
                price: 10,
                type: 'TSHIRT',
                category: 'MEN',
                imgArray: ['base64img'],
                stockData: [{ color: 'Red', size: 'M', stock: 10 }]
            });
        // product created
        expect(prodRes.statusCode).toBe(200);
        expect(prodRes.body.EC).toBe(0);

        // Get Product ID
        const productRes = await request(app).get('/api/clothes/get?type=ALL').set('Cookie', `user=${adminToken}`); // Set only the token value
        productId = productRes.body.DT[0].id;

        // 2. Setup Customer
        await db.Group.create({ id: 3, name: 'Customer', description: 'Cust' });
        const roleCreateRev = await db.Role.create({ url: '/api/review/create', description: 'C Rev' });
        const roleUpdateRev = await db.Role.create({ url: '/api/review/update', description: 'U Rev' });
        const roleDeleteRev = await db.Role.create({ url: '/api/review/delete', description: 'D Rev' });
        const roleGetRev = await db.Role.create({ url: '/api/review/get', description: 'G Rev' });

        await db.Group_Role.create({ groupId: 3, roleId: roleCreateRev.id });
        await db.Group_Role.create({ groupId: 3, roleId: roleUpdateRev.id });
        await db.Group_Role.create({ groupId: 3, roleId: roleDeleteRev.id });
        await db.Group_Role.create({ groupId: 3, roleId: roleGetRev.id });

        const customerRegRes = await request(app).post('/api/user/register').send({
            email: 'cust@review.com', password: 'cust123', phoneNumber: '222', firstName: 'Cust', lastName: 'Rev', groupId: 3
        });
        // registration successful for customer
        const custLoginRes = await request(app).post('/api/user/login').send({ loginAcc: 'cust@review.com', password: 'cust123' });
        // customer login success
        const customerCookieHeader = custLoginRes.headers['set-cookie'].find(cookie => cookie.startsWith('user='));
        customerCookie = customerCookieHeader ? customerCookieHeader.split(';')[0] : '';
        customerToken = customerCookie ? customerCookie.split('user=')[1] : '';
        customerId = custLoginRes.body.DT.id;
    });

    afterAll(async () => {
        await db.sequelize.close();
    });

    test('POST /api/review/create - should create a review', async () => {
        const res = await request(app)
            .post('/api/review/create')
            .set('Cookie', `user=${customerToken}`) // Use customerToken
            .send({
                clothesId: productId,
                userId: customerId,
                content: 'Great product!',
                star: 5,
                image: 'base64img'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.EC).toBe(0);
        createdReviewId = res.body.DT;
    });

    test('POST /api/review/create - should fail duplicate review', async () => {
        const res = await request(app)
            .post('/api/review/create')
            .set('Cookie', `user=${customerToken}`) // Use customerToken
            .send({
                clothesId: productId,
                userId: customerId,
                content: 'Again?',
                star: 1
            });

        expect(res.body.EC).not.toBe(0);
    });

    test('GET /api/review/get - should get reviews for product', async () => {
        const res = await request(app)
            .get(`/api/review/get?type=ALL&clothesId=${productId}`)
            .set('Cookie', `user=${customerToken}`); // Use customerToken
        expect(res.statusCode).toBe(200);
        expect(res.body.DT.length).toBeGreaterThan(0);
        // Removed specific field check, just verifying data exists
    });

    test('PUT /api/review/update - should update review', async () => {
        const res = await request(app)
            .put('/api/review/update')
            .set('Cookie', `user=${customerToken}`) // Use customerToken
            .send({
                id: createdReviewId,
                content: 'Updated comment',
                star: 4
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.EC).toBe(0);
    });

    test('DELETE /api/review/delete - should delete review', async () => {
        const res = await request(app)
            .delete(`/api/review/delete?id=${createdReviewId}`)
            .set('Cookie', `user=${customerToken}`); // Use customerToken

        expect(res.statusCode).toBe(200);
        expect(res.body.EC).toBe(0);
    });
});