const { MongoClient } = require('mongodb');
const SpotifWebAPI = require("spotify-web-api-node");
console.log("TOP OF SERVER");

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
  const { url, method, body } = req;

  // 🌐 Spotify Setup
  const spotifyApi = new SpotifWebAPI({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  });

  // 🎧 Login Handler
  if (url === '/api/login' && method === 'POST') {
    try {
      const data = await spotifyApi.authorizationCodeGrant(body.code);
      res.status(200).json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(400).json({ error: "Login failed" });
    }
  }

  // 🔄 Refresh Token
  else if (url === '/api/refresh' && method === 'POST') {
    try {
      spotifyApi.setRefreshToken(body.refreshToken);
      const data = await spotifyApi.refreshAccessToken();
      res.status(200).json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    } catch (err) {
      console.error("Refresh error:", err);
      res.status(400).json({ error: "Refresh failed" });
    }
  }

  // 👤 Guest Token
  else if (url === '/api/guest-token' && method === 'GET') {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      res.status(200).json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    } catch (err) {
      console.error("Guest token error:", err);
      res.status(500).json({ error: 'Failed to get guest token' });
    }
  }

  // 📦 Get Projects
  else if (url === '/api/projects' && method === 'GET') {
    try {
      const { db } = await connectToDB();
      const collection = db.collection("Projects");
      const projects = await collection.find({}).toArray();
      res.status(200).json(projects);
    } catch (err) {
      console.error("Projects fetch error:", err);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  // 🔍 Project Search
  else if (url.startsWith('/api/projects/search') && method === 'GET') {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const q = searchParams.get('q');
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
  }

  // 🚫 Not Found
  else {
    res.status(404).json({ error: "Not found" });
  }
};
