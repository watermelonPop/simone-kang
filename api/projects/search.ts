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
  const q = req.query.q as string;
  if (!q) return res.status(400).json({ error: "Missing query param 'q'" });
  try {
    const db = await connectToDB();
    const results = await db.collection('New-Projects').find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { desc: { $regex: q, $options: 'i' } },
        { front_end: { $elemMatch: { $regex: q, $options: 'i' } } },
        { back_end: { $elemMatch: { $regex: q, $options: 'i' } } },
      ]
    }).toArray();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
}