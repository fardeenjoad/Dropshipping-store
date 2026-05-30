const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, costPrice, category, images, stock } = req.body;

    const product = new Product({
      name: name || 'Sample name',
      description: description || 'Sample description',
      price: price || 0,
      costPrice: costPrice || 0,
      category: category || 'Sample category',
      images: images || ['/images/sample.jpg'],
      stock: stock || 0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, costPrice, category, images, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
      product.category = category || product.category;
      product.images = images || product.images;

      if (stock !== undefined) {
        product.stock = stock;

        // If all variants have 0 stock (e.g. CJ import), distribute the new stock
        // evenly across variants so they no longer show as out of stock
        if (product.variants && product.variants.length > 0) {
          const allVariantsEmpty = product.variants.every(v => !v.stock || v.stock === 0);
          if (allVariantsEmpty && stock > 0) {
            const perVariantStock = Math.ceil(stock / product.variants.length);
            product.variants = product.variants.map(v => ({
              ...v.toObject(),
              stock: perVariantStock
            }));
          }
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
