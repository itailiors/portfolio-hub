# Itai Lior // Software & Jazz Co-op

[![Live site](https://img.shields.io/badge/live-itailiors.github.io%2Fportfolio--hub-d9231a?style=flat-square)](https://itailiors.github.io/portfolio-hub/)
[![Deploy to GitHub Pages](https://github.com/itailiors/portfolio-hub/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/itailiors/portfolio-hub/actions/workflows/deploy.yml)

### ▶ [itailiors.github.io/portfolio-hub](https://itailiors.github.io/portfolio-hub/)

My product studio hub and interactive portfolio. One site with two jobs:

- **For users** of my apps: discover and install the rest of what I've built.
- **For founders and hiring managers**: see end-to-end product work, flip any product to its engineering details, and get in touch for remote contracts and MVPs.

The look is a late-night jazz poster: night black and crimson from the North Gate Jazz Co-op (Chiang Mai), cobalt ink on cream paper, and Bauhaus geometric jazz art. Everything is drawn with design tokens, type and inline SVG; no stock images.

---

## The products

| | Product | What it is | Built with |
|---|---|---|---|
| 🎹 | [**The Woodshed**](https://itailiors.github.io/TheWoodshed/) | Interactive jazz practice suite: reharmonization dial, MIDI comping coach, improv heatmap | React, Web Audio, Web Workers, Web MIDI |
| 🔥 | [**HeatReel**](https://chromewebstore.google.com/detail/pljkjcipfkonmhnhfkfjbhjjkbhpfihf) | Chrome extension that turns YouTube's "most replayed" heatmap into a highlight reel | WXT, React, TypeScript |
| 📝 | **PsychoScanner** | Phone-camera OMR grader for Israeli psychometric exam answer sheets (beta) | React Native (Expo), FastAPI, OpenCV |
| 🎲 | **Bet on Dave** | Physics-driven multiplayer ragdoll game where spectators bet on the outcome | Unity, C#, FishNet |
| 💡 | [**Idea5**](https://github.com/itailiors/Idea5) | Offline-first PWA for a daily 5-minute idea ritual | React, TypeScript, IndexedDB |

Plus game-jam builds on [itch.io](https://itch.io/profile/ogfenix) and music on [YouTube](https://www.youtube.com/@itai171).

## What's on the page

- **Product showcase** with a global **✨ User View / ⚙️ Under the Hood** toggle and per-card flip: consumer pitch and screenshot on one side, stack, architecture and metrics on the other.
- **Engineering track record**: Angor.io (open-source Bitcoin), eBay (backend & DevOps), and full-stack work for a national governance body.
- **Productized services**: high-scale backends & APIs, end-to-end MVPs, browser extensions & automation.
- **Creative Lab**: featured game, game jams, and a music corner with click-to-play sessions.
- **Drop-in widget preview**: the exact "More tools by me" drawer my apps embed.

## The cross-promotion ecosystem

[`public/ecosystem.json`](public/ecosystem.json) is a public manifest of every product, served at:

```
https://itailiors.github.io/portfolio-hub/ecosystem.json
```

GitHub Pages serves it with `Access-Control-Allow-Origin: *`, so the Chrome extension and mobile apps fetch it at runtime. Shipping a new product means editing that one file; no app releases needed.

[`src/components/EcosystemDrawer.tsx`](src/components/EcosystemDrawer.tsx) is a self-contained React component (React is its only dependency, inline styles, Shadow-DOM safe) that renders the "More tools by me" drawer:

```tsx
<EcosystemDrawer
  currentAppId="heatreel"                                         // hides the host app
  manifestUrl="https://itailiors.github.io/portfolio-hub/ecosystem.json"
/>
```

It filters out the host app, tags every link with `utm_source=<host app>`, caches the manifest for 6 hours, and reserves the bottom 20% for a hire-me banner. The React Native app reuses its exported helpers (`getRecommendations`, `buildTrackedUrl`, `loadManifest`) with native views.

## Tech stack

- [Astro 7](https://astro.build) (static output) with React 19 islands
- Tailwind CSS 4 (design tokens in [`src/styles/global.css`](src/styles/global.css))
- TypeScript (strict), checked with `astro check` on every build
- Deployed to GitHub Pages by [GitHub Actions](.github/workflows/deploy.yml) on every push to `main`

## Run it locally

Requires Node 22.23+ (CI uses Node 24).

```bash
npm install
npm run dev      # http://localhost:4321/portfolio-hub/
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run check` | Type-check Astro, TS and JSON data |
| `npm run build` | `astro check` + production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run art` | Regenerate the pencil-sketch illustrations in `public/images/` |

The site lives under the `/portfolio-hub` base path. Root-relative links in markup go through `withBase()` in [`src/lib/url.ts`](src/lib/url.ts).

## Project structure

```
public/
  ecosystem.json        public product manifest (fetched by my apps)
  images/               screenshots + generated sketch illustrations
src/
  data/profile.json     CV, services, creative bio, music sessions, contact
  components/
    ProductShowcase.tsx   product cards with the user / engineering flip
    EcosystemDrawer.tsx   portable "More tools by me" drawer
    JazzPosterArt.tsx     generative SVG poster art (card fallbacks + hero)
    sections/             hero, experience, services, creative lab, hire
  pages/                index + 404
scripts/art/            generators for the sketch-style illustrations
```

## Editing content

- **Products** → [`public/ecosystem.json`](public/ecosystem.json). Each product can set an `imageUrl`; if the image is missing or fails to load, the card falls back to generated SVG art without shifting the layout.
- **CV, services, music, contact** → [`src/data/profile.json`](src/data/profile.json).
- **Illustrations** → edit a script in [`scripts/art/`](scripts/art/), then `npm run art`.

More detail on the design system, manifest schema and widget sync rules is in [`CLAUDE.md`](CLAUDE.md).

## Contact

Open to remote contracts and MVP builds. Reach me via the [hire section](https://itailiors.github.io/portfolio-hub/#hire), on [GitHub](https://github.com/itailiors), or on Instagram at [@it.is.lio](https://www.instagram.com/it.is.lio/).
