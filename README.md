# Itai Lior // Software & Jazz

[![Live site](https://img.shields.io/badge/live-itailiors.github.io%2Fportfolio--hub-d9231a?style=flat-square)](https://itailiors.github.io/portfolio-hub/)
[![Deploy to GitHub Pages](https://github.com/itailiors/portfolio-hub/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/itailiors/portfolio-hub/actions/workflows/deploy.yml)

### ▶ [itailiors.github.io/portfolio-hub](https://itailiors.github.io/portfolio-hub/)

My product studio hub and interactive portfolio. **The products come first**: the homepage is the product hub, every product has its own page that explains it, and everything about me lives one click away on the About page. One site, two jobs:

- **For users** of my apps: discover and install the rest of what I've built.
- **For founders and hiring managers**: see end-to-end product work, flip any product to its engineering details, and get in touch for remote contracts and MVPs.

The site comes in **three styles**, switched by a slider in the header (your choice is remembered):

| Style | Look |
|---|---|
| **Sketch** (default) | Slate page, colored hand-drawn cards, paper tags, marker-on-paper illustrations |
| **Workshop** | Wood and brushed-metal panels, brass plaques and rivets, copper pipes on a blueprint grid |
| **Poster** | The original late-night jazz poster: night black and crimson, cobalt ink on cream paper, Bauhaus geometry |

Everything is drawn with design tokens, type, CSS and inline SVG; no stock images.

---

## The products

| | Product | What it is | Built with |
|---|---|---|---|
| 🎹 | [**The Woodshed**](https://itailiors.github.io/reharm-lab/) | Interactive jazz practice suite: reharmonization dial, MIDI comping coach, improv heatmap | React, Web Audio, Web Workers, Web MIDI |
| 🔥 | [**HeatReel**](https://chromewebstore.google.com/detail/pljkjcipfkonmhnhfkfjbhjjkbhpfihf) | Chrome extension that turns YouTube's "most replayed" heatmap into a highlight reel | WXT, React, TypeScript |
| 📝 | **PsychoScanner** | Phone-camera OMR grader for Israeli psychometric exam answer sheets (beta) | React Native (Expo), FastAPI, OpenCV |
| 🎲 | **Bet on Dave** | Physics-driven multiplayer ragdoll game where spectators bet on the outcome | Unity, C#, FishNet |
| 💡 | [**Idea5**](https://github.com/itailiors/Idea5) | Offline-first PWA for a daily 5-minute idea ritual | React, TypeScript, IndexedDB |

Watch them on YouTube: [Infilimit Applications](https://www.youtube.com/@InfilimitApplications) (demos and shorts for the apps and extensions) and [Infilimit Games](https://www.youtube.com/@InfilimitGames) (the Bet on Dave series and dev vlogs). Plus game-jam builds on [itch.io](https://itch.io/profile/ogfenix) and music on [YouTube](https://www.youtube.com/@itai171).

## The pages

- **[Products](https://itailiors.github.io/portfolio-hub/)** (home): stats strip, filters (Web / Extensions / Mobile / Games) and a bento of product cards, each with what it is, a picture and a "How it works" link. Plus a list of jam builds.
- **Product pages** (`/products/<id>/`): who it's for, the problem it solves, how it works step by step, what you get, and how it's built.
- **[Videos](https://itailiors.github.io/portfolio-hub/videos/)**: the latest uploads from my two YouTube channels, pulled in automatically on every deploy.
- **[Archive](https://itailiors.github.io/portfolio-hub/archive/)**: game-jam builds and recorded music sessions.
- **[About & Jazz](https://itailiors.github.io/portfolio-hub/about/)** (the maker):
  - **How my products are built**: a showcase with a global **✨ User View / ⚙️ Under the Hood** toggle and per-card flip.
  - **Engineering track record**: Angor.io (open-source Bitcoin), eBay (backend & DevOps), and full-stack work for a national governance body.
  - **Productized services**: high-scale backends & APIs, end-to-end MVPs, browser extensions & automation.
  - **Creative Lab**: featured game, game jams, and a music corner with click-to-play sessions.
  - **Drop-in widget preview**: the exact "More tools by me" drawer my apps embed.
  - **Hire me**.

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
- Tailwind CSS 4 (design tokens in [`src/styles/global.css`](src/styles/global.css); the three site styles in [`src/styles/styles.css`](src/styles/styles.css))
- Style switching with CSS variables + the View Transitions API, applied before first paint
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
| `npm run art` | Regenerate the sketch illustrations (and their Sketchbook color versions) in `public/images/` |

The site lives under the `/portfolio-hub` base path. Root-relative links in markup go through `withBase()` in [`src/lib/url.ts`](src/lib/url.ts).

## Project structure

```
public/
  ecosystem.json        public product manifest (fetched by my apps)
  images/               screenshots + generated sketch illustrations
src/
  data/profile.json     CV, services, creative bio, music sessions, contact
  lib/                  products (manifest + images), skins (per-product looks), url
  styles/               tokens (global.css) + the three site styles (styles.css)
  components/
    StyleSlider.astro     Poster · Workshop · Sketch slider
    hub/                  product cards, media and footer for the hub + product pages
    ProductShowcase.tsx   product cards with the user / engineering flip (About page)
    EcosystemDrawer.tsx   portable "More tools by me" drawer
    JazzPosterArt.tsx     generative SVG poster art (card fallbacks + hero)
    sections/             hero, experience, services, creative lab, hire
  pages/                index (products hub), products/[id], archive, about, 404
scripts/art/            generators for the sketch-style illustrations
```

## Editing content

- **Products** → [`public/ecosystem.json`](public/ecosystem.json). The `story` field (audience, problem, steps, features) fills the product page. Each product can set an `imageUrl`; if the image is missing, the card falls back to generated SVG art. A `<image>-color.<ext>` file next to it is used in the Sketch style.
- **How each product looks per style** → [`src/lib/skins.ts`](src/lib/skins.ts).
- **CV, services, music, contact** → [`src/data/profile.json`](src/data/profile.json).
- **Illustrations** → edit a script in [`scripts/art/`](scripts/art/), then `npm run art`.

More detail on the design system, manifest schema and widget sync rules is in [`CLAUDE.md`](CLAUDE.md).

## Contact

Open to remote contracts and MVP builds. Reach me via the [hire section](https://itailiors.github.io/portfolio-hub/about/#hire), on [GitHub](https://github.com/itailiors), or on Instagram at [@it.is.lio](https://www.instagram.com/it.is.lio/).
