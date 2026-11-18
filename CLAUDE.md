# Portfolio Hub — Product Studio & Interactive Portfolio

Personal site, branded **Itai Lior // Software & Jazz**, with two jobs. **Products come first**: the homepage is the product hub; everything about the maker lives on `/about/`.

1. **Product ecosystem hub (B2C)** — users of The Woodshed (jazz practice web app), HeatReel (Chrome extension), PsychoScanner (React Native app), Idea5 (PWA) and the Unity games discover and cross-install the other products.
2. **Freelance / hiring funnel (B2B)** — shows founders and hiring managers end-to-end product ability, backed by Angor.io, eBay and full-stack work for a national governance body (keep that role in general language — no organization names or specifics).

## Stack

- **Astro 7** (static output) + **@astrojs/react** islands (React 19)
- **Tailwind CSS 4** via `@tailwindcss/vite` — no `tailwind.config`; design tokens live in `@theme` in `src/styles/global.css`
- TypeScript 6 (strict) — `@astrojs/check` does not support TS 7 yet, don't upgrade past `^6`
- Deploy target: **GitHub Pages** at https://itailiors.github.io/portfolio-hub/ via `.github/workflows/deploy.yml` (every push to `main` runs `npm ci && npm run build` and deploys `dist/`). GitHub Pages already serves `Access-Control-Allow-Origin: *`, so `/ecosystem.json` is fetchable from the extension and apps. `vercel.json` is kept only in case the site moves to Vercel.
- **Base path:** `astro.config.mjs` sets `site` + `base: "/portfolio-hub"`. Any root-relative URL rendered in markup (favicon, images, `/ecosystem.json`) must go through `withBase()` from `src/lib/url.ts`; `src/lib/products.ts` applies it to manifest `imageUrl`s. Moving to a custom domain = change `site`, set `base: "/"`, and update the URLs in `ecosystem.json` `creator` and `DEFAULT_MANIFEST_URL`.

## Commands

```bash
npm run dev       # http://localhost:4321/portfolio-hub/  (note the base path)
npm run check     # astro check — must be 0 errors / 0 warnings
npm run build     # astro check && astro build → dist/
npm run preview
npm run art       # regenerate the sketch illustrations in public/images/
```

## Pages

| Route | File | What |
|---|---|---|
| `/` | `pages/index.astro` | **Products hub**: intro, stats strip, filter chips (All / Web / Extensions / Mobile / Games), bento of product cards, latest 3 videos + channel links, jam-builds list |
| `/products/<id>/` | `pages/products/[id].astro` | One page per manifest product: hero card, who it's for, the problem, how it works (steps), what you get, videos, under the hood, more products |
| `/videos/` | `pages/videos.astro` | The two studio YouTube channels with their latest uploads (click-to-play) |
| `/archive/` | `pages/archive.astro` | Game jams + session tapes |
| `/about/` | `pages/about.astro` | **About & Jazz (the maker)**: CV hero, "How my products are built" showcase (user/engineering flip), experience, services, creative lab, drop-in widget, hire (`#hire`) |
| 404 | `pages/404.astro` | |

The nav (`sections/Nav.astro`) is shared: Products, Videos, Archive, the "About & Jazz (the maker)" button and the style slider. Pass `active` to highlight the current page. Hub copy comes from the manifest (`tagline`, `consumerDescription`, `platformLabel`, `story`); the hub's footer line names the instruments from `profile.creative.instruments`.

## YouTube channels & videos

Two studio channels live in `profile.json` → `channels` (also `contact.youtubeApps` / `contact.youtubeGames`); `contact.youtube` (@itai171) stays the personal music channel.

| id | Channel | For |
|---|---|---|
| `apps` | Infilimit Applications (@InfilimitApplications) | apps & extensions: HeatReel, PsychoScanner, future apps |
| `games` | Infilimit Games (@InfilimitGames) | Bet on Dave series, dev vlogs, future games |

