/**
 * Script to view all admin accounts in the database
 * Usage: node view-admins.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function viewAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB\n');

    // Find all admins
    const admins = await Admin.find({}).select('username createdAt lastLogin isLocked failedLoginAttempts');
    
    if (admins.length === 0) {
      console.log('No admin accounts found in the database.');
      process.exit(0);
    }

    console.log(`Found ${admins.length} admin account(s):\n`);
    console.log('='.repeat(60));
    
    admins.forEach((admin, index) => {
      console.log(`\nAdmin #${index + 1}:`);
      console.log(`  Username: ${admin.username}`);
      console.log(`  Created: ${admin.createdAt.toLocaleString()}`);
      console.log(`  Account Locked: ${admin.isLocked ? 'Yes' : 'No'}`);
      
      if (admin.failedLoginAttempts && admin.failedLoginAttempts.count > 0) {
        console.log(`  Failed Login Attempts: ${admin.failedLoginAttempts.count}`);
        if (admin.failedLoginAttempts.lockedUntil) {
          const lockoutTime = new Date(admin.failedLoginAttempts.lockedUntil);
          if (lockoutTime > new Date()) {
            console.log(`  Locked Until: ${lockoutTime.toLocaleString()}`);
          }
        }
      }
      
      if (admin.lastLogin && admin.lastLogin.timestamp) {
        console.log(`  Last Login: ${new Date(admin.lastLogin.timestamp).toLocaleString()}`);
        if (admin.lastLogin.ip) {
          console.log(`  Last Login IP: ${admin.lastLogin.ip}`);
        }
      } else {
        console.log(`  Last Login: Never`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\nNote: Passwords are hashed and cannot be viewed.');
    console.log('To reset a password, use: node reset-admin-password.js <username> <newPassword>');
    
    process.exit(0);
  } catch (error) {
    console.error('Error viewing admins:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

viewAdmins();

