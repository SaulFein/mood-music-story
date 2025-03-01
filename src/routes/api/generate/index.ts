import { RequestHandler } from "@builder.io/qwik-city";
import OpenAI from "openai";
import SpotifyWebApi from "spotify-web-api-node";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export const onPost: RequestHandler = async ({ json, parseBody }) => {
  try {
    const body = await parseBody();
    const { image, genre } = body as {
      image: string;
      genre: string;
    };

    // 1. Analyze image to detect mood with gpt-4o-mini
    const moodAnalysisResponse = await openai.chat.completions.create({
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
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 50
    });

    const detectedMood = moodAnalysisResponse.choices[0].message.content?.toLowerCase().trim() || 'calm';

    // 2. Generate mood description
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

    // 3. Get Spotify access token
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body["access_token"]);

    // 4. Generate playlist based on genre and detected mood
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

    // 5. Return everything to the client
    json(200, {
      storyData: {
        mood: detectedMood,
        moodDescription: moodDescription,
        genre
      },
      tracks
    });
  } catch (error) {
    console.error("Error:", error);
    json(500, { error: "Failed to process request" });
  }
};
