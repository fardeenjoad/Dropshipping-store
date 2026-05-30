// Set env vars BEFORE any module imports happen
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret123';
process.env.RAZORPAY_KEY_ID = 'test_key';
process.env.RAZORPAY_KEY_SECRET = 'test_secret';
