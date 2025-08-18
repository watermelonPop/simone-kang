const SpotifWebAPI = require("spotify-web-api-node");

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  const spotifyApi = new SpotifWebAPI({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
  });

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
};
