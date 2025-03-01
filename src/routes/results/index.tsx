import { component$, useSignal } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  preview_url: string;
  external_url: string;
}

interface MoodResult {
  mood: string;
  moodDescription: string;
  genre: string;
  tracks: Track[];
}

export default component$(() => {
  const location = useLocation();
  const result = useSignal<MoodResult>();
  
  // Get mood data from URL state
  const storyData = location.url.searchParams.get('storyData');
  const tracksData = location.url.searchParams.get('tracks');
  
  if (storyData && tracksData) {
    try {
      const parsedStoryData = JSON.parse(decodeURIComponent(storyData));
      const parsedTracks = JSON.parse(decodeURIComponent(tracksData));
      
      result.value = {
        mood: parsedStoryData.mood,
        moodDescription: parsedStoryData.moodDescription,
        genre: parsedStoryData.genre,
        tracks: parsedTracks
      };
    } catch (e) {
      console.error('Failed to parse mood data:', e);
    }
  }

  return (
    <div class="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <main class="container mx-auto px-4 py-8">
        {result.value ? (
          <div class="max-w-4xl mx-auto space-y-12">
            <div class="text-center">
              <h1 class="text-4xl font-bold mb-2">Your Mood Music</h1>
              <p class="text-xl text-purple-300">
                {result.value.genre} • {result.value.mood}
              </p>
            </div>

            <div class="bg-white/5 rounded-lg p-6">
              <h2 class="text-2xl font-semibold mb-4">Mood Analysis</h2>
              <p class="text-lg text-purple-200">{result.value.moodDescription}</p>
            </div>

            <div>
              <h2 class="text-2xl font-semibold mb-6">Your Personalized Playlist</h2>
              <div class="space-y-4">
                {result.value.tracks.map((track) => (
                  <div
                    key={track.id}
                    class="flex items-center justify-between bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <h3 class="font-medium">{track.name}</h3>
                      <p class="text-sm text-purple-300">
                        {track.artist} • {track.album}
                      </p>
                    </div>
                    <div class="flex items-center space-x-4">
                      {track.preview_url && (
                        <audio controls class="h-8">
                          <source src={track.preview_url} type="audio/mpeg" />
                        </audio>
                      )}
                      <a
                        href={track.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-green-500 hover:text-green-400"
                        title="Open in Spotify"
                      >
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div class="text-center">
              <button
                onClick$={() => window.location.href = '/'}
                class="bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-500 transition-colors"
              >
                Create Another Playlist
              </button>
            </div>
          </div>
        ) : (
          <div class="text-center text-red-400">
            <p>No mood data found.</p>
          </div>
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Your Mood Music - Results',
  meta: [
    {
      name: 'description',
      content: 'Your personalized mood-based music playlist',
    },
  ],
};
