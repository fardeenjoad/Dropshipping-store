const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

describe('Order Endpoints', () => {
  let customerToken;
  let adminToken;
  let customerId;
  let productId;

  beforeEach(async () => {
    const customer = await User.create({
      name: 'Customer',
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer'
    });
    customerId = customer._id;
    customerToken = jwt.sign({ id: customer._id }, 'testsecret123');

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = jwt.sign({ id: admin._id }, 'testsecret123');

    const product = await Product.create({
      name: 'Test Product',
      description: 'Desc',
      price: 500,
      costPrice: 100,
      category: 'Electronics',
      images: ['img.png'],
      stock: 10
    });
    productId = product._id;
  });

  describe('POST /api/orders', () => {
    it('should create a new order for a logged-in customer', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ product: productId, name: 'Test Product', image: 'img.png', price: 500, quantity: 2 }],
          shippingAddress: { street: '123 St', city: 'Mumbai', state: 'MH', pincode: '400001', country: 'India' },
          paymentMethod: 'Razorpay',
          totalPrice: 1000,
          paymentResult: { id: 'pay_test123', status: 'paid', email: 'customer@example.com' }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.status).toBe('pending');
      expect(res.body.items.length).toBe(1);
    });

    it('should reject order creation without auth', async () => {
      const res = await request(app).post('/api/orders').send({});
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/orders/my', () => {
    it('should return orders only for logged-in customer', async () => {
      await Order.create({
        user: customerId,
        items: [{ product: productId, name: 'Test', image: 'img.png', price: 500, quantity: 1 }],
        shippingAddress: { street: '123 St', city: 'Mumbai', state: 'MH', pincode: '400001', country: 'India' },
        paymentMethod: 'Razorpay',
        totalPrice: 500
      });

      const res = await request(app)
        .get('/api/orders/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /api/orders (Admin)', () => {
    it('should return all orders for admin', async () => {
      await Order.create({
        user: customerId,
        items: [{ product: productId, name: 'Test', image: 'img.png', price: 500, quantity: 1 }],
        shippingAddress: { street: '123 St', city: 'Mumbai', state: 'MH', pincode: '400001', country: 'India' },
        paymentMethod: 'Razorpay',
        totalPrice: 500
      });

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should block non-admin from admin order list', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.statusCode).toEqual(403);
    });
  });
});
