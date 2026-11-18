// Bet on Dave: pencil sketch of ragdolls on a high wire — one balancing with a pole, one
// hanging on by a hand, Dave mid-wipeout — while the crowd below waves betting slips.
// Run: node scripts/art/dave.mjs  → public/images/dave.svg (+ dave-color.svg for the Sketchbook style)

import { C, f, rng, sketched, sparkle, svgDoc, write } from "./sketch.mjs";

const r = rng(7);
const W = 1280;
const H = 720;
const HAND = "Segoe Print, Comic Sans MS, Bradley Hand, cursive";

// Angles: 0 = pointing down, 90 = right, 180 = up, -90 = left.
const dir = (deg) => [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
const at = (p, deg, len) => [p[0] + dir(deg)[0] * len, p[1] + dir(deg)[1] * len];
const seg = (a, b, w, color) =>
  `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
/** A limb drawn as an outlined marker stroke: thick pencil outline, colored fill on top. */
const limb = (pts, w, color) => {
  let out = "";
  for (let i = 0; i < pts.length - 1; i++) out += seg(pts[i], pts[i + 1], w + 6, C.cream);
  for (let i = 0; i < pts.length - 1; i++) out += seg(pts[i], pts[i + 1], w, color);
  return out;
};

// ── the wire: sags between two towers ──────────────────────────────────────
const A = [190, 236];
const B = [1092, 262];
const CTRL = [640, 340];
const wireAt = (t) => [
  (1 - t) ** 2 * A[0] + 2 * (1 - t) * t * CTRL[0] + t ** 2 * B[0],
  (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * CTRL[1] + t ** 2 * B[1],
];

/**
 * Ragdoll: hip position, torso angle, and absolute angles for each limb segment.
 * face: "o" (scream), "grit" (concentrating), "worry".
 */
function ragdoll({ hip, torso = 180, arms, legs, shirt, pants, face = "o", scale = 1, extra = "" }) {
  const s = scale;
  const neck = at(hip, torso, 70 * s);
  const shoulder = at(hip, torso, 60 * s);
  const head = at(neck, torso, 26 * s);
  const armPts = arms.map(([a1, a2]) => {
    const elbow = at(shoulder, a1, 36 * s);
    return [shoulder, elbow, at(elbow, a2, 34 * s)];
  });
  const legPts = legs.map(([l1, l2]) => {
    const knee = at(hip, l1, 42 * s);
    return [hip, knee, at(knee, l2, 40 * s)];
  });
  // face, rotated with the head
  const up = torso - 180;
  const rot = (dx, dy) => {
    const a = (up * Math.PI) / 180;
    return [head[0] + dx * Math.cos(a) - dy * Math.sin(a), head[1] + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  const e1 = rot(-8 * s, -4 * s);
  const e2 = rot(8 * s, -4 * s);
  const m = rot(0, 9 * s);
  let faceSvg = `<circle cx="${f(e1[0])}" cy="${f(e1[1])}" r="${f(3 * s)}" fill="${C.ink}"/><circle cx="${f(e2[0])}" cy="${f(e2[1])}" r="${f(3 * s)}" fill="${C.ink}"/>`;
  if (face === "o") faceSvg += `<ellipse cx="${f(m[0])}" cy="${f(m[1])}" rx="${f(5 * s)}" ry="${f(7 * s)}" fill="${C.ink}"/>`;
  if (face === "grit") faceSvg += `<line x1="${f(m[0] - 8 * s)}" y1="${f(m[1])}" x2="${f(m[0] + 8 * s)}" y2="${f(m[1])}" stroke="${C.ink}" stroke-width="${f(3 * s)}" stroke-linecap="round"/>`;
  if (face === "worry") faceSvg += `<path d="M${f(m[0] - 8 * s)} ${f(m[1] + 3 * s)} q ${f(8 * s)} ${f(-7 * s)} ${f(16 * s)} 0" fill="none" stroke="${C.ink}" stroke-width="${f(2.6 * s)}" stroke-linecap="round"/>`;

  return `
    ${limb(legPts[1], 13 * s, pants)}
    ${limb(armPts[1], 11 * s, shirt)}
    ${limb([hip, neck], 26 * s, shirt)}
    ${limb(legPts[0], 13 * s, pants)}
    ${extra}
    ${limb(armPts[0], 11 * s, shirt)}
    <circle cx="${f(head[0])}" cy="${f(head[1])}" r="${f(24 * s)}" fill="${C.paperWarm}" stroke="${C.cream}" stroke-width="${f(3.4 * s)}"/>
    ${faceSvg}`;
}

// ── background: big-top tent glow, spotlights, crowd stand ─────────────────
const background = `
  <defs>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.6">
      <stop offset="0" stop-color="${C.terra}" stop-opacity="0.24"/>
      <stop offset="0.65" stop-color="${C.terra}" stop-opacity="0.04"/>
      <stop offset="1" stop-color="${C.terra}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.paperWarm}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${C.paperWarm}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.char}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <polygon points="380,0 450,0 700,420 560,420" fill="url(#beam)"/>
  <polygon points="900,0 960,0 800,420 690,420" fill="url(#beam)"/>`;

// tent stripes along the top
let tent = "";
for (let i = 0; i < 9; i++) {
  const x0 = i * 160 - 20;
  tent += `<path d="M${x0} 0 L ${x0 + 160} 0 L ${x0 + 140} ${f(46 + r() * 8)} Q ${x0 + 80} ${f(70 + r() * 10)} ${x0 + 20} ${f(46 + r() * 8)} Z" fill="${i % 2 ? C.crimson : C.paperWarm}" fill-opacity="${i % 2 ? 0.8 : 0.16}" stroke="${C.cream}" stroke-width="2"/>`;
}

// towers + platforms
const tower = (x, top, w) => `
  <g stroke="${C.cream}" stroke-width="3" stroke-linejoin="round" fill="none">
    <rect x="${x}" y="${top}" width="${w}" height="16" fill="${C.char3}"/>
    <line x1="${x + 14}" y1="${top + 16}" x2="${x + 4}" y2="600"/>
    <line x1="${x + w - 14}" y1="${top + 16}" x2="${x + w - 4}" y2="600"/>
    ${[0, 1, 2, 3, 4]
      .map((k) => {
        const y1 = top + 30 + k * 70;
        return `<line x1="${x + 12}" y1="${y1}" x2="${x + w - 12}" y2="${y1 + 60}" stroke-opacity="0.5"/><line x1="${x + w - 12}" y1="${y1}" x2="${x + 12}" y2="${y1 + 60}" stroke-opacity="0.5"/>`;
      })
      .join("")}
  </g>`;
const towers = tower(90, 232, 120) + tower(1070, 258, 120);

// the wire itself (+ a faint safety net that obviously won't help)
let wire = `<path d="M${A[0]} ${A[1]} Q ${CTRL[0]} ${CTRL[1]} ${B[0]} ${B[1]}" fill="none" stroke="${C.cream}" stroke-width="3.5"/>`;
let net = `<path d="M230 520 Q 640 600 1050 520" fill="none" stroke="${C.cream}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="8 7"/>`;
for (let k = 0; k < 14; k++) {
  const x = 260 + k * 58;
  net += `<line x1="${x}" y1="${f(528 + Math.sin((k / 13) * Math.PI) * 38)}" x2="${x + 30}" y2="${f(548 + Math.sin((k / 13) * Math.PI) * 30)}" stroke="${C.cream}" stroke-opacity="0.2" stroke-width="1.5"/>`;
}

// ── the ragdolls ───────────────────────────────────────────────────────────
// 1. balancer with a long pole, wobbling
const w1 = wireAt(0.24);
const balancerHip = [w1[0] + 6, w1[1] - 76];
const pole = `<line x1="${f(balancerHip[0] - 150)}" y1="${f(balancerHip[1] - 30)}" x2="${f(balancerHip[0] + 160)}" y2="${f(balancerHip[1] - 92)}" stroke="${C.cream}" stroke-width="9" stroke-linecap="round"/>
  <line x1="${f(balancerHip[0] - 150)}" y1="${f(balancerHip[1] - 30)}" x2="${f(balancerHip[0] + 160)}" y2="${f(balancerHip[1] - 92)}" stroke="${C.terra}" stroke-width="4.5" stroke-linecap="round"/>`;
const balancer = ragdoll({
  hip: balancerHip,
  torso: 168,
  arms: [
    [-120, -100],
    [100, 112],
  ],
  legs: [
    [-14, 6],
    [22, -8],
  ],
  shirt: C.cobalt,
  pants: C.char3,
  face: "grit",
});

// 2. hanging on by one hand
const w2 = wireAt(0.74);
const hangerHand = [w2[0], w2[1] + 4];
const hangerHip = [hangerHand[0] - 18, hangerHand[1] + 140];
const hanger = ragdoll({
  hip: hangerHip,
  torso: 172,
  arms: [
    [168, 176],
    [-30, -10],
  ],
  legs: [
    [-20, 4],
    [26, 40],
  ],
  shirt: C.stage,
  pants: C.char3,
  face: "worry",
});

// 3. Dave, mid-wipeout, upside down
const daveHip = [640, 410];
const dave = ragdoll({
  hip: daveHip,
  torso: 32,
  arms: [
    [-110, -150],
    [120, 160],
  ],
  legs: [
    [-160, -130],
    [150, 190],
  ],
  shirt: C.crimson,
  pants: C.char3,
  face: "o",
});
// motion lines + "!?"
const daveFx = `
  <g stroke="${C.cream}" stroke-width="3" stroke-linecap="round" fill="none" stroke-opacity="0.75">
    <path d="M560 300 q 20 -30 50 -40"/>
    <path d="M700 296 q -10 -36 -46 -52"/>
    <path d="M540 360 q -6 -26 8 -46"/>
  </g>
  <text x="716" y="330" font-family="${HAND}" font-size="54" font-weight="700" fill="${C.terra}" transform="rotate(12 716 330)">!?</text>
  <g transform="translate(470 300) rotate(-8)">
    <rect x="-46" y="-22" width="92" height="40" fill="${C.paperWarm}" stroke="${C.cream}" stroke-width="2.6"/>
    <text x="0" y="8" text-anchor="middle" font-family="${HAND}" font-size="26" font-weight="700" fill="${C.ink}">DAVE</text>
  </g>
  <path d="M500 330 q 40 30 86 54" fill="none" stroke="${C.cream}" stroke-width="2.6" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${C.cream}"/></marker></defs>`;

// ── the crowd, waving betting slips ────────────────────────────────────────
let crowd = `<path d="M0 620 Q 640 590 ${W} 620 L ${W} ${H} L 0 ${H} Z" fill="${C.char2}" stroke="${C.cream}" stroke-width="2.4"/>`;
const shirts = [C.crimson, C.cobalt, C.terra, C.stage, C.paperWarm];
const slips = ["7:2", "ALL IN", "$5", "FALL", "2:1", "DAVE!", "$$", "NOPE"];
for (let i = 0; i < 15; i++) {
  const x = 40 + i * 86 + r() * 20;
  const y = 650 + r() * 20;
  const shirt = shirts[i % shirts.length];
  crowd += `<path d="M${f(x - 30)} ${H} Q ${f(x - 28)} ${f(y + 18)} ${f(x)} ${f(y + 16)} Q ${f(x + 28)} ${f(y + 18)} ${f(x + 30)} ${H} Z" fill="${shirt}" fill-opacity="0.85" stroke="${C.cream}" stroke-width="2.2"/>`;
  crowd += `<circle cx="${f(x)}" cy="${f(y - 8)}" r="17" fill="${C.paperWarm}" stroke="${C.cream}" stroke-width="2.4"/>`;
  if (i % 2 === 0) {
    // raised arm with a betting slip
    const hx = x + (i % 4 === 0 ? 34 : -34);
    const hy = y - 64 - r() * 16;
    crowd += `<line x1="${f(x + (hx > x ? 14 : -14))}" y1="${f(y + 18)}" x2="${f(hx)}" y2="${f(hy + 12)}" stroke="${C.cream}" stroke-width="7" stroke-linecap="round"/>`;
    const tilt = f(-14 + r() * 28);
    crowd += `<g transform="translate(${f(hx)} ${f(hy)}) rotate(${tilt})"><rect x="-34" y="-20" width="68" height="34" fill="${C.paper}" stroke="${C.cream}" stroke-width="2.2"/><text x="0" y="5" text-anchor="middle" font-family="${HAND}" font-size="17" font-weight="700" fill="${C.crimsonDeep}">${slips[(i / 2) % slips.length]}</text></g>`;
  }
}

// odds board top-right
const board = `
  <g transform="translate(1110 96) rotate(4)">
    <rect x="-78" y="-40" width="156" height="92" fill="${C.ink}" stroke="${C.cream}" stroke-width="3"/>
    <text x="0" y="-12" text-anchor="middle" font-family="${HAND}" font-size="17" fill="${C.creamMuted}">ODDS ON DAVE</text>
    <text x="0" y="36" text-anchor="middle" font-family="${HAND}" font-size="44" font-weight="700" fill="${C.terra}">7:2</text>
  </g>`;

const sparkles = [sparkle(150, 120, 12, C.terra), sparkle(820, 150, 8, C.cream), sparkle(300, 330, 7, C.cream), sparkle(980, 380, 10, C.terra)].join("");

const body = `
  ${background}
  ${sketched("tent", tent, { ghost: 0.15 })}
  ${sketched("rig", towers + net, { ghost: 0.2 })}
  ${sketched("wire", wire, { ghost: 0.25 })}
  ${sketched("board", board, { ghost: 0.2 })}
  ${sketched("balancer", pole + balancer, { ghost: 0.22 })}
  ${sketched("hanger", hanger, { ghost: 0.22 })}
  ${sketched("dave", dave + daveFx, { ghost: 0.25 })}
  ${sketched("crowd", crowd, { ghost: 0.18 })}
  ${sketched("sparkles", sparkles, { ghost: 0.3 })}`;

write(
  "dave.svg",
  svgDoc({
    title: "Bet on Dave: ragdolls on the high wire",
    desc: "Pencil sketch under a circus big top: one ragdoll balances on a sagging high wire with a pole, another hangs on by one hand, and Dave tumbles upside down mid-wipeout while the crowd below waves betting slips and an odds board reads 7:2.",
    body,
  }),
  { marker: { hue: 38 } },
);
