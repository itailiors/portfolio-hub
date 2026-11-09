// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://example.com", // TODO: replace with your production domain
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