- `src/lib/youtube.ts` fetches each channel's public RSS feed (`feeds/videos.xml?channel_id=…`, latest ~15 uploads) **at build time**, once per build. New uploads appear on the next deploy. A failed fetch only logs a warning; the pages then show the channel card without videos.
- A product's videos = uploads on its channel (`category: "game"` → games, else apps) whose **title or description** mentions the product's `name`. Put the product name in the video title or description to have it show on that product's page.
- `hub/VideoCard.astro` is a click-to-play thumbnail (the youtube-nocookie player loads only on click); include `hub/VideoScript.astro` once on any page that uses it. `hub/ChannelCard.astro` is the channel + subscribe block.

## Layout

```
public/
  ecosystem.json          ← PUBLIC cross-promo manifest (fetched by external apps; GitHub Pages serves it with CORS *)
  favicon.svg
src/
  data/profile.json       ← CV timeline, services, creative bio — all copy for the CV sections
  types/ecosystem.ts      ← TS types for ecosystem.json
  styles/global.css       ← Tailwind import, @theme tokens, paper grain, .poster-frame / .rail-text / .numeral / .btn-* helpers
  layouts/Layout.astro    ← Google Fonts: Bebas Neue, Playfair Display (italic), Space Grotesk, JetBrains Mono
  styles/styles.css       ← the three site styles (token overrides + per-style skins), slider, wipe transition
  lib/products.ts         ← reads public/ecosystem.json (single source of truth), resolves images, UTM + filter helpers
  lib/skins.ts            ← per-product hub presentation: Sketchbook colors, Workshop material, layout, bento span, pipes
  pages/                  ← index (hub), products/[id], archive, about, 404 — see "Pages"
  components/
    StyleSlider.astro     ← Poster · Workshop · Sketch slider (click, drag, arrow keys)
    hub/                  ← ProductCard, ProductMedia (image / -color variant / art fallback), SiteFooter
    ProductShowcase.tsx   ← React island: filter chips + global "✨ User View / ⚙️ Under the Hood" toggle + per-card flip
    EcosystemDrawer.tsx   ← PORTABLE drop-in "More tools by me" drawer (see sync rules below)
    DrawerPreview.tsx     ← site-only wrapper that simulates the drawer inside each host app
    JazzPosterArt.tsx     ← pure-SVG generative poster art (variant "hero" | "card"); rendered static, no hydration
    Monogram.astro        ← "IL" block monogram (also baked into public/favicon.svg)
    sections/             ← static Astro sections: Nav, Hero, PosterSection (shell), Experience (+ Services), CreativeLab, Hire (+ footer)
vercel.json
```

## Site styles — Poster · Workshop · Sketch

The whole site has three looks, switched by the slider in the nav. The choice is stored in `localStorage["il-style"]` and applied by an inline script in `Layout.astro` before first paint (default **sketch**; `<html data-style="sketch">` is also the no-JS default).

| Style | Look |
|---|---|
| `poster` | The original jazz-poster design below: night black, crimson, cobalt on paper, Bebas / Playfair |
| `workshop` | Dark wood + copper blueprint grid; wood / brushed-steel / gunmetal / parchment panels with brass rivets; brass plaque tags; brass & steel buttons; copper pipes between hub cards (xl+). Oswald / Barlow / Roboto Slab |
| `sketch` | Flat slate page; colored hand-drawn cards with wobbly ink borders and offset shadows; paper tags in handwriting; marker-yellow buttons. Rubik / Nunito / Kalam |

