<!-- Moved from the root CLAUDE.md. Loads automatically when Claude works on files in this folder. -->

## Dropping in the full CV

All CV copy lives in `src/data/profile.json`. Nothing in the components is hard-coded except section headings.

- `experience[]` — one entry per role: `company`, `role`, `period`, `location`, `summary`, `highlights[]` (aim for 3–4 quantified bullets), `stack[]`. Order = display order (newest first).
- `education[]` — CS studies.
- `credibility[]` — hero badges.
- `services[]` — "Work With Me" grid (`icon` is one of `server | rocket | puzzle`; add new SVG paths in `sections/Experience.astro`).
- `creative` — `bio`, `venues`, `instruments` (labels), `sessions[]` (YouTube `youtubeId` + title + note; rendered as a click-to-play thumbnail that only loads the youtube-nocookie player on click), `gameJams[]` (optional `soundtrack` URL adds an "OST" link).
- `contact` — email, socials; set `calendly` to switch the main hire CTA to a booking link.

Every field currently containing `TODO` or `YYYY` is a placeholder to replace. When pasting a resume, rewrite bullets as outcome-first ("Cut p99 latency 40% on …"), keep stack arrays short, and run `npm run check` afterwards (Astro infers types from the JSON, so a missing field breaks the build — that's intended).
