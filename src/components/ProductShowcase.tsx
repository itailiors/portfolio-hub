import { useState, type ReactNode } from "react";
import type { EcosystemManifest, EcosystemProduct, ProductCategory } from "../types/ecosystem";

type ViewMode = "user" | "engineering";
type Filter = "all" | ProductCategory;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-full px-3 py-1 text-sm transition ${
                filter === f.id ? "bg-white/10 text-fg" : "text-fg-subtle hover:text-fg"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ModeToggle mode={globalMode} onChange={setGlobal} />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {products.map((p) => {
          const mode = overrides[p.id] ?? globalMode;
          return (
            <ProductCard
              key={p.id}
              product={p}
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
    <div className="relative inline-grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1 text-sm" role="radiogroup" aria-label="View mode">
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/10 shadow-inner transition-transform duration-300 ease-out"
        style={{ transform: mode === "engineering" ? "translateX(100%)" : "translateX(0)" }}
      />
      {(["user", "engineering"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={`relative z-10 whitespace-nowrap rounded-full px-4 py-1.5 transition-colors ${mode === m ? "text-fg" : "text-fg-subtle hover:text-fg-muted"}`}
        >
          {m === "user" ? "✨ User View" : "⚙️ Under the Hood"}
        </button>
      ))}
    </div>
  );
}

function ProductCard({
  product: p,
  mode,
  hireHref,
  onFlip,
}: {
  product: EcosystemProduct;
  mode: ViewMode;
  hireHref: string;
  onFlip: () => void;
}) {
  const accent = p.accentColor ?? "#a78bfa";
  const isEng = mode === "engineering";

  return (
    <article
      className="glass glass-hover group relative flex flex-col overflow-hidden rounded-2xl"
      style={{ ["--accent" as string]: accent }}
    >
      {/* accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-35"
        style={{ background: accent }}
      />

      <header className="relative flex items-start justify-between gap-3 p-5 pb-0">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
            style={{ background: `${accent}1f`, boxShadow: `inset 0 0 0 1px ${accent}40` }}
            aria-hidden
          >
            {p.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{p.name}</h3>
            <p className="font-mono text-[11px] text-fg-subtle">{p.statusBadge}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onFlip}
          aria-pressed={isEng}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-fg-muted transition hover:border-white/20 hover:text-fg"
          title={isEng ? "Show user view" : "Show engineering view"}
        >
          {isEng ? "✨ User" : "⚙️ Specs"}
        </button>
      </header>

      {/* Both faces share one grid cell so the card height never jumps */}
      <div className="relative grid flex-1 p-5">
        <Face active={!isEng}>
          <MediaPlaceholder product={p} />
          <p className="mt-4 text-lg font-medium leading-snug">{p.tagline}</p>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.consumerDescription}</p>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
            <a
              href={withUtm(p.ctaUrl, p.utmTag)}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isEng ? -1 : 0}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-110"
              style={{ background: accent }}
            >
              Try It Now · {p.ctaText} <span aria-hidden>↗</span>
            </a>
            {p.platforms?.map((pl) => (
              <span key={pl} className="rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-fg-subtle">
                {PLATFORM_LABEL[pl] ?? pl}
              </span>
            ))}
          </div>
        </Face>

        <Face active={isEng}>
          <p className="eyebrow">Stack</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.engineeringSpecs.stack.map((t) => (
              <span key={t} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-fg">
                {t}
              </span>
            ))}
          </div>
          <p className="eyebrow mt-5">Architecture</p>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.engineeringSpecs.architectureHighlight}</p>
          <p className="eyebrow mt-5">Metrics</p>
          <p className="mt-2 font-mono text-xs leading-relaxed text-accent">{p.engineeringSpecs.metrics}</p>
          <div className="mt-auto pt-5">
            <a
              href={hireHref}
              tabIndex={isEng ? 0 : -1}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg underline decoration-white/20 underline-offset-4 transition hover:decoration-brand"
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
      className={`col-start-1 row-start-1 flex flex-col transition-all duration-400 ease-out ${
        active ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

function MediaPlaceholder({ product: p }: { product: EcosystemProduct }) {
  const accent = p.accentColor ?? "#a78bfa";
  if (p.media?.src && (p.media.type === "image" || p.media.type === "gif")) {
    return <img src={p.media.src} alt={`${p.name} preview`} loading="lazy" className="aspect-video w-full rounded-xl object-cover" />;
  }
  if (p.media?.src && p.media.type === "video") {
    return <video src={p.media.src} autoPlay muted loop playsInline className="aspect-video w-full rounded-xl object-cover" />;
  }
  return (
    <div
      className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-xl border border-white/5"
      style={{
        background: `linear-gradient(120deg, ${accent}26, transparent 40%, ${accent}14 70%, transparent)`,
        backgroundSize: "200% 100%",
      }}
    >
      <div className="absolute inset-0 animate-shimmer" style={{ background: `linear-gradient(90deg, transparent, ${accent}18, transparent)`, backgroundSize: "200% 100%" }} />
      <span className="text-5xl drop-shadow-lg" aria-hidden>
        {p.icon}
      </span>
      <span className="absolute bottom-2 right-3 font-mono text-[10px] text-fg-subtle">demo video / gif placeholder</span>
    </div>
  );
}
