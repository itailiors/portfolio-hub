import { useState } from "react";
import EcosystemDrawer from "./EcosystemDrawer";
import type { EcosystemManifest } from "../types/ecosystem";

interface Props {
  manifest: EcosystemManifest;
}

const HOSTS = [
  { id: "heatreel", label: "HeatReel", surface: "Chrome extension popup", frame: "browser" as const },
  { id: "psychoscanner", label: "PsychoScanner", surface: "React Native app", frame: "phone" as const },
  { id: "paraglider", label: "Paraglider", surface: "Game menu overlay", frame: "browser" as const },
];

export default function DrawerPreview({ manifest }: Props) {
  const [hostId, setHostId] = useState(HOSTS[0].id);
  const [open, setOpen] = useState(true);
  const host = HOSTS.find((h) => h.id === hostId) ?? HOSTS[0];
  const hostProduct = manifest.products.find((p) => p.id === hostId);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="text-sm text-fg-muted">Simulate the drawer inside:</p>
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
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                h.id === hostId
                  ? "border-brand/60 bg-brand/15 text-fg"
                  : "border-white/10 bg-white/[0.03] text-fg-muted hover:border-white/20 hover:text-fg"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        <ul className="mt-6 space-y-3 text-sm text-fg-muted">
          <li className="flex gap-3">
            <span className="text-accent">●</span>
            <span>
              Host app <code className="font-mono text-fg">{host.id}</code> is filtered out — users only see the <em>other</em> products.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">●</span>
            <span>
              Every link is tagged <code className="font-mono text-fg">utm_source={host.id}</code> so I can see which app drives installs.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">●</span>
            <span>
              Data comes live from <code className="font-mono text-fg">/ecosystem.json</code> (CORS-enabled, cached 6h) — ship a product once, it shows up everywhere.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">●</span>
            <span>The bottom 20% is reserved for the hire-me banner.</span>
          </li>
        </ul>
      </div>

      <div className="mx-auto w-full max-w-[400px]">
        {host.frame === "phone" ? (
          <div className="relative mx-auto h-[600px] w-[300px] rounded-[44px] border border-white/10 bg-ink-900 p-3 shadow-2xl shadow-black/60">
            <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] bg-ink-850">
              <HostScreen name={host.label} surface={host.surface} icon={hostProduct?.icon} onOpen={() => setOpen(true)} />
              {open && (
                <div className="absolute inset-x-0 bottom-0 top-24 animate-fade-up">
                  <EcosystemDrawer
                    currentAppId={host.id}
                    manifest={manifest}
                    onClose={() => setOpen(false)}
                    style={{ borderRadius: "22px 22px 0 0", minHeight: 0 }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-2xl shadow-black/60">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-fg-subtle">
                {host.surface}
              </span>
            </div>
            <div className="relative h-[520px] bg-ink-850">
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
      <div>
        <p className="text-base font-semibold">
          <span className="mr-1.5">{icon}</span>
          {name}
        </p>
        <p className="text-xs text-fg-subtle">{surface}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-fg-muted transition hover:text-fg"
      >
        More from creator
      </button>
    </div>
  );
}
