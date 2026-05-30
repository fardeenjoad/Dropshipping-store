process.env.CJ_API_KEY = 'cj_mock_api_key_for_testing';
const request = require('supertest');
const app = require('../index');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('CJ Dropshipping Import Endpoints', () => {
  let adminToken;
  let regularToken;

  beforeEach(async () => {
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin-cj@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = jwt.sign({ id: adminUser._id }, 'testsecret123');

    // Create regular user
    const regularUser = await User.create({
      name: 'Regular Customer',
      email: 'customer-cj@example.com',
      password: 'password123',
      role: 'customer'
    });
    regularToken = jwt.sign({ id: regularUser._id }, 'testsecret123');
  });

  describe('GET /api/cj/product/:id', () => {
    it('should block non-logged in or non-admin users', async () => {
      // No token
      let res = await request(app).get('/api/cj/product/CJ_TEST_123');
      expect(res.statusCode).toEqual(401);

      // Customer token
      res = await request(app)
        .get('/api/cj/product/CJ_TEST_123')
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should fetch cj product details for admin', async () => {
      const res = await request(app)
        .get('/api/cj/product/CJ_TEST_123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('pid', 'CJ_TEST_123');
      expect(res.body).toHaveProperty('productName');
      expect(Array.isArray(res.body.variants)).toBeTruthy();
    });
  });

  describe('POST /api/cj/import', () => {
    it('should block non-admin users from importing', async () => {
      const res = await request(app)
        .post('/api/cj/import')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ cjProductId: 'CJ_TEST_123' });
      expect(res.statusCode).toEqual(403);
    });

    it('should successfully import product and map variants with default multiplier', async () => {
      const res = await request(app)
        .post('/api/cj/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cjProductId: 'CJ_TEST_123' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('successfully imported');
      expect(res.body.product).toHaveProperty('supplierProductId', 'CJ_TEST_123');
      expect(res.body.product.variants.length).toBeGreaterThan(0);

      // Verify variant pricing multiplier logic (default 1.5)
      // Mock black variant price is 1200 * 1.5 = 1800
      const variants = res.body.product.variants;
      const blackVariant = variants.find(v => v.color === 'Black');
      expect(blackVariant).toBeDefined();
      expect(blackVariant.price).toEqual(1800); // 1200 INR base * 1.5

      // Verify product saved in database
      const dbProduct = await Product.findOne({ supplierProductId: 'CJ_TEST_123' });
      expect(dbProduct).toBeDefined();
      expect(dbProduct.name).toContain('CJ Premium Smart Watch');
    });

    it('should respect custom price multiplier', async () => {
      const res = await request(app)
        .post('/api/cj/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cjProductId: 'CJ_TEST_456', priceMultiplier: 2.0 });

      expect(res.statusCode).toEqual(201);
      const variants = res.body.product.variants;
      const blackVariant = variants.find(v => v.color === 'Black');
      expect(blackVariant.price).toEqual(2400); // 1200 * 2.0
    });

    it('should prevent importing the same product twice', async () => {
      // First import
      await request(app)
        .post('/api/cj/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cjProductId: 'CJ_TEST_789' });

      // Second import
      const res = await request(app)
        .post('/api/cj/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cjProductId: 'CJ_TEST_789' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('already imported');
    });
  });
});
