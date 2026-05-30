const request = require('supertest');
const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Test routes using the middleware
app.get('/api/test/protect', protect, (req, res) => {
  res.status(200).json({ message: 'Success', user: req.user });
});

app.get('/api/test/admin', protect, admin, (req, res) => {
  res.status(200).json({ message: 'Admin Success' });
});

describe('Auth Middleware', () => {
  let token;
  let adminToken;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Regular User',
      email: 'regular@example.com',
      password: 'password'
    });
    token = jwt.sign({ id: user._id }, 'testsecret123');

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: 'admin'
    });
    adminToken = jwt.sign({ id: adminUser._id }, 'testsecret123');
  });

  describe('protect middleware', () => {
    it('should block access without token', async () => {
      const res = await request(app).get('/api/test/protect');
      expect(res.statusCode).toEqual(401);
    });

    it('should grant access with valid token', async () => {
      const res = await request(app)
        .get('/api/test/protect')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty('email', 'regular@example.com');
    });
  });

  describe('admin middleware', () => {
    it('should block regular users from admin routes', async () => {
      const res = await request(app)
        .get('/api/test/admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should allow admins on admin routes', async () => {
      const res = await request(app)
        .get('/api/test/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
