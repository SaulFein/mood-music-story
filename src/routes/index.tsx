import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { ImageUpload } from '~/components/image-upload/image-upload';

export default component$(() => {
  return (
    <div class="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <main class="container mx-auto px-4 py-16">
        <div class="text-center">
          <h1 class="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            MoodSync
          </h1>
          <p class="text-xl mb-8 text-gray-300">
            Transform your moments into musical stories with AI
          </p>
          
          <div class="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
            <ImageUpload />
          </div>

          <div class="mt-12 text-sm text-gray-400">
            <p>Powered by AI • Create unique musical experiences • Share your story</p>
          </div>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
