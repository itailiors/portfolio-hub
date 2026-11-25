# SEO: portfolio-hub

Maintained by the shared SEO expert (`claude-projects/SEO`, run `/seo-audit portfolio-hub` there).

- **Channel:** web (GitHub Pages project site, base `/portfolio-hub`)
- **Live URL:** https://itailiors.github.io/portfolio-hub/
- **Last audit:** 2026-11-25  **Next optimize:** 2027-02-03

## Done (2026-11-25)
- Woodshed links fixed (they pointed to a 404).
- Layout: `og:image` and `twitter:image` (large card) on product pages, JSON-LD (`WebSite` + `Person` on home, `SoftwareApplication`/`WebApplication`/`MobileApplication` per product), more descriptive home title.
- `sitemap.xml` generated at build (`src/pages/sitemap.xml.ts`). Add new static pages to its `pages` list.

## Open
1. Submit `https://itailiors.github.io/portfolio-hub/sitemap.xml` in Google Search Console (verify the site first). robots.txt is ignored on a github.io project site.
2. Product media is a placeholder for most products: add real screenshots (jpg/png) so share cards work. Share images must be jpg/png (SVG is skipped).
3. Home page has no static text describing each product's purpose in search words (jazz reharmonization, YouTube highlights, ...). Add a short intro paragraph.
4. A custom domain would give a cleaner URL and no base path. If you move, update `site`/`base`, the sitemap and all canonical URLs.
5. Core Web Vitals not measured: the Google Fonts request loads ten font families. Trim to the ones each style uses.

## Could not check
Search Console data, rankings, page speed scores.
