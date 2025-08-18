require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const SpotifWebAPI = require("spotify-web-api-node");

const app = express();
const PORT = process.env.PORT || 4000;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

var spotify_client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
console.log("CLIENT ID: ", spotify_client_id);
var spotify_client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

var spotify_redirect_uri = 'http://127.0.0.1:3000';


app.use(cors());
app.use(express.json());


let db;

// Connect to DB
async function connectDB() {
  try {
    await client.connect();
    db = client.db("portfolio-database");
    console.log("CONNECTED TO MONGO");

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}
connectDB();

app.get('/api/projects', async (req, res) => {
        try {
          const collection = db.collection("Projects");
          const projects = await collection.find({}).toArray();
          res.json(projects);
        } catch (err) {
          console.error("Failed to fetch projects:", err);
          res.status(500).json({ error: "Failed to fetch projects" });
        }
});

app.get('/api/projects/search', async (req, res) => {
        const { q } = req.query; // Get search query from ?q=term
      
        if (!q) {
          return res.status(400).json({ error: "Missing search query parameter 'q'" });
        }
      
        try {
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
          res.json(results);
        } catch (err) {
          console.error("Search failed:", err);
          res.status(500).json({ error: "Search failed" });
        }
});
      

app.post('/login', (req, res) => {
        const code = req.body.code;
        console.log("INSIDE LOGIN SERVER FUN: ", code);
        const spotifyApi = new SpotifWebAPI({
          redirectUri: spotify_redirect_uri,
          clientId: spotify_client_id,
          clientSecret: spotify_client_secret,
        });
        spotifyApi
          .authorizationCodeGrant(code)
          .then((data) => {
            res.json({
              accessToken: data.body.access_token,
              refreshToken: data.body.refresh_token,
              expiresIn: data.body.expires_in,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(400);
          });
      });
      
      app.post("/refresh", (req, res) => {
        const refreshToken = req.body.refreshToken;
        const spotifyApi = new SpotifWebAPI({
          redirectUri: spotify_redirect_uri,
          clientId: spotify_client_id,
          clientSecret: spotify_client_secret,
          refreshToken,
        });
        spotifyApi
          .refreshAccessToken()
          .then((data) => {
            console.log(data.body);
          })
          .catch(() => {
            res.status(400);
          });
      });



// Serve frontend
app.use(express.static(path.resolve(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});