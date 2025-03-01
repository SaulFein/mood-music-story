import { component$, useSignal, useStore, $ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";

interface ImageUploadStore {
  imageData: string;
  genre: string;
  isLoading: boolean;
  error: string;
}

export const ImageUpload = component$(() => {
  const store = useStore<ImageUploadStore>({
    imageData: "",
    genre: "",
    isLoading: false,
    error: "",
  });

  const fileInputRef = useSignal<HTMLInputElement>();
  const nav = useNavigate();

  const processFile = $((file: File) => {
    if (!file.type.startsWith("image/")) {
      store.error = "Please upload a selfie or photo of yourself";
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

  const handleFileInput = $((e: Event) => {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      processFile(file);
      // Reset the input value after processing
      input.value = '';
    }
  });

  const handleClick = $((e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (fileInputRef.value) {
      fileInputRef.value.click();
    }
  });

  const handleDrop = $((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files[0];
    if (file) {
      processFile(file);
    }
  });

  const handleSubmit = $(async (e: Event) => {
    e.stopPropagation();
    if (!store.imageData) {
      store.error = "Please upload a photo of yourself";
      return;
    }

    if (!store.genre) {
      store.error = "Please select a music genre";
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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze mood and generate playlist");
      }

      const data = await response.json();
      nav(
        "/results?" +
          new URLSearchParams({
            storyData: encodeURIComponent(JSON.stringify(data.storyData)),
            tracks: encodeURIComponent(JSON.stringify(data.tracks))
          })
      );
    } catch (error) {
      store.error = "Failed to analyze your mood";
    } finally {
      store.isLoading = false;
    }
  });

  return (
    <div
      class="space-y-6"
      preventdefault:dragover
      onDrop$={handleDrop}
    >
      <div
        class={`cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors hover:border-purple-400 ${
          store.imageData ? "border-purple-500" : "border-purple-500/50"
        }`}
      >
        <div 
          class="w-full h-full"
          onClick$={handleClick}
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
              <div class="mx-auto mb-4 h-12 w-12 text-purple-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
              </div>
              <p class="mb-2 text-sm font-medium text-purple-500">
                Upload a photo of yourself
              </p>
              <p class="text-xs text-purple-500/70">
                Drag & drop or click to upload
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        class="hidden"
        onChange$={handleFileInput}
      />

      <div class="space-y-2">
        <label class="block text-sm font-medium text-purple-300">
          Select Music Genre
        </label>
        <select
          class="w-full rounded-lg bg-purple-950/50 p-2 text-white"
          value={store.genre}
          onChange$={(e) => (store.genre = (e.target as HTMLSelectElement).value)}
        >
          <option value="">Choose a genre</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="hip-hop">Hip Hop</option>
          <option value="jazz">Jazz</option>
          <option value="classical">Classical</option>
          <option value="electronic">Electronic</option>
          <option value="r&b">R&B</option>
        </select>
      </div>

      {store.error && (
        <p class="text-center text-sm text-red-400">{store.error}</p>
      )}

      <button
        onClick$={handleSubmit}
        disabled={store.isLoading}
        class="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {store.isLoading ? "Analyzing your mood..." : "Analyze Mood & Create Playlist"}
      </button>
    </div>
  );
});
