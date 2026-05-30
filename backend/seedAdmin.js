require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const mongoose = require('mongoose');

const seedAdmin = async () => {
  try {
    // 1. Connect to database
    await connectDB();

    const email = 'admin@dropzone.com';
    const password = 'adminpassword123';
    const name = 'Admin User';
    const role = 'admin';

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      console.log(`User ${email} already exists. Updating role and password...`);
      user.password = password;
      user.role = role;
      user.name = name;
      await user.save();
    } else {
      console.log(`User ${email} does not exist. Creating new admin user...`);
      user = await User.create({
        name,
        email,
        password,
        role
      });
    }

    console.log(`Admin user successfully seeded!`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${user.role}`);

    // 3. Exit successfully
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding admin user failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
