/**
 * EcosystemDrawer — portable "More Tools by Me" cross-promotion drawer.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ PORTABLE FILE. This component is copied verbatim into other repos    │
 * │ (HeatReel Chrome extension, etc.). Rules for keeping it portable:    │
 * │  • Depends on React only — no Tailwind, no Astro, no path aliases.   │
 * │  • Styles are inline objects so it renders inside a Shadow DOM or    │
 * │    extension popup without leaking / inheriting host CSS.            │
 * │  • Types are declared locally (structurally compatible with          │
 * │    src/types/ecosystem.ts in the portfolio repo).                    │
 * │  • Pure helpers (getRecommendations, buildTrackedUrl, loadManifest)  │
 * │    are exported so the React Native port can reuse the logic and    │
 * │    only swap the view layer for <View>/<Text>/<Pressable>.           │
 * │ Source of truth lives in portfolio-hub/src/components/. See CLAUDE.md│
 * └──────────────────────────────────────────────────────────────────────┘
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";

export const ECOSYSTEM_DRAWER_VERSION = "1.0.0";
export const DEFAULT_MANIFEST_URL = "https://example.com/ecosystem.json"; // TODO: set production domain

/* ───────────────────────────── Types ───────────────────────────── */

export type DrawerCategory = "live-product" | "in-progress" | "game";

export interface DrawerProduct {
  id: string;
  name: string;
  tagline: string;
  category: DrawerCategory;
  statusBadge: string;
  ctaText: string;
  ctaUrl: string;
  utmTag: string;
  icon?: string;
  accentColor?: string;
}

export interface DrawerManifest {
  schemaVersion: number;
  creator: {
    name: string;
    hireUrl: string;
    hireBannerText: string;
  };
  products: DrawerProduct[];
}

/* ─────────────────────────── Pure helpers ─────────────────────────── */

/** Products to recommend from inside `currentAppId` (excludes the host app; live first). */
export function getRecommendations(manifest: DrawerManifest, currentAppId: string, limit = 4): DrawerProduct[] {
  const rank: Record<DrawerCategory, number> = { "live-product": 0, "in-progress": 1, game: 2 };
  return manifest.products
    .filter((p) => p.id !== currentAppId)
    .sort((a, b) => rank[a.category] - rank[b.category])
    .slice(0, limit);
}

/** Appends UTM params: source = host app, medium = ecosystem-drawer, campaign = target utmTag. */
export function buildTrackedUrl(url: string, sourceAppId: string, campaign: string, medium = "ecosystem-drawer"): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", sourceAppId);
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

const CACHE_KEY = "ecosystem-manifest-cache-v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function readCache(): DrawerManifest | null {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: DrawerManifest };
    return Date.now() - at < CACHE_TTL_MS ? data : null;
  } catch {
    return null;
  }
}

function writeCache(data: DrawerManifest) {
  try {
    globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Fetches the public manifest with a 6h localStorage cache. Works in browsers, extensions and RN (fetch). */
export async function loadManifest(url = DEFAULT_MANIFEST_URL, signal?: AbortSignal): Promise<DrawerManifest> {
  const cached = readCache();
  if (cached) return cached;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`ecosystem.json HTTP ${res.status}`);
  const data = (await res.json()) as DrawerManifest;
  writeCache(data);
  return data;
}

/* ───────────────────────────── Styles ───────────────────────────── */

const C = {
  bg: "#0d0d10",
  card: "rgba(255,255,255,0.04)",
  cardHover: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.09)",
  fg: "#ededf0",
  muted: "#a1a1aa",
  subtle: "#71717a",
  brand: "#a78bfa",
};

const font = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

