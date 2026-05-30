process.env.CJ_API_KEY = 'cj_mock_api_key_for_testing';
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { runTrackingSync } = require('../services/cronService');

describe('Order Tracking Synchronizer Service', () => {
  let customerUser;
  let testProduct;

  beforeEach(async () => {
    // Clear collections
    await Order.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create a customer
    customerUser = await User.create({
      name: 'Test Customer',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create a product
    testProduct = await Product.create({
      name: 'Luxury Watch',
      description: 'A luxurious watch',
      price: 2000,
      costPrice: 800,
      category: 'Jewelry',
      images: ['watch.png'],
      stock: 50
    });
  });

  it('should synchronize order tracking number and mark status as shipped', async () => {
    // 1. Create a processing, forwarded order
    const order = await Order.create({
      user: customerUser._id,
      items: [{
        product: testProduct._id,
        name: testProduct.name,
        image: testProduct.images[0],
        price: testProduct.price,
        quantity: 1,
        variantSku: 'WATCH-MOCK-SKU'
      }],
      shippingAddress: {
        street: '123 Test St',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      paymentMethod: 'Razorpay',
      totalPrice: 2000,
      status: 'processing',
      forwardedToSupplier: true,
      supplierOrderId: 'CJ_MOCK_ORDER123'
    });

    expect(order.trackingNumber).toBeUndefined();
    expect(order.status).toEqual('processing');

    // 2. Trigger sync job
    await runTrackingSync();

    // 3. Assert changes in database
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.trackingNumber).toBeDefined();
    expect(updatedOrder.trackingNumber).toContain('TRK');
    expect(updatedOrder.status).toEqual('shipped');
  });

  it('should ignore already shipped or unforwarded orders', async () => {
    // Order already shipped
    const shippedOrder = await Order.create({
      user: customerUser._id,
      items: [{
        product: testProduct._id,
        name: testProduct.name,
        image: testProduct.images[0],
        price: testProduct.price,
        quantity: 1
      }],
      shippingAddress: { street: '1 St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
      paymentMethod: 'Razorpay',
      totalPrice: 2000,
      status: 'shipped',
      forwardedToSupplier: true,
      supplierOrderId: 'CJ_MOCK_ORDER456',
      trackingNumber: 'TRK_EXISTS_999'
    });

    // Order not forwarded to supplier
    const pendingOrder = await Order.create({
      user: customerUser._id,
      items: [{
        product: testProduct._id,
        name: testProduct.name,
        image: testProduct.images[0],
        price: testProduct.price,
        quantity: 1
      }],
      shippingAddress: { street: '1 St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
      paymentMethod: 'Razorpay',
      totalPrice: 2000,
      status: 'pending',
      forwardedToSupplier: false
    });

    await runTrackingSync();

    const checkShipped = await Order.findById(shippedOrder._id);
    expect(checkShipped.trackingNumber).toEqual('TRK_EXISTS_999');

    const checkPending = await Order.findById(pendingOrder._id);
    expect(checkPending.trackingNumber).toBeUndefined();
    expect(checkPending.status).toEqual('pending');
  });
});
