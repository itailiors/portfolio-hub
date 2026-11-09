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

export interface EcosystemProduct {
  id: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  statusBadge: string;
  consumerDescription: string;
  ctaText: string;
  ctaUrl: string;
  /** Used as utm_campaign. Consumers add utm_source=<host app id>. */
  utmTag: string;
  engineeringSpecs: EngineeringSpecs;
  // Optional presentation fields
  platforms?: string[];
  icon?: string;
  accentColor?: string;
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
