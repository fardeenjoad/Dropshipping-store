const Order = require('../models/Order');
const { createCJOrder } = require('../services/cjService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentResult,
      totalPrice,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      paymentResult,
      totalPrice,
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID, tracking number, or supplier order ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    let order = null;

    // Check if it looks like a MongoDB ObjectId (24 hex chars)
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;

    if (isObjectId) {
      order = await Order.findById(id).populate('user', 'name email');
    } else if (id.startsWith('TM-')) {
      // The frontend generates TM-XXXXX by taking the last few characters of the ObjectId.
      // E.g., TM-07CFA corresponds to an _id ending in "07cfa"
      const partialId = id.replace('TM-', '').toLowerCase();
      const orders = await Order.aggregate([
        { $addFields: { idString: { $toString: "$_id" } } },
        { $match: { idString: { $regex: `${partialId}$`, $options: 'i' } } }
      ]);
      
      if (orders.length > 0) {
        order = await Order.findById(orders[0]._id).populate('user', 'name email');
      }
    }

    // If not found by _id or TM- partial ID, try trackingNumber or supplierOrderId
    if (!order) {
      order = await Order.findOne({
        $or: [
          { trackingNumber: id },
          { supplierOrderId: id }
        ]
      }).populate('user', 'name email');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your Order ID or Tracking Number.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status || order.status;

    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }
    if (req.body.status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forward order to supplier (CJ Dropshipping)
// @route   POST /api/orders/:id/forward
// @access  Private/Admin
const forwardToSupplier = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.forwardedToSupplier) {
      return res.status(400).json({ message: 'Order already forwarded to supplier' });
    }

    // Integrate CJ Dropshipping Order Creation
    const cjResponse = await createCJOrder(order);
    order.supplierOrderId = cjResponse.cjOrderId;

    order.forwardedToSupplier = true;
    order.status = 'processing';
    const updatedOrder = await order.save();

    res.json({ message: cjResponse.message || 'Order forwarded to CJ Dropshipping', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  forwardToSupplier,
};
