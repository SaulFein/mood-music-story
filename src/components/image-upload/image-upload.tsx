import { component$, useSignal, useStore, $ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";

interface ImageUploadStore {
  imageData: string;
  genre: string;
  mood: string;
  isLoading: boolean;
  error: string;
}

export const ImageUpload = component$(() => {
  const store = useStore<ImageUploadStore>({
    imageData: "",
    genre: "",
    mood: "",
    isLoading: false,
    error: "",
  });

  const fileInputRef = useSignal<HTMLInputElement>();
  const nav = useNavigate();

  const processFile = $((file: File) => {
    if (!file.type.startsWith("image/")) {
      store.error = "Please upload an image file";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      store.imageData = result;
      store.error = "";
    };
    reader.onerror = () => {
      store.error = "Failed to read file";
    };
    reader.readAsDataURL(file);
  });

  const handleDrop = $((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer?.files) {
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    }
  });

  const handleFileInput = $((e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      processFile(input.files[0]);
    }
  });

  const handleSubmit = $(async () => {
    if (!store.imageData || !store.genre || !store.mood) {
      store.error = "Please select an image, genre, and mood";
      return;
    }

    store.isLoading = true;
    store.error = "";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: store.imageData,
          genre: store.genre,
          mood: store.mood,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await response.json();
      // Navigate to results page with the data
      nav(
        "/results?" +
          new URLSearchParams({
            storyData: encodeURIComponent(JSON.stringify(data.storyData)),
            tracks: encodeURIComponent(JSON.stringify(data.tracks))
          })
      );
    } catch (error) {
      store.error = "Failed to process image";
    } finally {
      store.isLoading = false;
    }
  });

  return (
    <div
      class="space-y-6"
      onDragOver$={(e) => e.preventDefault()}
      onDrop$={handleDrop}
    >
      <div
        class={`cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors hover:border-purple-400 ${store.imageData ? "border-purple-500" : "border-purple-500/50"}`}
        onClick$={() => fileInputRef.value?.click()}
      >
        {store.imageData ? (
          <img
            src={store.imageData}
            alt="Preview"
            width={256}
            height={256}
            class="mx-auto max-h-64 rounded-lg object-contain"
          />
        ) : (
          <div class="text-center">
            <svg
              class="mx-auto h-12 w-12 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p class="mt-2">Drop your image here or click to upload</p>
            <p class="text-sm text-gray-400">
              Share a moment, and we'll create your musical story
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        class="hidden"
        ref={fileInputRef}
        onChange$={handleFileInput}
      />

      <div class="grid grid-cols-2 gap-4">
        <select
          class="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2"
          value={store.genre}
          onChange$={(e) =>
            (store.genre = (e.target as HTMLSelectElement).value)
          }
        >
          <option value="">Select Genre</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="jazz">Jazz</option>
          <option value="electronic">Electronic</option>
          <option value="classical">Classical</option>
        </select>

        <select
          class="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2"
          value={store.mood}
          onChange$={(e) =>
            (store.mood = (e.target as HTMLSelectElement).value)
          }
        >
          <option value="">Select Mood</option>
          <option value="energetic">Energetic</option>
          <option value="relaxed">Relaxed</option>
          <option value="melancholic">Melancholic</option>
          <option value="happy">Happy</option>
          <option value="focused">Focused</option>
        </select>
      </div>

      {store.error && (
        <div class="text-center text-sm text-red-400">{store.error}</div>
      )}

      <button
        class={`w-full rounded-lg py-3 font-semibold transition-all ${
          store.isLoading
            ? "cursor-not-allowed bg-purple-700 opacity-70"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
        }`}
        onClick$={handleSubmit}
        disabled={store.isLoading}
      >
        {store.isLoading ? "Generating..." : "Generate Musical Story"}
      </button>
    </div>
  );
});
