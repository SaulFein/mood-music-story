import { OpenAI } from 'openai';
import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { image, genre } = JSON.parse(event.body);

    if (!image || !genre) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Image and genre are required' }),
      };
    }

    // Get access token for Spotify
    const authResponse = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authResponse.body.access_token);

    // Analyze mood with OpenAI
    const base64Image = image.split(',')[1];
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this selfie/portrait and determine the person's emotional state or mood. Focus on facial expressions, body language, and overall emotional context. Respond with a single word representing their primary mood from this list: happy, sad, energetic, calm, melancholic, excited, peaceful, anxious, confident, thoughtful." 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 50
    });

    const detectedMood = response.choices[0].message.content?.toLowerCase().trim() || 'calm';

    // Generate mood description
    const moodDescriptionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write a brief, friendly description analyzing the person's mood. Format: "After analyzing your photo, we can see that you appear to be in a ${detectedMood} mood. This was determined by [specific visual cues like facial expressions, posture, or other relevant details]. Based on this mood, we'll create a playlist that [brief explanation of how the music will match their mood]."`
        }
      ]
    });

    const moodDescription = moodDescriptionResponse.choices[0].message.content;

    // Search for tracks on Spotify
    const searchQuery = `genre:${genre} ${detectedMood}`;
    const searchResults = await spotifyApi.searchTracks(searchQuery, {
      limit: 10,
    });

    const tracks = searchResults.body.tracks?.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      duration_ms: track.duration_ms,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storyData: {
          mood: detectedMood,
          moodDescription: moodDescription,
          genre
        },
        tracks
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze mood and generate playlist' }),
    };
  }
};
