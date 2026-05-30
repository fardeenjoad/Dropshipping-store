const request = require('supertest');
const app = require('../index');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

describe('Cart Endpoints', () => {
  let userToken;
  let productId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'User',
      email: 'user@example.com',
      password: 'password123'
    });
    userToken = jwt.sign({ id: user._id }, 'testsecret123');

    const product = await Product.create({
      name: 'Test Product',
      description: 'A great product',
      price: 19.99,
      category: 'Electronics',
      images: ['image1.png']
    });
    productId = product._id;
  });

  describe('GET /api/cart', () => {
    it('should return empty cart if none exists', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBe(0);
    });
  });

  describe('POST /api/cart/add', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 2,
          price: 19.99
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0].quantity).toBe(2);
    });
  });
});
