import mongoose from 'mongoose';
import { CatalogProduct } from './src/models';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL as string);
  const sample = await CatalogProduct.findOne();
  console.log('Sample stock:', sample?.cachedAvailableStock);
  process.exit(0);
}

run().catch(console.error);