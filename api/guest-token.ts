import type { VercelRequest, VercelResponse } from '@vercel/node';
import SpotifyWebAPI from 'spotify-web-api-node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const spotifyApi = new SpotifyWebAPI({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    res.status(200).json({ accessToken: data.body.access_token, expiresIn: data.body.expires_in });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get guest token' });
  }
}