const s: Record<string, CSSProperties> = {
  root: {
    all: "initial" as CSSProperties["all"],
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    minHeight: 420,
    background: C.bg,
    color: C.fg,
    fontFamily: font,
    fontSize: 14,
    lineHeight: 1.45,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    overflow: "hidden",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" },
  title: { fontSize: 13, fontWeight: 600, letterSpacing: 0.2, color: C.fg, margin: 0 },
  sub: { fontSize: 11, color: C.subtle, margin: "2px 0 0" },
  close: {
    background: "transparent",
    border: `1px solid ${C.border}`,
    color: C.muted,
    width: 26,
    height: 26,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    lineHeight: "22px",
    fontFamily: font,
  },
  list: { flex: "1 1 80%", overflowY: "auto", padding: "4px 12px 12px", display: "flex", flexDirection: "column", gap: 8 },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 12,
    background: C.card,
    border: `1px solid ${C.border}`,
    textDecoration: "none",
    color: C.fg,
    transition: "background 0.2s ease, transform 0.2s ease",
    cursor: "pointer",
  },
  icon: {
    flex: "0 0 40px",
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    fontSize: 20,
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  itemTag: { fontSize: 12, color: C.muted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
  badge: { fontSize: 10, color: C.subtle, marginTop: 4, fontFamily: "ui-monospace, monospace" },
  cta: { flex: "0 0 auto", fontSize: 11, fontWeight: 600, padding: "6px 10px", borderRadius: 999, color: "#0d0d10" },
  banner: {
    flex: "0 0 20%",
    minHeight: 84,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "0 16px",
    textDecoration: "none",
    color: C.fg,
    background: "linear-gradient(135deg, rgba(139,92,246,0.28), rgba(52,211,153,0.18))",
    borderTop: `1px solid ${C.border}`,
  },
  bannerText: { fontSize: 14, fontWeight: 600, margin: 0 },
  bannerSub: { fontSize: 11, color: C.muted, margin: "2px 0 0" },
  bannerArrow: { fontSize: 18, flex: "0 0 auto" },
  state: { padding: 24, color: C.subtle, fontSize: 12, textAlign: "center" },
};

/* ──────────────────────────── Component ──────────────────────────── */

export interface EcosystemDrawerProps {
  /** id of the host app (from ecosystem.json). Excluded from the list & used as utm_source. */
  currentAppId: string;
  /** Preloaded manifest (skips fetch). */
  manifest?: DrawerManifest;
  /** Where to fetch the manifest when `manifest` isn't provided. */
  manifestUrl?: string;
  /** Max products to show. */
  limit?: number;
  /** Renders a close button when provided. */
  onClose?: () => void;
  /** Header title override. */
  title?: string;
  /** Optional analytics hook. */
  onProductClick?: (product: DrawerProduct) => void;
  style?: CSSProperties;
}

export default function EcosystemDrawer({
  currentAppId,
  manifest: preloaded,
  manifestUrl = DEFAULT_MANIFEST_URL,
  limit = 4,
  onClose,
  title = "More tools by me",
  onProductClick,
  style,
}: EcosystemDrawerProps) {
  const [manifest, setManifest] = useState<DrawerManifest | null>(preloaded ?? null);
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (preloaded) {
      setManifest(preloaded);
      return;
    }
    const ctrl = new AbortController();
    loadManifest(manifestUrl, ctrl.signal)
      .then(setManifest)
      .catch((e: unknown) => {
        if ((e as Error)?.name !== "AbortError") setError(true);
      });
    return () => ctrl.abort();
  }, [preloaded, manifestUrl]);

  const items = useMemo(() => (manifest ? getRecommendations(manifest, currentAppId, limit) : []), [manifest, currentAppId, limit]);

  return (
    <div style={{ ...s.root, ...style }} role="dialog" aria-label={title} data-ecosystem-drawer={ECOSYSTEM_DRAWER_VERSION}>
      <div style={s.header}>
        <div>
          <p style={s.title}>{title}</p>
          {manifest && <p style={s.sub}>from {manifest.creator.name}</p>}
        </div>
        {onClose && (
          <button type="button" style={s.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
      </div>

      <div style={s.list}>
        {!manifest && !error && <div style={s.state}>Loading…</div>}
        {error && <div style={s.state}>Couldn't load recommendations.</div>}
        {items.map((p) => {
          const accent = p.accentColor ?? C.brand;
          const isHover = hovered === p.id;
          return (
            <a
              key={p.id}
              href={buildTrackedUrl(p.ctaUrl, currentAppId, p.utmTag)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...s.item, background: isHover ? C.cardHover : C.card, transform: isHover ? "translateX(2px)" : "none" }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onProductClick?.(p)}
            >
              <span style={{ ...s.icon, background: `${accent}22`, boxShadow: `inset 0 0 0 1px ${accent}44` }} aria-hidden>
                {p.icon ?? "◆"}
              </span>
              <span style={s.itemBody}>
                <p style={s.itemName}>{p.name}</p>
                <p style={s.itemTag}>{p.tagline}</p>
                <p style={s.badge}>{p.statusBadge}</p>
              </span>
              <span style={{ ...s.cta, background: accent }}>{shortCta(p.category)}</span>
            </a>
          );
        })}
      </div>

      {manifest && (
        <a
          href={buildTrackedUrl(manifest.creator.hireUrl, currentAppId, "hire-banner")}
          target="_blank"
          rel="noopener noreferrer"
          style={s.banner}
        >
          <span>
            <p style={s.bannerText}>{manifest.creator.hireBannerText.replace(/\s*(->|→)\s*$/, "")}</p>
            <p style={s.bannerSub}>Backends · MVPs · Extensions — remote</p>
          </span>
          <span style={s.bannerArrow} aria-hidden>
            →
          </span>
        </a>
      )}
    </div>
  );
}

function shortCta(category: DrawerCategory): string {
  if (category === "game") return "Play";
  if (category === "in-progress") return "Preview";
  return "Get";
}
