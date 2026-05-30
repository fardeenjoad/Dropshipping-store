const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();
const connectDB = require('./config/db');
const Order = require('./models/Order');

// Connect to database (skip in test — setup.js handles in-memory DB)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cj', require('./routes/cjRoutes'));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order API
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    const options = {
      amount: Math.round(amount * 100), // ensure integer paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // auto-capture payment
      notes: {
        mode: "test",
        origin: "trend-mart-store"
      }
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment & Save Order to MongoDB
app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Save order to MongoDB
      const order = new Order({
        user: orderDetails.userId,
        items: orderDetails.items,
        shippingAddress: orderDetails.shippingAddress,
        paymentMethod: 'Razorpay',
        paymentResult: {
          id: razorpay_payment_id,
          status: 'paid',
          email: orderDetails.email,
        },
        totalPrice: orderDetails.total,
        paidAt: Date.now(),
        status: 'pending',
      });

      const savedOrder = await order.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified and order saved',
        orderId: savedOrder._id,
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  const { startTrackingSyncJob } = require('./services/cronService');
  startTrackingSyncJob(60000); // Run sync check every 60 seconds

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
