/**
 * Build-time product helpers shared by the hub, the detail pages and the About page.
 * Reads the public manifest (the same file external apps fetch at /ecosystem.json).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import ecosystemJson from "../../public/ecosystem.json";
import type { EcosystemManifest, EcosystemProduct } from "../types/ecosystem";
import { withBase } from "./url";

const raw = ecosystemJson as EcosystemManifest;

export interface HubProduct extends EcosystemProduct {
  /** Image used by the Poster and Workshop styles (base path applied). */
  image?: string;
  /** Image used by the Sketchbook style: a `-color` variant when one exists, else `image`. */
  imageSketch?: string;
}

const isLocal = (url?: string): url is string => !!url && url.startsWith("/");
const inPublic = (url: string) => existsSync(join(process.cwd(), "public", url));

/**
 * Local imageUrls whose file doesn't exist are dropped, so missing screenshots are never
 * requested (the card shows its SVG art instead). Remote URLs pass through untouched.
 */
function resolveImage(url?: string): string | undefined {
  if (!isLocal(url)) return url;
  return inPublic(url) ? withBase(url) : undefined;
}

/** `/images/idea5.svg` → `/images/idea5-color.svg` if that file exists. */
function resolveSketch(url?: string): string | undefined {
  if (!isLocal(url)) return resolveImage(url);
  const color = url.replace(/(\.[a-z0-9]+)$/i, "-color$1");
  return inPublic(color) ? withBase(color) : resolveImage(url);
}

export const products: HubProduct[] = raw.products.map((p) => ({
  ...p,
  imageUrl: resolveImage(p.imageUrl),
  image: resolveImage(p.imageUrl),
  imageSketch: resolveSketch(p.imageUrl),
}));

/** Manifest with resolved image URLs, for the React islands. */
export const manifest: EcosystemManifest = { ...raw, products };

export const productHref = (id: string) => withBase(`/products/${id}/`);

export const isWeb = (url: string) => /^https?:\/\//i.test(url);

/** Adds site UTM params to http(s) links; mailto: and other schemes pass through untouched. */
export function withUtm(url: string, campaign: string, medium = "showcase"): string {
  if (!isWeb(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "portfolio");
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

/** Filter group a product belongs to on the hub. */
export type HubFilter = "web" | "extension" | "desktop" | "mobile" | "game";

export function filtersFor(p: EcosystemProduct): HubFilter[] {
  const out = new Set<HubFilter>();
  if (p.category === "game") out.add("game");
  for (const pl of p.platforms ?? []) {
    if (pl === "chrome") out.add("extension");
    if (pl === "windows" && p.category !== "game") out.add("desktop");
    if (pl === "web") out.add("web");
    if (pl === "ios" || pl === "android" || pl === "mobile") out.add("mobile");
  }
  return [...out];
}

export const HUB_FILTERS: { id: "all" | HubFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "extension", label: "Extensions" },
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "game", label: "Games" },
];

/** Honest, countable stats for the hub's stats strip. */
export function hubStats(jamCount: number) {
  const platforms = new Set<string>();
  for (const p of products) {
    for (const pl of p.platforms ?? []) platforms.add(pl === "ios" || pl === "android" ? "mobile" : pl);
  }
  return [
    { value: products.length, label: "products" },
    { value: products.filter((p) => p.category === "live-product").length, label: "live now" },
    { value: platforms.size, label: "platforms" },
    { value: jamCount, label: "game-jam builds" },
  ];
}

/** Picks near-black or near-white text for the best contrast on `hex`. */
export function readableOn(hex: string): string {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? "#FFF8EC" : "#0E0D0C";
}
