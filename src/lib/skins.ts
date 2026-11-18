/**
 * Per-product presentation for the hub, per style. Site-only (not part of the public manifest).
 *
 * - sketch:   card fill + ink (and button colors on dark fills) for the Sketchbook style
 * - mat:      panel material for the Workshop style
 * - layout:   "split" = text beside media (media-first flips it), "stack" = media on top
 * - span:     column span in the 12-column desktop bento
 */
export interface ProductSkin {
  sketch: { bg: string; ink: string; btnBg?: string; btnInk?: string };
  mat: "wood" | "steel" | "slate" | "parchment";
  layout: "split" | "split-media-first" | "stack";
  span: string;
  /** Workshop copper pipes leaving this card (desktop bento), with an optional position. */
  pipes?: { dir: "right" | "left" | "down"; at?: string }[];
}

const SKINS: Record<string, ProductSkin> = {
  "the-woodshed": {
    sketch: { bg: "#f5e9cf", ink: "#1e2430" },
    mat: "wood",
    layout: "split",
    span: "xl:col-span-6",
    pipes: [{ dir: "left", at: "30%" }, { dir: "right", at: "38%" }, { dir: "down", at: "22%" }],
  },
  heatreel: {
    sketch: { bg: "linear-gradient(150deg, #f6a93b, #f07a3e)", ink: "#1e1410" },
    mat: "steel",
    layout: "stack",
    span: "xl:col-span-3",
    pipes: [{ dir: "right", at: "62%" }],
  },
  psychoscanner: {
    sketch: { bg: "#2f6345", ink: "#f7f3e8", btnBg: "#f7f3e8", btnInk: "#1e2430" },
    mat: "slate",
    layout: "stack",
    span: "xl:col-span-3",
  },
  "bet-on-dave": {
    sketch: { bg: "#fbf8f1", ink: "#1e2430" },
    mat: "parchment",
    layout: "split",
    span: "xl:col-span-7",
    pipes: [{ dir: "right", at: "55%" }],
  },
  idea5: {
    sketch: { bg: "#7a2621", ink: "#f7ede4", btnBg: "#f7ede4", btnInk: "#1e2430" },
    mat: "slate",
    layout: "split-media-first",
    span: "xl:col-span-5",
  },
};

const FALLBACK: ProductSkin = {
  sketch: { bg: "#faf3e3", ink: "#1e2430" },
  mat: "slate",
  layout: "stack",
  span: "xl:col-span-4",
};

export const skinFor = (id: string): ProductSkin => SKINS[id] ?? FALLBACK;
