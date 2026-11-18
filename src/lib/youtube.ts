/**
 * Build-time YouTube feeds for the studio channels (profile.json → channels).
 *
 * Each channel's public RSS feed (latest ~15 uploads) is fetched once per build, so new uploads
 * appear after the next deploy (the Pages workflow also rebuilds daily). If a feed can't be
 * fetched, that channel simply has no videos and the pages fall back to a "subscribe" card.
 */
import profile from "../data/profile.json";
import type { EcosystemProduct } from "../types/ecosystem";

export type ChannelId = "apps" | "games";

export interface Channel {
  id: ChannelId;
  name: string;
  handle: string;
  url: string;
  channelId: string;
  covers: string;
  blurb: string;
}

export interface Video {
  id: string;
  title: string;
  published: string;
  isShort: boolean;
  channel: ChannelId;
  /** Video description (used only to match videos to products). */
  description: string;
}

export const channels = profile.channels as Channel[];
export const channelById = (id: ChannelId) => channels.find((c) => c.id === id)!;

/** Games go to the games channel; everything else is an application. */
export const channelFor = (p: Pick<EcosystemProduct, "category">): Channel => channelById(p.category === "game" ? "games" : "apps");

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** "Cool video 🔥 #shorts #chromeextension" → "Cool video 🔥" */
const cleanTitle = (t: string) => decode(t).replace(/(\s+#[\p{L}\p{N}_]+)+\s*$/u, "").trim();

async function fetchChannel(c: Channel): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${c.channelId}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
      const pick = (re: RegExp) => e.match(re)?.[1] ?? "";
      const id = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const href = pick(/<link rel="alternate" href="([^"]+)"/);
      return {
        id,
        title: cleanTitle(pick(/<title>([^<]*)<\/title>/)),
        published: pick(/<published>([^<]+)<\/published>/),
        isShort: href.includes("/shorts/"),
        channel: c.id,
        description: decode(pick(/<media:description>([\s\S]*?)<\/media:description>/)),
      };
    });
  } catch (err) {
    console.warn(`[youtube] couldn't load the ${c.name} feed: ${(err as Error).message}`);
    return [];
  }
}

let cache: Promise<Record<ChannelId, Video[]>> | undefined;

/** Latest uploads per channel, newest first. Fetched once per build. */
export function getVideos(): Promise<Record<ChannelId, Video[]>> {
  cache ??= Promise.all(channels.map(async (c) => [c.id, await fetchChannel(c)] as const)).then((pairs) => {
    const out = { apps: [], games: [] } as Record<ChannelId, Video[]>;
    for (const [id, vids] of pairs) out[id] = vids.sort((a, b) => b.published.localeCompare(a.published));
    return out;
  });
  return cache;
}

/** Videos about a product: its channel's uploads whose title or description mentions the product's name. */
export async function videosFor(p: EcosystemProduct): Promise<Video[]> {
  const all = await getVideos();
  const needle = p.name.toLowerCase();
  return all[channelFor(p).id].filter((v) => `${v.title} ${v.description}`.toLowerCase().includes(needle));
}
