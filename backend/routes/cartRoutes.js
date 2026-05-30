const express = require('express');
const router = express.Router();
const { getUserCart, addToCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getUserCart);

router.route('/add')
  .post(protect, addToCart);

module.exports = router;
