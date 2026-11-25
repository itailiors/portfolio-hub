<!-- Moved from the root CLAUDE.md. The root CLAUDE.md tells Claude when to read this file. -->

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
