import { connectDB } from '../src/config/database.js';
import mongoose from 'mongoose';

async function run() {
  await connectDB();
  await mongoose.disconnect();
}

run();
