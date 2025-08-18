const clientPromise = require('../../lib/mongodb'); // adjust path if needed

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('portfolio-database');
    const collection = db.collection('Projects');
    const projects = await collection.find({}).toArray();
    res.status(200).json(projects);
  } catch (err) {
    console.error('Projects fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};
