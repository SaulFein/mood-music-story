import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import baseConfig from "../../vite.config";

export default defineConfig(() => {
  return {
    ...baseConfig,
    plugins: [
      qwikCity(),
      qwikVite({
        ssr: {
          outDir: "netlify/edge-functions",
        },
      }),
      tsconfigPaths(),
      tailwindcss(),
    ],
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.netlify.tsx", "@qwik-city-plan"],
      },
    },
  };
});
