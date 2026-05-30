const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/video-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('URL query parameter is required');
  }
  try {
    const videoResponse = await fetch(url, {
      headers: {
        'Referer': 'https://developers.cjdropshipping.com/'
      }
    });

    if (!videoResponse.ok) {
      return res.status(videoResponse.status).send('Failed to fetch video from supplier');
    }

    const contentType = videoResponse.headers.get('content-type');
    const contentLength = videoResponse.headers.get('content-length');
    
    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    
    const { Readable } = require('stream');
    Readable.fromWeb(videoResponse.body).pipe(res);
  } catch (error) {
    console.error('Video proxy error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
