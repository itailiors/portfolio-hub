/**
 * Prefix a root-relative path ("/images/x.png") with the deploy base path
 * (e.g. "/portfolio-hub" on GitHub Pages). Absolute URLs, anchors and mailto:
 * links pass through unchanged.
 */
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path}`;
}
