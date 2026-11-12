// PsychoScanner: over-the-shoulder pencil sketch of someone holding their phone
// above a filled bubble answer sheet, the screen revealing their score.
// Run: node scripts/art/psychoscanner.mjs  → public/images/psychoscanner.svg

import { C, f, pts, rng, sketched, sparkle, svgDoc, v, write } from "./sketch.mjs";

const APP = { orange: "#C2410C", bg: "#F3F4F6", text: "#111827", muted: "#6B7280", track: "#E5E7EB" };
const SANS = "Segoe UI, Roboto, Helvetica, Arial, sans-serif";
const r = rng(42);

// ── scene geometry ──────────────────────────────────────────────────────────
const deskTop = (x) => 452 - (x / 1280) * 50; // desk edge line, slightly tilted
const sheet = { A: [655, 520], B: [1095, 488], C: [1205, 702], D: [600, 716] }; // TL TR BR BL
const quad = (u, w) => v.lerp(v.lerp(sheet.A, sheet.B, u), v.lerp(sheet.D, sheet.C, u), w);
const phone = { x: 800, y: 292, rot: -9, w: 214, h: 404 };

// ── background: wall, lamp glow, desk ───────────────────────────────────────
const background = `
  <defs>
    <radialGradient id="glow" cx="0.62" cy="0.42" r="0.55">
      <stop offset="0" stop-color="${C.terra}" stop-opacity="0.28"/>
      <stop offset="0.6" stop-color="${C.terra}" stop-opacity="0.05"/>
      <stop offset="1" stop-color="${C.terra}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="${C.char}"/>
  <rect width="1280" height="720" fill="url(#glow)"/>`;

// desk + wood grain + paraphernalia (sketched)
let desk = `<polygon points="${pts([[0, deskTop(0)], [1280, deskTop(1280)], [1280, 720], [0, 720]])}" fill="${C.char2}"/>`;
desk += `<line x1="0" y1="${f(deskTop(0))}" x2="1280" y2="${f(deskTop(1280))}" stroke="${C.cream}" stroke-width="2.4" stroke-opacity="0.7"/>`;
for (let i = 0; i < 7; i++) {
  const y = 480 + i * 36 + r() * 10;
  desk += `<path d="M${f(-20 + r() * 200)} ${f(y)} C 400 ${f(y - 6)}, 800 ${f(y + 8)}, ${f(1100 + r() * 200)} ${f(y - 4)}" fill="none" stroke="${C.cream}" stroke-opacity="0.09" stroke-width="1.4"/>`;
}
// coffee mug top-right
desk += `
  <g fill="none" stroke="${C.cream}" stroke-width="2.4" stroke-linecap="round">
    <path d="M1140 352 L1146 430 Q1176 442 1206 430 L1212 352" fill="${C.char3}"/>
    <ellipse cx="1176" cy="352" rx="36" ry="10" fill="${C.ink}"/>
    <path d="M1210 368 q26 4 22 26 q-4 18 -24 16"/>
    <path d="M1162 334 q-8 -14 2 -26 q8 -10 0 -22" stroke-opacity="0.6"/>
    <path d="M1186 336 q-8 -14 2 -26 q8 -10 0 -22" stroke-opacity="0.45"/>
  </g>
  <rect x="1146" y="382" width="64" height="40" fill="url(#hatch)"/>`;
// pencil lying on desk, bottom-left of the sheet
desk += `
  <g transform="translate(470 676) rotate(-24)" stroke="${C.cream}" stroke-width="2" stroke-linejoin="round">
    <rect x="0" y="-7" width="110" height="14" fill="${C.terra}"/>
    <rect x="-14" y="-7" width="14" height="14" fill="${C.creamMuted}"/>
    <polygon points="110,-7 132,0 110,7" fill="${C.paperWarm}"/>
    <polygon points="126,-2 132,0 126,2" fill="${C.ink}"/>
  </g>`;

// ── the answer sheet with bubble grid ──────────────────────────────────────
let sheetArt = `<polygon points="${pts([sheet.A, sheet.B, sheet.C, sheet.D])}" fill="${C.paper}" stroke="${C.cream}" stroke-width="2.4"/>`;
// header band
sheetArt += `<polygon points="${pts([quad(0.04, 0.05), quad(0.96, 0.05), quad(0.96, 0.13), quad(0.04, 0.13)])}" fill="${APP.orange}" fill-opacity="0.85"/>`;
// anchor squares at corners (OMR fiducials)
for (const [u, w] of [[0.03, 0.17], [0.97, 0.17], [0.03, 0.95], [0.97, 0.95]]) {
  const p = quad(u, w);
  sheetArt += `<rect x="${f(p[0] - 6)}" y="${f(p[1] - 5)}" width="12" height="10" fill="${C.ink}"/>`;
}
// 4 column groups × 9 rows × 4 bubbles
for (let g = 0; g < 4; g++) {
  for (let row = 0; row < 9; row++) {
    const w = 0.23 + row * 0.083;
    const pick = Math.floor(r() * 4);
    for (let b = 0; b < 4; b++) {
      const u = 0.08 + g * 0.23 + b * 0.045;
      const p = quad(u, w);
      const s = 0.75 + w * 0.5; // closer rows are bigger
      sheetArt += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(5.4 * s)}" ry="${f(3.6 * s)}" fill="${b === pick ? C.ink : "none"}" stroke="${C.ink}" stroke-opacity="0.7" stroke-width="1.2"/>`;
    }
    const n = quad(0.065 + g * 0.23 - 0.025, w);
    sheetArt += `<line x1="${f(n[0] - 6)}" y1="${f(n[1])}" x2="${f(n[0] + 2)}" y2="${f(n[1])}" stroke="${C.ink}" stroke-opacity="0.5" stroke-width="1.5"/>`;
  }
}
// pencil shading on the far half of the sheet
sheetArt += `<polygon points="${pts([quad(0.62, 0), sheet.B, quad(1, 0.4), quad(0.7, 0.35)])}" fill="url(#hatchInk)"/>`;

