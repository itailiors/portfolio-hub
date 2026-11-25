<!-- Moved from the root CLAUDE.md. Loads automatically when Claude works on files in this folder. -->

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
