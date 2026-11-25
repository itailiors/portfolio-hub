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

## Where the details live

Reference sections were moved out of this file to keep every session cheap. Nested `CLAUDE.md` files load automatically when you work in their folder; files in `docs/` must be read first.

- `src/styles/CLAUDE.md` — site styles (Poster · Workshop · Sketch), design tokens, per-style skins, slider and wipe, Poster design system
- `src/lib/CLAUDE.md` — YouTube channels & videos (`youtube.ts`, `VideoCard`, `ChannelCard`)
- `src/data/CLAUDE.md` — `profile.json` / CV fields
- `src/components/CLAUDE.md` — the portable `EcosystemDrawer` and its sync procedure to HeatReel / PsychoScanner
- **Before editing `public/ecosystem.json` or `src/types/ecosystem.ts`, read `docs/ecosystem-schema.md`.** Never rename or remove a shipped product `id`; production URLs live in three places that must stay in sync.
- **Before touching product images, `public/images/` or `scripts/art/`, read `docs/product-images.md`.**
- Don't put `CLAUDE.md` or notes in `public/` — everything there is deployed.

## Definition of done

- `npm run check` → 0 errors / 0 warnings (a Stop hook runs it automatically when `.astro`/`.ts`/`.tsx` files changed).
- For UI changes, also walk the "Verification checklist" below in the browser preview, in all three styles.
- Report what you verified. Never say "done" without the check passing.

## Verification checklist

- `npm run build` passes with 0 errors / 0 warnings.
- `curl -I https://itailiors.github.io/portfolio-hub/ecosystem.json` shows `access-control-allow-origin: *` after deploy.
- `npm run build` output has no root-relative `src`/`href` without the `/portfolio-hub` prefix.
- No horizontal scroll at 375px width — in all three styles, on every page.
- Slider: click, drag and arrow keys switch styles; the choice survives a reload with no flash.
