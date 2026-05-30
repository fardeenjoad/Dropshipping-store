const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  forwardToSupplier,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Customer routes
router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.route('/my').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/forward').post(protect, admin, forwardToSupplier);

module.exports = router;
