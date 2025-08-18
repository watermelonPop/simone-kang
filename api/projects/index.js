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

  try {
    const { db } = await connectToDB();
    const collection = db.collection("Projects");
    const projects = await collection.find({}).toArray();
    res.status(200).json(projects);
  } catch (err) {
    console.error("Projects fetch error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};