// ── scan beam from the phone down to the sheet ─────────────────────────────
const beam = `
  <polygon points="${pts([[735, 516], [930, 486], [1130, 650], [680, 690]])}" fill="${APP.orange}" fill-opacity="0.13"/>
  <g stroke="${APP.orange}" stroke-width="2" stroke-dasharray="9 8" stroke-opacity="0.75" fill="none">
    <line x1="735" y1="516" x2="680" y2="690"/>
    <line x1="930" y1="486" x2="1130" y2="650"/>
  </g>
  <line x1="${f(quad(0.1, 0.55)[0])}" y1="${f(quad(0.1, 0.55)[1])}" x2="${f(quad(0.9, 0.55)[0])}" y2="${f(quad(0.9, 0.55)[1])}" stroke="${APP.orange}" stroke-width="3" stroke-opacity="0.8"/>`;

// ── the person (seen from behind, left foreground) ─────────────────────────
const person = `
  <!-- hoodie shoulders -->
  <path d="M40 720 C 60 590, 150 488, 285 470 C 410 455, 520 488, 575 585 L 612 720 Z" fill="${C.cobalt}" stroke="${C.cream}" stroke-width="3"/>
  <path d="M40 720 C 60 590, 150 488, 285 470 C 410 455, 520 488, 575 585 L 612 720 Z" fill="url(#hatch)"/>
  <!-- hood folds -->
  <path d="M190 498 C 230 560, 360 572, 430 500" fill="none" stroke="${C.cream}" stroke-width="2.4" stroke-opacity="0.8"/>
  <path d="M220 530 C 270 590, 360 590, 410 540" fill="none" stroke="${C.cream}" stroke-width="1.8" stroke-opacity="0.5"/>
  <!-- neck -->
  <path d="M268 462 L 278 420 L 372 420 L 392 462" fill="${C.skinShade}" stroke="${C.cream}" stroke-width="2.4"/>
  <!-- head (back view) -->
  <ellipse cx="322" cy="318" rx="96" ry="106" fill="${C.char3}" stroke="${C.cream}" stroke-width="3"/>
  <!-- ear, turned toward the phone -->
  <path d="M414 304 C 438 300, 444 340, 418 352" fill="${C.skin}" stroke="${C.cream}" stroke-width="2.4"/>`;
// hair scribbles
let hair = "";
for (let i = 0; i < 26; i++) {
  const a = -Math.PI + r() * Math.PI * 1.15;
  const rad = 30 + r() * 62;
  const x = 322 + Math.cos(a) * rad * 0.9;
  const y = 318 + Math.sin(a) * rad;
  hair += `<path d="M${f(x)} ${f(y)} q ${f(10 + r() * 14)} ${f(-8 - r() * 10)} ${f(22 + r() * 16)} ${f(-2 + r() * 8)}" fill="none" stroke="${C.cream}" stroke-opacity="${f(0.25 + r() * 0.35)}" stroke-width="1.6"/>`;
}

// arm reaching to the phone (sleeve in perspective)
const shoulder = [440, 520];
const wrist = [682, 384];
const dir = v.norm(v.sub(wrist, shoulder));
const nrm = [-dir[1], dir[0]];
const sleeve = [v.add(shoulder, v.mul(nrm, 46)), v.add(wrist, v.mul(nrm, 26)), v.sub(wrist, v.mul(nrm, 26)), v.sub(shoulder, v.mul(nrm, 46))];
const arm = `
  <polygon points="${pts(sleeve)}" fill="${C.cobalt}" stroke="${C.cream}" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="${pts(sleeve)}" fill="url(#hatchX)"/>
  <path d="M${f(wrist[0] - 22)} ${f(wrist[1] + 30)} l 8 -12 m 6 -10 l 6 -10" stroke="${C.cream}" stroke-width="2" fill="none"/>`;

// excitement marks
const excite = `
  <g stroke="${C.terra}" stroke-width="4" stroke-linecap="round" fill="none">
    <path d="M430 182 L 448 150"/>
    <path d="M458 214 L 494 196"/>
    <path d="M404 166 L 408 128"/>
  </g>
  <path d="M520 140 L 512 196" stroke="${C.cream}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="509" cy="216" r="5" fill="${C.cream}"/>`;

