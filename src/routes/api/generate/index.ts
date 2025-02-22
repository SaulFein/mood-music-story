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
    const { image, genre, mood } = body as {
      image: string;
      genre: string;
      mood: string;
    };

    // 1. Analyze image with gpt-4o-mini
    const imageAnalysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and describe the mood, setting, and emotional context. Focus on elements that could relate to music.",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const imageAnalysis = imageAnalysisResponse.choices[0].message.content;

    // 2. Generate story based on image analysis
    const storyResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a short, engaging story that connects this image analysis: "${imageAnalysis}" 
                    with ${genre} music and a ${mood} mood. Make it personal and emotionally resonant.`,
        },
      ],
    });

    const story = storyResponse.choices[0].message.content;

    if (!story) throw new Error("Failed to generate story");

    // 3. Get Spotify access token
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body["access_token"]);

    // 4. Generate playlist based on genre and mood
    const searchQuery = `genre:${genre} ${mood}`;
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
        story,
        mood,
        genre
      },
      tracks
    });
  } catch (error) {
    console.error("Error:", error);
    json(500, { error: "Failed to process request" });
  }
};