How it works (`src/styles/styles.css`):
- **Tokens**: every Tailwind color/font utility reads a CSS variable, so `html[data-style="…"]` only re-points `--color-*` and `--font-*`. Existing pages (About, 404) restyle with no markup changes. Keep token roles stable: `night` = page, `char*` = surfaces, `crimson` = primary fill (AA with cream text in every style), `terra` = small accent text.
- **Skins**: shared building blocks get per-style rules: `.poster-frame`, `.btn-crimson`, `.btn-ghost`, `.eyebrow`, `.numeral`, `.rail-text`, and the hub classes `.hub-card`, `.hub-tag`, `.hub-media`, `.hub-btn`, `.hub-btn-alt`, `.hub-chip`, `.hub-panel`, `.step-num`. These rules are unlayered, so they beat Tailwind utilities: don't put conflicting utilities on those elements.
- **Per product** (`lib/skins.ts`): Sketchbook card fill/ink (+ button colors on dark fills), Workshop material (`wood | steel | slate | parchment`), layout (`split`, `split-media-first`, `stack`), bento span (12 columns at `xl`, 2 columns from `md`) and Workshop pipes. A product without an entry gets a neutral fallback. Card text on every fill was checked for WCAG AA (muted copy is an 86% mix of the card ink).
- **Slider + wipe**: switching runs `document.startViewTransition` and wipes the new style across the page in the direction of the slide (`html[data-wipe]`); instant with reduced motion or without View Transitions support. It also updates `<meta name="theme-color">`.
- Adding a fourth style = a token block + skins in `styles.css`, the id in `StyleSlider.astro`, and the id in the inline script's color map in `Layout.astro`.

## Poster style — design system

Inspired by the North Gate Jazz Co-op (Chiang Mai) posters, Blue Note-style cobalt ink drawings, and Bauhaus geometric jazz prints. **Never embed the reference posters as images** — everything is tokens, type and inline SVG.

| Token | Hex | Use |
|---|---|---|
| `night` | `#0E0D0C` | page canvas (Poster values; Workshop and Sketch override these in `styles.css`) |
| `char` / `char-2` / `char-3` | `#171513` / `#1F1C19` / `#2A2622` | card surfaces |
| `paper` / `paper-warm` | `#EFE9DC` / `#F6EAC2` | gallery-print surfaces (services band, live-product cards, venue card) |
| `crimson` | `#D9231A` | numerals, primary CTA fill, active states. **Large text / fills only** — fails AA as small text on night |
| `terra` | `#E85D1A` | eyebrows & small accent text on night (5.5:1) |
| `cobalt` | `#1B4596` | ink on paper (7:1) — too dark for text on night |
| `stage` | `#174936` | badges / secondary fills |
| `cream` / `cream-muted` / `cream-subtle` | `#F2EBDD` / `#B8AE9F` / `#8A8175` | text on night |

Legacy aliases (`ink-*`, `fg*`, `brand`, `accent`) map onto these so old classes still resolve; prefer the new names.

Type: `font-display` (Bebas Neue) for headers and vertical rails, `font-serif` italic (Playfair) for overlapping accents and crimson numerals, `font-sans` (Space Grotesk) body, `font-mono` (JetBrains Mono) for specs/labels.

