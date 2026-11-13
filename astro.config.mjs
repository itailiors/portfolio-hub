// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Deployed to GitHub Pages as a project site: https://itailiors.github.io/portfolio-hub/
// Root-relative asset paths in components go through `withBase()` (src/lib/url.ts),
// so moving to a custom domain later only means changing `site` and setting `base: "/"`.
export default defineConfig({
  site: "https://itailiors.github.io",
  base: "/portfolio-hub",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
