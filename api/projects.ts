import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function connectToDB() {
  if (cachedClient) return cachedClient.db('portfolio-database');
  cachedClient = new MongoClient(process.env.MONGO_URI!);
  await cachedClient.connect();
  return cachedClient.db('portfolio-database');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const db = await connectToDB();
    const projects = await db.collection('New-Projects').find({}).toArray();
    res.status(200).json(projects);
  } catch (err) {
    console.error("DB connection error:", err);  // ← add this
    res.status(500).json({ error: String(err) }); // ← return actual error temporarily
  }
}