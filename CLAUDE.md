# Portfolio Hub — Product Studio & Interactive Portfolio

Personal site with two jobs:

1. **Product ecosystem hub (B2C)** — users of HeatReel (Chrome extension), PsychoScanner (React Native app) and the Unity games discover and cross-install the other products.
2. **Freelance / hiring funnel (B2B)** — shows founders and hiring managers end-to-end product ability, backed by eBay, Angor.io and military full-stack experience.

## Stack

- **Astro 7** (static output) + **@astrojs/react** islands (React 19)
- **Tailwind CSS 4** via `@tailwindcss/vite` — no `tailwind.config`; design tokens live in `@theme` in `src/styles/global.css`
- TypeScript 6 (strict) — `@astrojs/check` does not support TS 7 yet, don't upgrade past `^6`
- Deploy target: **Vercel** (`vercel.json` sets CORS headers on `/ecosystem.json`)

## Commands

```bash
npm run dev       # http://localhost:4321
npm run check     # astro check — must be 0 errors / 0 warnings
npm run build     # astro check && astro build → dist/
npm run preview
```

## Layout

```
public/
  ecosystem.json          ← PUBLIC cross-promo manifest (fetched by external apps; CORS via vercel.json)
  favicon.svg
src/
  data/profile.json       ← CV timeline, services, creative bio — all copy for the CV sections
  types/ecosystem.ts      ← TS types for ecosystem.json
  styles/global.css       ← Tailwind import, @theme tokens, .glass / .eyebrow / .text-gradient helpers
  layouts/Layout.astro
  pages/index.astro       ← homepage; imports ../../public/ecosystem.json as the single source of truth
  components/
    ProductShowcase.tsx   ← React island: filter chips + global "✨ User View / ⚙️ Under the Hood" toggle + per-card flip
    EcosystemDrawer.tsx   ← PORTABLE drop-in "More tools by me" drawer (see sync rules below)
    DrawerPreview.tsx     ← site-only wrapper that simulates the drawer inside each host app
    sections/             ← static Astro sections: Nav, Hero, Experience (+ Services), CreativeLab, Hire, SectionHeader
vercel.json
```

Design language: dark-only, Linear/Raycast/Vercel-ish. Use the `ink-*`, `fg`, `fg-muted`, `fg-subtle`, `brand`, `accent` tokens and the `.glass` / `.glass-hover` utilities rather than raw colors. Per-product accent colors come from `accentColor` in the manifest.

## `ecosystem.json` schema (schemaVersion 1)

```jsonc
{
  "schemaVersion": 1,              // bump on breaking changes; consumers should ignore unknown fields
  "updatedAt": "YYYY-MM-DD",
  "creator": {
    "name": "string",
    "handle": "string",
    "portfolioUrl": "https://…",
    "hireUrl": "https://…/#hire",   // target of the drawer's hire banner
    "hireBannerText": "Need a custom app or extension? Hire me →"
  },
  "products": [
    {
      "id": "kebab-case",            // stable; host apps pass this as currentAppId to exclude themselves
      "name": "string",
      "tagline": "string",           // one-line consumer hook
      "category": "live-product" | "in-progress" | "game",
      "statusBadge": "string",       // e.g. "Live · Chrome Web Store"
      "consumerDescription": "string",
      "ctaText": "string",
      "ctaUrl": "https://…",         // store / landing page (no UTM params — they're appended at runtime)
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
- Replace `https://example.com` placeholders (here, in `creator`, in `astro.config.mjs` `site`, and `DEFAULT_MANIFEST_URL` in `EcosystemDrawer.tsx`) once the domain is live.

## Dropping in the full CV

All CV copy lives in `src/data/profile.json`. Nothing in the components is hard-coded except section headings.

- `experience[]` — one entry per role: `company`, `role`, `period`, `location`, `summary`, `highlights[]` (aim for 3–4 quantified bullets), `stack[]`. Order = display order (newest first).
- `education[]` — CS studies.
- `credibility[]` — hero badges.
- `services[]` — "Work With Me" grid (`icon` is one of `server | rocket | puzzle`; add new SVG paths in `sections/Experience.astro`).
- `creative` — `bio`, `instruments[].youtubeId` (empty → placeholder tile; set a YouTube video id to embed via youtube-nocookie), `gameJams[]`.
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
- `curl -I https://<domain>/ecosystem.json` shows `access-control-allow-origin: *` after deploy.
- No horizontal scroll at 375px width.
