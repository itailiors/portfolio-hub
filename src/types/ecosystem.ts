/**
 * Types for /public/ecosystem.json — the public cross-promotion manifest.
 * Keep in sync with the schema documented in CLAUDE.md.
 * Bump `schemaVersion` in the JSON for any breaking change.
 */
export type ProductCategory = "live-product" | "in-progress" | "game";

export interface EngineeringSpecs {
  stack: string[];
  architectureHighlight: string;
  metrics: string;
}

export interface ProductMedia {
  type: "placeholder" | "image" | "gif" | "video" | "youtube";
  src: string;
}

/** Longer "explain it" copy for the product's detail page. */
export interface ProductStory {
  /** Who it's for. */
  audience: string;
  /** The problem it solves. */
  problem: string;
  /** How it works, in order. */
  steps: string[];
  features: string[];
}

export interface EcosystemProduct {
  id: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  statusBadge: string;
  /** Short platform label for the card tag, e.g. "Chrome Extension". */
  platformLabel?: string;
  consumerDescription: string;
  story?: ProductStory;
  ctaText: string;
  ctaUrl: string;
  /** Used as utm_campaign. Consumers add utm_source=<host app id>. */
  utmTag: string;
  engineeringSpecs: EngineeringSpecs;
  // Optional presentation fields
  platforms?: string[];
  icon?: string;
  accentColor?: string;
  /** Public source repository, shown as "View source" in the engineering view. */
  repoUrl?: string;
  /** Card surface matching the product's own brand. Defaults to "night". */
  surface?: "night" | "paper";
  /** Screenshot path or URL. Optional: the UI falls back to generated SVG art if missing or broken. */
  imageUrl?: string;
  media?: ProductMedia;
}

export interface EcosystemCreator {
  name: string;
  handle: string;
  portfolioUrl: string;
  hireUrl: string;
  hireBannerText: string;
}

export interface EcosystemManifest {
  schemaVersion: number;
  updatedAt: string;
  creator: EcosystemCreator;
  products: EcosystemProduct[];
}
