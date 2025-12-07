/**
 * Script to reset admin password
 * Usage: node reset-admin-password.js <username> <newPassword>
 * Example: node reset-admin-password.js admin NewPassword123!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function resetPassword() {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error('Usage: node reset-admin-password.js <username> <newPassword>');
    console.error('Example: node reset-admin-password.js admin NewPassword123!');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find admin
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    
    if (!admin) {
      console.error(`Admin with username "${username}" not found!`);
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    admin.password = hashedPassword;
    admin.passwordChangedAt = new Date();
    admin.isLocked = false;
    admin.failedLoginAttempts = {
      count: 0,
      lastAttempt: null,
      lockedUntil: null
    };
    
    await admin.save();
    
    console.log(`✅ Password reset successfully for admin: ${username}`);
    console.log(`New password: ${newPassword}`);
    console.log('You can now login with the new password.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

resetPassword();

