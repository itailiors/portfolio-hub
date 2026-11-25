<!-- Moved from the root CLAUDE.md. Loads automatically when Claude works on files in this folder. -->

## YouTube channels & videos

Two studio channels live in `profile.json` → `channels` (also `contact.youtubeApps` / `contact.youtubeGames`); `contact.youtube` (@itai171) stays the personal music channel.

| id | Channel | For |
|---|---|---|
| `apps` | Infilimit Applications (@InfilimitApplications) | apps & extensions: HeatReel, PsychoScanner, future apps |
| `games` | Infilimit Games (@InfilimitGames) | Bet on Dave series, dev vlogs, future games |

- `src/lib/youtube.ts` fetches each channel's public RSS feed (`feeds/videos.xml?channel_id=…`, latest ~15 uploads) **at build time**, once per build. New uploads appear on the next deploy. A failed fetch only logs a warning; the pages then show the channel card without videos.
- A product's videos = uploads on its channel (`category: "game"` → games, else apps) whose **title or description** mentions the product's `name`. Put the product name in the video title or description to have it show on that product's page.
- `hub/VideoCard.astro` is a click-to-play thumbnail (the youtube-nocookie player loads only on click); include `hub/VideoScript.astro` once on any page that uses it. `hub/ChannelCard.astro` is the channel + subscribe block.
