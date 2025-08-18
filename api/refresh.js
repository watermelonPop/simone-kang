const SpotifWebAPI = require("spotify-web-api-node");

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const spotifyApi = new SpotifWebAPI({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
  });

  try {
    spotifyApi.setRefreshToken(req.body.refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    res.status(200).json({
      accessToken: data.body.access_token,
      expiresIn: data.body.expires_in,
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(400).json({ error: "Refresh failed" });
  }
};
