// Shared helpers for the hand-drawn "pencil sketch" product illustrations.
// Each illustration script writes a standalone SVG to public/images/, which the
// ProductShowcase loads through `imageUrl` like any screenshot.
//
// The sketch look: everything in an art group is rendered twice through
// feTurbulence + feDisplacementMap filters (wobbly ink), the second pass offset
// and faint like a pencil re-trace. Hatching patterns add pencil shading.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const C = {
  night: "#0E0D0C",
  char: "#171513",
  char2: "#1F1C19",
  char3: "#2A2622",
  paper: "#EFE9DC",
  paperWarm: "#F6EAC2",
  ink: "#1A1714",
  crimson: "#D9231A",
  crimsonDeep: "#B51C14",
  terra: "#E85D1A",
  cobalt: "#1B4596",
  stage: "#174936",
  cream: "#F2EBDD",
  creamMuted: "#B8AE9F",
  skin: "#D6A987",
  skinShade: "#B98A6A",
};

/** Round to 1 decimal for compact path data. */
export const f = (n) => Math.round(n * 10) / 10;

/** Deterministic PRNG so regenerating gives the same drawing. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const v = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, k) => [a[0] * k, a[1] * k],
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
  len: (a) => Math.hypot(a[0], a[1]),
  norm: (a) => {
    const l = Math.hypot(a[0], a[1]);
    return [a[0] / l, a[1] / l];
  },
};

export const pts = (list) => list.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");

export function defs({ hatch = C.cream } = {}) {
  return `
  <filter id="rA" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="2" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="rB" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="G" yChannelSelector="R"/>
  </filter>
  <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
    <line x1="0" y1="0" x2="0" y2="7" stroke="${hatch}" stroke-width="1.1" stroke-opacity="0.32"/>
  </pattern>
  <pattern id="hatchX" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
    <line x1="0" y1="0" x2="0" y2="7" stroke="${hatch}" stroke-width="1" stroke-opacity="0.22"/>
  </pattern>
  <pattern id="hatchInk" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
    <line x1="0" y1="0" x2="0" y2="6" stroke="${C.ink}" stroke-width="1" stroke-opacity="0.35"/>
  </pattern>`;
}

/** Render `content` as a sketched layer: wobbly main pass + faint offset re-trace. */
export function sketched(id, content, { ghost = 0.2 } = {}) {
  return `
  <defs><g id="${id}">${content}</g></defs>
  <use href="#${id}" filter="url(#rA)"/>
  <use href="#${id}" filter="url(#rB)" transform="translate(2 1.4)" opacity="${ghost}"/>`;
}

/** 4-point sparkle star. */
export function sparkle(x, y, r, color = C.cream) {
  const k = r * 0.28;
  return `<path d="M${f(x)} ${f(y - r)} Q${f(x + k)} ${f(y - k)} ${f(x + r)} ${f(y)} Q${f(x + k)} ${f(y + k)} ${f(x)} ${f(y + r)} Q${f(x - k)} ${f(y + k)} ${f(x - r)} ${f(y)} Q${f(x - k)} ${f(y - k)} ${f(x)} ${f(y - r)} Z" fill="${color}"/>`;
}

export function svgDoc({ width = 1280, height = 720, title, desc, body, hatch }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<defs>${defs({ hatch })}</defs>
${body}
</svg>
`;
}

export function write(name, svg) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const out = join(root, "public", "images", name);
  writeFileSync(out, svg);
  console.log(`wrote public/images/${name} (${(svg.length / 1024).toFixed(1)} KB)`);
}
