import { existsSync } from 'node:fs';
import mongoose from 'mongoose';

if (existsSync('.env')) process.loadEnvFile('.env');

export async function conectarBaseDeDatos() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI en el archivo .env');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('Conectado a MongoDB');
}