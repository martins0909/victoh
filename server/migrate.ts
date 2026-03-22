import mongoose from 'mongoose';
import { CatalogProduct } from './src/models';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL as string);
  const products = await CatalogProduct.find();
  for (const p of products) {
    const unused = p.serialNumbers ? p.serialNumbers.filter((s: any) => !s.isUsed).length : 0;
    p.cachedAvailableStock = unused;
    await p.save();
  }
  console.log('Migration complete');
  process.exit(0);
}

run().catch(console.error);