const Cart = require('../models/Cart');

const getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = { items: [] };
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, price } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      // Check if item exists in cart
      const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

      if (itemIndex > -1) {
        let productItem = cart.items[itemIndex];
        productItem.quantity += quantity;
        cart.items[itemIndex] = productItem;
      } else {
        cart.items.push({ product: productId, quantity, price });
      }
      cart = await cart.save();
      return res.json(cart);
    } else {
      // Create new cart
      const newCart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity, price }]
      });
      return res.json(newCart);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserCart, addToCart };
