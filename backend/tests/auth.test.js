const request = require('supertest');
const app = require('../index');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('name', 'Test User');
      expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
      
      const userInDb = await User.findOne({ email: 'testuser@example.com' });
      expect(userInDb).toBeTruthy();
    });

    it('should fail if email is already taken', async () => {
      // Create user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      // Create user first
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('should fail with invalid credentials', async () => {
      // Create user first
      await User.create({
        name: 'Login User',
        email: 'loginfail@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginfail@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});