Patterns:
- **Poster frame** — `.poster-frame` adds a 1px border plus `+` registration marks at the corners via `::before` (inset −7px; don't put it inside `overflow-hidden` parents). Add `.on-paper` on cream surfaces.
- **Side rails** — wrap sections in `PosterSection.astro` with `number` + `rail` (`01 LIVE PRODUCTS`, `02 ARCHITECTURE`, `03 CREATIVE CO-OP`). On `lg+` it renders vertical outlined Bebas lettering overlapped by a crimson Playfair numeral; below `lg` it collapses into the eyebrow line, so there's no horizontal overflow.
- **Surfaces** — each card matches its product's own brand via the optional manifest field `surface` (all products currently use the default `"night"`; set `"paper"` for a product whose own UI is cream). CTA text color is picked automatically by `readableOn(accent)`.
- Sharp corners everywhere in the Poster style (no rounded pills) except device mockups. Product `accentColor` values in the manifest stay within the palette.

## `ecosystem.json` schema (schemaVersion 1)

```jsonc
{
  "schemaVersion": 1,              // bump on breaking changes; consumers should ignore unknown fields
  "updatedAt": "YYYY-MM-DD",
  "creator": {
    "name": "string",
    "handle": "string",
    "portfolioUrl": "https://…",
    "hireUrl": "https://…/about/#hire", // target of the drawer's hire banner
    "hireBannerText": "Need a custom app or extension? Hire me →"
  },
  "products": [
    {
      "id": "kebab-case",            // stable; host apps pass this as currentAppId to exclude themselves
      "name": "string",
      "tagline": "string",           // one-line consumer hook
      "category": "live-product" | "in-progress" | "game",
      "statusBadge": "string",       // e.g. "Live · Chrome Web Store"
      "platformLabel": "string",     // optional short tag on hub cards, e.g. "Chrome Extension"
      "consumerDescription": "string",
      "story": {                     // optional; powers the /products/<id>/ page
        "audience": "string",        // who it's for
        "problem": "string",         // the problem it solves
        "steps": ["string"],         // how it works, in order
        "features": ["string"]       // what you get
      },
      "ctaText": "string",
      "ctaUrl": "https://…",         // store / landing page, or mailto: (no UTM params — appended at runtime to http(s) links only)
      "repoUrl": "https://github.com/…", // optional public source; shown as "View source" in the engineering view
      "utmTag": "string",            // used as utm_campaign
      "engineeringSpecs": {
        "stack": ["string"],
        "architectureHighlight": "string",
        "metrics": "string"
      },
      // optional presentation fields
      "platforms": ["chrome" | "ios" | "android" | "web" | "windows" | "api" | "mobile"],
      "icon": "emoji",
      "accentColor": "#rrggbb",
      "surface": "night" | "paper",  // optional card surface matching the product's brand (default night)
      "imageUrl": "/images/<name>.jpg", // screenshot; optional — see "Product images" below
      "media": { "type": "placeholder" | "image" | "gif" | "video" | "youtube", "src": "" }
    }
  ]
}
```

**UTM convention:** `utm_source=<host app id | "portfolio">`, `utm_medium=ecosystem-drawer | showcase`, `utm_campaign=<target product utmTag>`. The hire banner uses `utm_campaign=hire-banner`.

**Rules when editing the manifest:**
- Never rename or remove an `id` that has shipped in a host app — mark it differently instead.
- Adding fields is non-breaking; removing/renaming required fields requires bumping `schemaVersion` and updating `src/types/ecosystem.ts` and the local types in `EcosystemDrawer.tsx`.
- Keep `ctaUrl` free of UTM params.
- Production URLs live in three places that must stay in sync: `creator.portfolioUrl`/`hireUrl` here, `site`/`base` in `astro.config.mjs`, and `DEFAULT_MANIFEST_URL` in `EcosystemDrawer.tsx` (currently https://itailiors.github.io/portfolio-hub/).

## Product images ("gallery frame")

Current lineup, in display order: `the-woodshed` (main highlight), `heatreel`, `psychoscanner`, `bet-on-dave`, `idea5`.

- Images live in `public/images/` at each product's `imageUrl`: `woodshed.jpg` and `heatreel.png` (real screenshots), `psychoscanner.svg`, `idea5.svg` and `dave.svg` (generated sketch illustrations, see below). 16:9 crops look best; they're shown `object-cover`, centered. Raster screenshots are dimmed slightly (`brightness(0.86)`) until the card is hovered so bright UIs don't glare on the night canvas; `.svg` illustrations are exempt.
- **Sketch illustrations** are generated, not hand-edited: `npm run art` runs `scripts/art/psychoscanner.mjs` (over-the-shoulder phone scanning a bubble sheet, score 142/150), `scripts/art/idea5.mjs` (thinker on a flying triangular pencil past the Great Wall) and `scripts/art/dave.mjs` (ragdolls on a circus high wire, crowd waving betting slips).
- **Sketchbook variants**: `write(name, svg, { marker: { hue } })` also writes `<name>-color.svg`, a "marker on paper" version (night backdrop → paper tinted by `hue`, cream pencil lines → ink, marker colors kept). `lib/products.ts` picks up any `<image>-color.<ext>` next to a product image and the hub shows it only in the Sketchbook style (`.img-sketch` / `.img-default`). Shared helpers in `scripts/art/sketch.mjs` give the pencil look: every layer is drawn twice through `feTurbulence` + `feDisplacementMap` filters (wobble + faint offset re-trace) with hatching patterns for shading. Output is deterministic (seeded PRNG). Edit the script, rerun `npm run art`, rebuild.
- The card always renders the product's SVG art (`JazzPosterArt` card variant) as the base layer. The screenshot is layered on top and fades in only after it decodes. A 404 or broken file triggers `onError` (or is detected after hydration via `img.complete && naturalWidth === 0`), and the art stays visible, so layout never shifts.
- `lib/products.ts` also drops local `imageUrl`s whose file doesn't exist at build time, so missing screenshots aren't requested at all. Rebuild after adding images.
- Art motifs per product live in `MOTIF_BY_PRODUCT` in `JazzPosterArt.tsx`: `keys` (ivory & cobalt piano keys + audio pulses, The Woodshed), `slant` (chaotic crimson/orange slants, Bet on Dave), default `bauhaus` (half disc + equalizer bars).

## Dropping in the full CV

All CV copy lives in `src/data/profile.json`. Nothing in the components is hard-coded except section headings.

- `experience[]` — one entry per role: `company`, `role`, `period`, `location`, `summary`, `highlights[]` (aim for 3–4 quantified bullets), `stack[]`. Order = display order (newest first).
- `education[]` — CS studies.
- `credibility[]` — hero badges.
- `services[]` — "Work With Me" grid (`icon` is one of `server | rocket | puzzle`; add new SVG paths in `sections/Experience.astro`).
- `creative` — `bio`, `venues`, `instruments` (labels), `sessions[]` (YouTube `youtubeId` + title + note; rendered as a click-to-play thumbnail that only loads the youtube-nocookie player on click), `gameJams[]` (optional `soundtrack` URL adds an "OST" link).
- `contact` — email, socials; set `calendly` to switch the main hire CTA to a booking link.

Every field currently containing `TODO` or `YYYY` is a placeholder to replace. When pasting a resume, rewrite bullets as outcome-first ("Cut p99 latency 40% on …"), keep stack arrays short, and run `npm run check` afterwards (Astro infers types from the JSON, so a missing field breaks the build — that's intended).

## Syncing `EcosystemDrawer` to other repos

`src/components/EcosystemDrawer.tsx` is the **source of truth**. It is deliberately self-contained:
- React is its only import — no Tailwind, no aliases, no site types (it declares a structurally-compatible subset locally).
- Inline styles with `all: initial` on the root so it renders identically inside a Shadow DOM / extension popup.
- Exports pure helpers `getRecommendations`, `buildTrackedUrl`, `loadManifest` (fetch + 6h localStorage cache) plus `ECOSYSTEM_DRAWER_VERSION`.

**Chrome extension (HeatReel, WXT):** copy the file verbatim to `components/EcosystemDrawer.tsx` and render
`<EcosystemDrawer currentAppId="heatreel" manifestUrl="https://<domain>/ecosystem.json" />`.
No `host_permissions` needed — the manifest is served with `Access-Control-Allow-Origin: *`. In a content script, mount it in a Shadow DOM root.

**React Native (PsychoScanner, Expo):** RN has no DOM, so reuse the logic, not the view: copy the file, keep the exported helpers and types, and replace the JSX with `View` / `Text` / `Pressable` + `Linking.openURL(buildTrackedUrl(...))`. Swap the localStorage cache for `AsyncStorage` (or `expo-sqlite/kv-store`). Keep the layout contract: product list on top, hire banner occupying the bottom ~20%.

**Sync procedure:**
1. Edit the drawer here; preview it in the "Drop-in widget" section (`DrawerPreview.tsx`).
2. Bump `ECOSYSTEM_DRAWER_VERSION` (semver).
3. Copy to each consumer repo (keep the header comment) and note the version in that repo's commit message. A `diff` against this file should show no changes for the web/extension copy.
4. Content-only changes (new product, new copy) need **no** app releases — just edit `public/ecosystem.json` and redeploy the site.

## Verification checklist

- `npm run build` passes with 0 errors / 0 warnings.
- `curl -I https://itailiors.github.io/portfolio-hub/ecosystem.json` shows `access-control-allow-origin: *` after deploy.
- `npm run build` output has no root-relative `src`/`href` without the `/portfolio-hub` prefix.
- No horizontal scroll at 375px width — in all three styles, on every page.
- Slider: click, drag and arrow keys switch styles; the choice survives a reload with no flash.
