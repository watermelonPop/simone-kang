const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDB() {
  if (cachedDb && cachedClient) return { db: cachedDb, client: cachedClient };

  const uri = process.env.MONGO_URI;
  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  cachedDb = cachedClient.db("portfolio-database");
  return { db: cachedDb, client: cachedClient };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing search query parameter 'q'" });

  try {
    const { db } = await connectToDB();
    const collection = db.collection("Projects");
    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { desc: { $regex: q, $options: 'i' } },
        { language: { $regex: q, $options: 'i' } },
        { framework: { $regex: q, $options: 'i' } },
      ]
    };
    const results = await collection.find(query).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};
