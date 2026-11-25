<!-- Moved from the root CLAUDE.md. Loads automatically when Claude works on files in this folder. -->

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
