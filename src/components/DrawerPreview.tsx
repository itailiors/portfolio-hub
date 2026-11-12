import { useState } from "react";
import EcosystemDrawer from "./EcosystemDrawer";
import type { EcosystemManifest } from "../types/ecosystem";

interface Props {
  manifest: EcosystemManifest;
}

const HOSTS = [
  { id: "heatreel", label: "HeatReel", surface: "Chrome extension popup", frame: "browser" as const },
  { id: "psychoscanner", label: "PsychoScanner", surface: "React Native app", frame: "phone" as const },
  { id: "the-woodshed", label: "The Woodshed", surface: "Web app sidebar", frame: "browser" as const },
];

const NOTES = (hostId: string) => [
  <>
    Host app <code className="font-mono text-cream">{hostId}</code> is filtered out — users only see the <em>other</em> products.
  </>,
  <>
    Every link is tagged <code className="break-all font-mono text-cream">utm_source={hostId}</code> so I can see which app drives installs.
  </>,
  <>
    Data comes live from <code className="font-mono text-cream">/ecosystem.json</code> (CORS-enabled, cached 6h) — ship a product once, it shows up
    everywhere.
  </>,
  <>The bottom 20% is reserved for the crimson hire-me banner.</>,
];

export default function DrawerPreview({ manifest }: Props) {
  const [hostId, setHostId] = useState(HOSTS[0].id);
  const [open, setOpen] = useState(true);
  const host = HOSTS.find((h) => h.id === hostId) ?? HOSTS[0];
  const hostProduct = manifest.products.find((p) => p.id === hostId);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
      <div className="min-w-0">
        <p className="eyebrow">Simulate the drawer inside</p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Host app">
          {HOSTS.map((h) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={h.id === hostId}
              onClick={() => {
                setHostId(h.id);
                setOpen(true);
              }}
              className={`border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition ${
                h.id === hostId ? "border-crimson bg-crimson text-[#fff8ec]" : "border-cream/25 text-cream-muted hover:border-cream hover:text-cream"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        <ol className="mt-8 space-y-4 text-sm text-cream-muted">
          {NOTES(host.id).map((n, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-serif text-lg font-bold italic leading-none text-crimson">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">{n}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto w-full max-w-[400px]">
        {host.frame === "phone" ? (
          <div className="relative mx-auto h-[600px] w-full max-w-[300px] rounded-[44px] border border-cream/15 bg-char p-3 shadow-2xl shadow-black/60">
            <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] bg-night">
              <HostScreen name={host.label} surface={host.surface} icon={hostProduct?.icon} onOpen={() => setOpen(true)} />
              {open && (
                <div className="absolute inset-x-0 bottom-0 top-24 animate-fade-up">
                  <EcosystemDrawer
                    currentAppId={host.id}
                    manifest={manifest}
                    onClose={() => setOpen(false)}
                    style={{ borderRadius: "18px 18px 0 0", minHeight: 0 }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="poster-frame bg-char shadow-2xl shadow-black/60">
            <div className="flex items-center gap-1.5 border-b border-cream/10 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-crimson" />
              <span className="h-2.5 w-2.5 rounded-full bg-terra" />
              <span className="h-2.5 w-2.5 rounded-full bg-cream/30" />
              <span className="ml-3 truncate bg-night px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-cream-subtle">{host.surface}</span>
            </div>
            <div className="relative h-[520px] bg-night">
              <HostScreen name={host.label} surface={host.surface} icon={hostProduct?.icon} onOpen={() => setOpen(true)} />
              {open && (
                <div className="absolute inset-x-3 bottom-3 top-20 animate-fade-up">
                  <EcosystemDrawer currentAppId={host.id} manifest={manifest} onClose={() => setOpen(false)} style={{ minHeight: 0 }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HostScreen({ name, surface, icon, onOpen }: { name: string; surface: string; icon?: string; onOpen: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-10">
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none tracking-wide text-cream">
          <span className="mr-1.5">{icon}</span>
          {name}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-cream-subtle">{surface}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 border border-cream/25 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-cream-muted transition hover:border-cream hover:text-cream"
      >
        More from creator
      </button>
    </div>
  );
}
