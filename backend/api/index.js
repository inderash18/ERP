import 'dotenv/config';
import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

import mongoose from 'mongoose';
import app from '../src/app.js';

const MONGODB_URI = process.env.MONGODB_URI;

// Cached database connection across serverless invocations
let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined in environment variables');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Serverless MongoDB connected');
  } catch (err) {
    console.error('Serverless MongoDB connection error:', err);
  }
}

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
