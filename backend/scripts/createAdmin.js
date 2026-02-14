#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required in .env or environment');
  process.exit(1);
}

async function run() {
  const [,, emailArg, passwordArg, nameArg] = process.argv;
  const email = emailArg || process.env.ADMIN_EMAIL;
  const password = passwordArg || process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = nameArg || 'Admin';

  if (!email) {
    console.error('Usage: node createAdmin.js <email> [password] [name]');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, { dbName: process.env.DB_NAME || undefined });
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists:', email);
      process.exit(0);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: 'admin', rate: 0, otRate: 0 });
    console.log('Created admin user:', { id: user._id.toString(), email: user.email, name: user.name });
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user', err);
    process.exit(2);
  }
}

run();
