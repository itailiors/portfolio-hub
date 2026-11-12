import { useEffect, useRef, useState, type ReactNode } from "react";
import JazzPosterArt, { motifFor } from "./JazzPosterArt";
import type { EcosystemManifest, EcosystemProduct, ProductCategory } from "../types/ecosystem";

type ViewMode = "user" | "engineering";
type Filter = "all" | ProductCategory;
type Surface = "night" | "paper";

interface Props {
  manifest: EcosystemManifest;
  hireHref?: string;
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live-product", label: "Live" },
  { id: "in-progress", label: "In progress" },
  { id: "game", label: "Games" },
];

const PLATFORM_LABEL: Record<string, string> = {
  chrome: "Chrome Web Store",
  ios: "App Store",
  android: "Google Play",
  web: "Web",
  windows: "Windows",
  api: "API / SDK",
  mobile: "Mobile",
};

/** Per-surface tokens. Live products are printed on gallery paper; the rest sit on the night canvas. */
const THEME: Record<Surface, { card: string; frame: string; text: string; muted: string; subtle: string; pill: string; rule: string; eyebrow: string; metrics: string; flip: string }> = {
  night: {
    card: "card-night",
    frame: "poster-frame",
    text: "text-cream",
    muted: "text-cream-muted",
    subtle: "text-cream-subtle",
    pill: "border-cream/20 text-cream",
    rule: "border-cream/10",
    eyebrow: "eyebrow",
    metrics: "text-terra",
    flip: "border-cream/25 text-cream-muted hover:border-cream hover:text-cream",
  },
  paper: {
    card: "bg-paper-warm",
    frame: "poster-frame on-paper",
    text: "text-paper-ink",
    muted: "text-paper-muted",
    subtle: "text-paper-muted",
    pill: "border-paper-ink/25 text-paper-ink",
    rule: "border-paper-ink/15",
    eyebrow: "eyebrow on-paper",
    metrics: "text-cobalt",
    flip: "border-paper-ink/30 text-paper-ink hover:bg-paper-ink hover:text-paper-warm",
  },
};

function withUtm(url: string, campaign: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "portfolio");
    u.searchParams.set("utm_medium", "showcase");
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

/** Picks near-black or near-white text for the best contrast on `hex`. */
function readableOn(hex: string): string {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? "#FFF8EC" : "#0E0D0C");
}

export default function ProductShowcase({ manifest, hireHref = "#hire" }: Props) {
  const [globalMode, setGlobalMode] = useState<ViewMode>("user");
  const [overrides, setOverrides] = useState<Record<string, ViewMode>>({});
  const [filter, setFilter] = useState<Filter>("all");

  const setGlobal = (mode: ViewMode) => {
    setGlobalMode(mode);
    setOverrides({});
  };

  const products = manifest.products.filter((p) => filter === "all" || p.category === filter);

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-cream/15 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2" role="group" aria-label="Filter products">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`border-b-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
                filter === f.id ? "border-crimson text-cream" : "border-transparent text-cream-subtle hover:text-cream"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ModeToggle mode={globalMode} onChange={setGlobal} />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {products.map((p) => {
          const mode = overrides[p.id] ?? globalMode;
          const index = manifest.products.indexOf(p) + 1;
          return (
            <ProductCard
              key={p.id}
              product={p}
              index={index}
              mode={mode}
              hireHref={hireHref}
              onFlip={() => setOverrides((o) => ({ ...o, [p.id]: mode === "user" ? "engineering" : "user" }))}
            />
          );
        })}
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="relative grid w-full grid-cols-2 border border-cream/25 p-0.5 text-sm sm:inline-grid sm:w-auto" role="radiogroup" aria-label="View mode">
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] bg-crimson transition-transform duration-300 ease-out"
        style={{ transform: mode === "engineering" ? "translateX(100%)" : "translateX(0)" }}
      />
      {(["user", "engineering"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={`relative z-10 whitespace-nowrap px-4 py-2 font-medium transition-colors ${mode === m ? "text-[#fff8ec]" : "text-cream-muted hover:text-cream"}`}
        >
          {m === "user" ? "✨ User View" : "⚙️ Under the Hood"}
        </button>
      ))}
    </div>
  );
}

