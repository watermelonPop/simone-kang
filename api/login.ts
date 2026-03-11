import type { VercelRequest, VercelResponse } from '@vercel/node';
import SpotifyWebAPI from 'spotify-web-api-node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const spotifyApi = new SpotifyWebAPI({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });
  try {
    const data = await spotifyApi.authorizationCodeGrant(req.body.code);
    res.status(200).json({ accessToken: data.body.access_token, refreshToken: data.body.refresh_token, expiresIn: data.body.expires_in });
  } catch (err) {
    res.status(400).json({ error: 'Login failed' });
  }
}