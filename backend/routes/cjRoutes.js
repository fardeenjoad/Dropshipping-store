const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getProductDetails, getProductVideos, getAccessToken } = require('../services/cjService');
const Product = require('../models/Product');

/**
 * @desc    Fetch product details from CJ Dropshipping
 * @route   GET /api/cj/product/:id
 * @access  Private/Admin
 */
router.get('/product/:id', protect, admin, async (req, res) => {
  try {
    const details = await getProductDetails(req.params.id);
    if (!details) {
      return res.status(404).json({ message: 'CJ Product not found' });
    }
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Import product from CJ Dropshipping to local MongoDB
 * @route   POST /api/cj/import
 * @access  Private/Admin
 */
router.post('/import', protect, admin, async (req, res) => {
  try {
    const { cjProductId, priceMultiplier = 1.5 } = req.body;

    if (!cjProductId) {
      return res.status(400).json({ message: 'CJ Product ID is required' });
    }

    // 1. Fetch details from CJ
    const cjProduct = await getProductDetails(cjProductId);
    if (!cjProduct) {
      return res.status(404).json({ message: 'CJ Product details could not be retrieved' });
    }

    // 2. Check if product already imported
    const exists = await Product.findOne({ supplierProductId: cjProductId });
    if (exists) {
      return res.status(400).json({ message: 'Product already imported' });
    }

    // 3. Map variants
    const mappedVariants = cjProduct.variants ? cjProduct.variants.map(v => {
      // If variantPrice is in USD (e.g. less than 100), convert to INR roughly (1 USD = 80 INR)
      const rawPrice = v.variantPrice || v.variantSellPrice || 0;
      const supplierInrPrice = rawPrice < 100 ? rawPrice * 80 : rawPrice;
      const localSellPrice = Math.round(supplierInrPrice * priceMultiplier);

      return {
        sku: v.variantSku || v.vid,
        color: v.color || '',
        size: v.size || '',
        price: localSellPrice,
        stock: v.stock || 0,
        image: v.variantImage || cjProduct.productImage
      };
    }) : [];

    // 4. Calculate overall prices & stock
    const basePrice = mappedVariants.length > 0 
      ? Math.min(...mappedVariants.map(v => v.price))
      : Math.round(((cjProduct.price || 0) < 100 ? (cjProduct.price || 0) * 80 : (cjProduct.price || 0)) * priceMultiplier);

    const costPrice = cjProduct.variants && cjProduct.variants.length > 0
      ? Math.min(...cjProduct.variants.map(v => {
          const p = v.variantPrice || v.variantSellPrice || 0;
          return p < 100 ? p * 80 : p;
        }))
      : ((cjProduct.price || 0) < 100 ? (cjProduct.price || 0) * 80 : (cjProduct.price || 0));

    const totalStock = mappedVariants.length > 0
      ? mappedVariants.reduce((sum, v) => sum + v.stock, 0)
      : cjProduct.stock || 0;

    // 5. Create new Product model instance
    const videoUrl = cjProduct.productVideo && cjProduct.productVideo.length > 0
      ? cjProduct.productVideo[0]
      : '';

    const product = new Product({
      name: cjProduct.productName || cjProduct.productNameEn || 'CJ Imported Product',
      description: cjProduct.description || 'No description provided.',
      price: basePrice,
      costPrice: costPrice,
      category: cjProduct.categoryName || 'General',
      images: cjProduct.productGallery && cjProduct.productGallery.length > 0
        ? cjProduct.productGallery
        : [cjProduct.productImage || '/product-1.png'],
      video: videoUrl,
      stock: totalStock,
      supplierProductId: cjProduct.pid,
      variants: mappedVariants,
      isActive: true
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: 'Product successfully imported from CJ Dropshipping',
      product: savedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Sync missing video URLs for all CJ-imported products
 * @route   POST /api/cj/sync-videos
 * @access  Private/Admin
 */
router.post('/sync-videos', protect, admin, async (req, res) => {
  try {
    const token = await getAccessToken();
    if (!token) {
      return res.status(400).json({ message: 'CJ API not configured — cannot sync videos in mock mode.' });
    }

    // Find all CJ-imported products missing a video URL
    const products = await Product.find({
      supplierProductId: { $exists: true, $ne: null },
      $or: [{ video: { $exists: false } }, { video: '' }, { video: null }]
    });

    if (products.length === 0) {
      return res.json({ message: 'All CJ products already have video URLs.', updated: 0 });
    }

    let updatedCount = 0;
    const results = [];

    for (const product of products) {
      try {
        const videos = await getProductVideos(product.supplierProductId, token);
        if (videos && videos.length > 0) {
          product.video = videos[0];
          await product.save();
          updatedCount++;
          results.push({ name: product.name, video: videos[0] });
        }
      } catch (err) {
        console.error(`Failed to sync video for ${product.name}:`, err.message);
      }
    }

    res.json({
      message: `Synced videos for ${updatedCount} of ${products.length} products.`,
      updated: updatedCount,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
