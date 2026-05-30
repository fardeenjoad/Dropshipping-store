require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const res = await Product.deleteMany({ supplierProductId: { $exists: false } });
    console.log('Deleted:', res.deletedCount);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
