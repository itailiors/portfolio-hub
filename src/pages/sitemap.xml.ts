import type { APIRoute } from "astro";
import { products, productHref } from "../lib/products";
import { withBase } from "../lib/url";

/**
 * Sitemap for Search Console. (robots.txt is ignored on a github.io project site, so submit
 * this URL in Search Console instead.) Add new static pages to `pages` below.
 */
const pages = ["/", "/about/", "/videos/", "/archive/"];

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(path, site).href;
  const urls = [...pages.map((p) => withBase(p)), ...products.map((p) => productHref(p.id))].map(abs);
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