function ProductCard({
  product: p,
  index,
  mode,
  hireHref,
  onFlip,
}: {
  product: EcosystemProduct;
  index: number;
  mode: ViewMode;
  hireHref: string;
  onFlip: () => void;
}) {
  const accent = p.accentColor ?? "#D9231A";
  // Card surface follows each product's own brand (set in the manifest); night by default.
  const surface: Surface = p.surface === "paper" ? "paper" : "night";
  const t = THEME[surface];
  const isEng = mode === "engineering";

  return (
    <article className={`${t.frame} ${t.card} ${t.text} group flex flex-col`}>
      <header className={`flex items-start justify-between gap-3 border-b ${t.rule} px-5 py-4`}>
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-serif text-3xl font-bold italic leading-none text-crimson">{String(index).padStart(2, "0")}</span>
          <div className="min-w-0">
            <h3 className="font-display text-[28px] leading-[0.95] tracking-wide [overflow-wrap:anywhere]">{p.name}</h3>
            <p className={`mt-1 font-mono text-[11px] uppercase tracking-[0.08em] ${t.muted}`}>{p.statusBadge}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onFlip}
          aria-pressed={isEng}
          className={`shrink-0 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition ${t.flip}`}
          title={isEng ? "Show user view" : "Show engineering view"}
        >
          {isEng ? "✨ User" : "⚙️ Specs"}
        </button>
      </header>

      {/* Both faces share one grid cell so the card height never jumps */}
      <div className="grid flex-1 p-5">
        <Face active={!isEng}>
          <div className={`relative overflow-hidden border ${t.rule}`}>
            <MediaSlot product={p} surface={surface} />
            <span
              className="absolute left-3 top-3 grid h-11 w-11 place-items-center text-xl shadow-lg"
              style={{ background: "#0E0D0C", boxShadow: `inset 0 0 0 2px ${accent}` }}
              aria-hidden
            >
              {p.icon}
            </span>
          </div>
          <p className="mt-5 font-serif text-2xl font-semibold italic leading-tight">{p.tagline}</p>
          <p className={`mt-2 text-sm leading-relaxed ${t.muted}`}>{p.consumerDescription}</p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
            <a
              href={withUtm(p.ctaUrl, p.utmTag)}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isEng ? -1 : 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition hover:brightness-110"
              style={{ background: accent, color: readableOn(accent) }}
            >
              Try It Now · {p.ctaText} <span aria-hidden>↗</span>
            </a>
            {p.platforms?.map((pl) => (
              <span key={pl} className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${t.pill}`}>
                {PLATFORM_LABEL[pl] ?? pl}
              </span>
            ))}
          </div>
        </Face>

        <Face active={isEng}>
          <p className={t.eyebrow}>Stack</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.engineeringSpecs.stack.map((s) => (
              <span key={s} className={`border px-2 py-0.5 font-mono text-xs ${t.pill}`}>
                {s}
              </span>
            ))}
          </div>
          <p className={`${t.eyebrow} mt-6`}>Architecture</p>
          <p className={`mt-2 text-sm leading-relaxed ${t.muted}`}>{p.engineeringSpecs.architectureHighlight}</p>
          <p className={`${t.eyebrow} mt-6`}>Metrics</p>
          <p className={`mt-2 font-mono text-xs leading-relaxed ${t.metrics}`}>{p.engineeringSpecs.metrics}</p>
          <div className="mt-auto pt-6">
            <a
              href={hireHref}
              tabIndex={isEng ? 0 : -1}
              className="btn-crimson px-4 py-2.5 text-sm"
            >
              Need something like this built? Let's talk. <span aria-hidden>→</span>
            </a>
          </div>
        </Face>
      </div>
    </article>
  );
}

function Face({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      className={`col-start-1 row-start-1 flex min-w-0 flex-col transition-all duration-300 ease-out ${
        active ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

type ImageState = "loading" | "loaded" | "error";

/**
 * "Gallery frame" media slot.
 * The product's SVG poster art is always rendered as the base layer, which reserves
 * the 16:9 box. If `imageUrl` is set, the screenshot is layered on top and fades in
 * only once it has actually decoded. On a 404 or a broken file it is removed and the
 * art stays visible, so a missing .jpg never shows a broken image or shifts layout.
 */
function MediaSlot({ product: p, surface }: { product: EcosystemProduct; surface: Surface }) {
  if (p.media?.src && p.media.type === "video") {
    return <video src={p.media.src} autoPlay muted loop playsInline className="block aspect-video w-full object-cover" />;
  }
  const src = p.imageUrl || (p.media?.src && (p.media.type === "image" || p.media.type === "gif") ? p.media.src : undefined);
  return <GalleryFrame product={p} surface={surface} src={src} />;
}

function GalleryFrame({ product: p, surface, src }: { product: EcosystemProduct; surface: Surface; src?: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<ImageState>(src ? "loading" : "error");

  useEffect(() => {
    setState(src ? "loading" : "error");
    // The <img> is server-rendered, so it may finish (or fail) before React hydrates and
    // attaches onLoad/onError. Read its final state directly in that case.
    const img = imgRef.current;
    if (src && img?.complete) setState(img.naturalWidth > 0 ? "loaded" : "error");
  }, [src]);

  return (
    <div className="relative">
      <JazzPosterArt
        variant="card"
        motif={motifFor(p.id)}
        seed={p.id}
        accent={p.accentColor ?? "#D9231A"}
        surface={surface}
        className="block aspect-video w-full"
        label={`${p.name} artwork`}
        animate={state !== "loaded"}
      />
      {src && state !== "error" && (
        <img
          ref={imgRef}
          src={src}
          alt={`${p.name} screenshot`}
          loading="lazy"
          decoding="async"
          data-state={state}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className="media-img absolute inset-0 h-full w-full object-cover object-center"
        />
      )}
      {state !== "loaded" && (
        <span className="absolute bottom-1.5 right-2 bg-night/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-cream-muted">
          screenshot coming soon
        </span>
      )}
    </div>
  );
}
