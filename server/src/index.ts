import { MongoClient, Db } from 'mongodb';
import 'dotenv/config';
import SpotifyWebAPI from 'spotify-web-api-node';
import { IncomingMessage, ServerResponse, createServer } from 'http';


let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDB(): Promise<{ db: Db; client: MongoClient }> {
  if (cachedDb && cachedClient) return { db: cachedDb, client: cachedClient };
  const uri = process.env.MONGO_URI!;
  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  cachedDb = cachedClient.db("portfolio-database");
  return { db: cachedDb, client: cachedClient };
}

const handler = async (req: IncomingMessage & { body: any }, res: ServerResponse & { status: (code: number) => any; json: (data: any) => void }) => {
  // Attach status() and json() helpers since plain Node doesn't have them
  (res as any).status = (code: number) => { res.statusCode = code; return res; };
  (res as any).json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  const { url, method } = req;
  if (!url) return (res as any).status(400).json({ error: "Bad request" });

  let body: any = {};
  if (method === 'POST') {
    const raw = await new Promise<string>((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    });
    try { body = JSON.parse(raw); } catch { body = {}; }
  }

  const spotifyApi = new SpotifyWebAPI({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:5173/',
  });

  // 🎧 Login
  if (url === '/api/login' && method === 'POST') {
    try {
      const data = await spotifyApi.authorizationCodeGrant(body.code);
      (res as any).status(200).json({ accessToken: data.body.access_token, refreshToken: data.body.refresh_token, expiresIn: data.body.expires_in });
    } catch (err) {
      console.error("Login error:", err);
      (res as any).status(400).json({ error: "Login failed" });
    }
  }

  // 🔄 Refresh Token
  else if (url === '/api/refresh' && method === 'POST') {
    try {
      spotifyApi.setRefreshToken(body.refreshToken);
      const data = await spotifyApi.refreshAccessToken();
      (res as any).status(200).json({ accessToken: data.body.access_token, expiresIn: data.body.expires_in });
    } catch (err) {
      console.error("Refresh error:", err);
      (res as any).status(400).json({ error: "Refresh failed" });
    }
  }

  // 👤 Guest Token
  else if (url === '/api/guest-token' && method === 'GET') {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      (res as any).status(200).json({ accessToken: data.body.access_token, expiresIn: data.body.expires_in });
    } catch (err) {
      console.error("Guest token error:", err);
      (res as any).status(500).json({ error: 'Failed to get guest token' });
    }
  }

  // 📦 Get Projects
  else if (url === '/api/projects' && method === 'GET') {
    try {
      const { db } = await connectToDB();
      const projects = await db.collection("New-Projects").find({}).toArray();
      (res as any).status(200).json(projects);
    } catch (err) {
      console.error("Projects fetch error:", err);
      (res as any).status(500).json({ error: "Failed to fetch projects" });
    }
  }

  // 🔍 Project Search
  else if (url.startsWith('/api/projects/search') && method === 'GET') {
    const { searchParams } = new URL(url, `http://${req.headers.host}`);
    const q = searchParams.get('q');
    if (!q) return (res as any).status(400).json({ error: "Missing query param 'q'" });
    try {
      const { db } = await connectToDB();
      const results = await db.collection("New-Projects").find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { desc: { $regex: q, $options: 'i' } },
            { "front_end": { $elemMatch: { $regex: q, $options: 'i' } } },
            { "back_end": { $elemMatch: { $regex: q, $options: 'i' } } },
        ]
      }).toArray();
      (res as any).status(200).json(results);
    } catch (err) {
      console.error("Search error:", err);
      (res as any).status(500).json({ error: "Search failed" });
    }
  }

  // 🚫 Not Found
  else {
    (res as any).status(404).json({ error: "Not found" });
  }
};

const PORT = process.env.PORT || 3001;
createServer(handler as any).listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});