const request = require('supertest');
const app = require('../index');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Product Endpoints', () => {
  let adminToken;
  let regularToken;
  let productId;

  beforeEach(async () => {
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = jwt.sign({ id: adminUser._id }, 'testsecret123');

    const regularUser = await User.create({
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
      role: 'customer'
    });
    regularToken = jwt.sign({ id: regularUser._id }, 'testsecret123');

    const product = await Product.create({
      name: 'Test Product',
      description: 'A great product',
      price: 19.99,
      costPrice: 5.00,
      category: 'Electronics',
      images: ['image1.png'],
      stock: 10
    });
    productId = product._id;
  });

  describe('GET /api/products', () => {
    it('should fetch all products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.products)).toBeTruthy();
      expect(res.body.products.length).toBe(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should fetch a single product by ID', async () => {
      const res = await request(app).get(`/api/products/${productId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Test Product');
    });

    it('should return 404 for invalid product ID', async () => {
      const res = await request(app).get('/api/products/123456789012345678901234');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product if admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          description: 'Desc',
          price: 10,
          category: 'Toys',
          images: ['toy.png'],
          stock: 5
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'New Product');
    });

    it('should fail to create product if not admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Fake' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product if admin', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          price: 25.99
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Updated Name');
      expect(res.body).toHaveProperty('price', 25.99);
    });

    it('should fail to update product if not admin', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Hack Name' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product if admin', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product removed');

      // Double check it's gone
      const checkRes = await request(app).get(`/api/products/${productId}`);
      expect(checkRes.statusCode).toEqual(404);
    });

    it('should fail to delete product if not admin', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});