// ── phone (outline sketched; screen crisp & legible) ───────────────────────
const P = phone;
const phoneBody = `
  <g transform="translate(${P.x} ${P.y}) rotate(${P.rot})">
    <rect x="${-P.w / 2}" y="${-P.h / 2}" width="${P.w}" height="${P.h}" rx="28" fill="${C.ink}" stroke="${C.cream}" stroke-width="3.2"/>
    <rect x="${-P.w / 2 - 4}" y="-120" width="5" height="40" fill="${C.cream}" fill-opacity="0.7"/>
  </g>`;

const sw = P.w - 20;
const sx = -sw / 2;
const domains = [
  ["Verbal", 0.84, "34"],
  ["Quantitative", 0.93, "37"],
  ["English", 0.79, "31"],
];
let rows = "";
domains.forEach(([label, val, n], i) => {
  const y = 48 + i * 30;
  rows += `
    <text x="${sx + 12}" y="${y}" font-family="${SANS}" font-size="10" fill="${APP.muted}">${label}</text>
    <text x="${-sx - 12}" y="${y}" font-family="${SANS}" font-size="10" font-weight="700" fill="${APP.text}" text-anchor="end">${n}/40</text>
    <rect x="${sx + 12}" y="${y + 6}" width="${sw - 24}" height="7" rx="3.5" fill="${APP.track}"/>
    <rect x="${sx + 12}" y="${y + 6}" width="${f((sw - 24) * val)}" height="7" rx="3.5" fill="${APP.orange}"/>`;
});
const screen = `
  <g transform="translate(${P.x} ${P.y}) rotate(${P.rot})">
    <rect x="${sx}" y="${-P.h / 2 + 12}" width="${sw}" height="${P.h - 24}" rx="20" fill="${APP.bg}"/>
    <rect x="-24" y="${-P.h / 2 + 18}" width="48" height="10" rx="5" fill="${C.ink}"/>
    <text x="${sx + 14}" y="-148" font-family="${SANS}" font-size="16" font-weight="700" fill="${APP.orange}">PsychoScanner</text>
    <rect x="${sx + 10}" y="-132" width="${sw - 20}" height="148" rx="12" fill="#FFFFFF"/>
    <text x="${sx + 22}" y="-110" font-family="${SANS}" font-size="9" font-weight="600" letter-spacing="1.2" fill="${APP.muted}">YOUR SCORE</text>
    <text x="${sx + 20}" y="-52" font-family="${SANS}" font-size="58" font-weight="800" fill="${APP.text}">142</text>
    <text x="${sx + 128}" y="-54" font-family="${SANS}" font-size="15" font-weight="600" fill="${APP.muted}">/150</text>
    <rect x="${sx + 22}" y="-36" width="104" height="18" rx="9" fill="#DCFCE7"/>
    <text x="${sx + 32}" y="-23.5" font-family="${SANS}" font-size="9" font-weight="600" fill="#15803D">✓ Graded in 0.8s</text>
    ${rows}
    <rect x="${sx + 10}" y="${P.h / 2 - 58}" width="${sw - 20}" height="34" rx="12" fill="${APP.orange}"/>
    <text x="0" y="${P.h / 2 - 36}" font-family="${SANS}" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">Scan another sheet</text>
  </g>`;

// hand gripping the phone's left edge (drawn over the screen edge)
const hand = `
  <g transform="translate(${P.x} ${P.y}) rotate(${P.rot})" stroke="${C.cream}" stroke-width="2.6" stroke-linejoin="round">
    <path d="M-150 80 C -140 40, -122 22, -112 18 L -96 6 C -86 0, -78 12, -86 22 L -98 40 C -100 70, -104 96, -126 112 Z" fill="${C.skin}"/>
    <path d="M-112 18 C -104 2, -96 -14, -90 -26 C -84 -36, -72 -30, -76 -18 L -92 26" fill="${C.skin}"/>
    <path d="M-118 60 L -104 56 M -120 80 L -106 76" fill="none" stroke-opacity="0.7"/>
  </g>`;

// sparkles around the score
const sparkles = [sparkle(938, 150, 14, C.terra), sparkle(966, 196, 8, C.cream), sparkle(642, 168, 10, C.cream), sparkle(990, 108, 6, C.terra)].join("");

const body = `
  ${background}
  ${sketched("desk", desk, { ghost: 0.12 })}
  ${sketched("sheet", sheetArt, { ghost: 0.15 })}
  ${beam}
  ${sketched("arm", arm, { ghost: 0.22 })}
  ${sketched("phone", phoneBody, { ghost: 0.25 })}
  ${screen}
  ${sketched("hand", hand, { ghost: 0.25 })}
  ${sketched("person", person + hair, { ghost: 0.22 })}
  ${sketched("excite", excite + sparkles, { ghost: 0.3 })}`;

write(
  "psychoscanner.svg",
  svgDoc({
    title: "PsychoScanner in use",
    desc: "Pencil sketch over a student's shoulder: they hold a phone above a filled bubble answer sheet on a desk, and the PsychoScanner screen reveals a score of 142 out of 150 with per-domain bars.",
    body,
  }),
);
