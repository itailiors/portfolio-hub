// Idea5: a pencil-sketch of someone thinking hard, riding a giant flying
// triangular pencil past the Great Wall at dusk, a lightbulb + 5:00 timer
// in their thought bubble.
// Run: node scripts/art/idea5.mjs  → public/images/idea5.svg

import { C, f, pts, rng, sketched, sparkle, svgDoc, v, write } from "./sketch.mjs";

const r = rng(5);
const MONO = "JetBrains Mono, Consolas, Menlo, monospace";

// ── sky ────────────────────────────────────────────────────────────────────
let sky = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#121110"/>
      <stop offset="0.55" stop-color="#1E1613"/>
      <stop offset="1" stop-color="#4A2016"/>
    </linearGradient>
    <clipPath id="sun"><circle cx="1132" cy="150" r="84"/></clipPath>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>`;
for (let i = 0; i < 70; i++) {
  sky += `<circle cx="${f(r() * 1280)}" cy="${f(r() * 330)}" r="${f(0.6 + r() * 1.4)}" fill="${C.cream}" fill-opacity="${f(0.2 + r() * 0.5)}"/>`;
}
// Bauhaus striped setting sun (ties into the site's poster art)
sky += `
  <circle cx="1132" cy="150" r="84" fill="${C.terra}"/>
  <g clip-path="url(#sun)" fill="#1E1613">
    <rect x="1040" y="146" width="190" height="6"/>
    <rect x="1040" y="168" width="190" height="9"/>
    <rect x="1040" y="192" width="190" height="12"/>
    <rect x="1040" y="220" width="190" height="16"/>
  </g>`;

// ── mountains & the Great Wall ─────────────────────────────────────────────
const far = [[0, 470], [120, 432], [230, 456], [360, 392], [470, 432], [600, 384], [720, 424], [850, 366], [980, 412], [1100, 372], [1280, 424]];
const near = [[0, 572], [110, 530], [220, 556], [330, 498], [450, 540], [560, 478], [690, 524], [800, 466], [930, 512], [1050, 462], [1170, 506], [1280, 478]];

const ridgePath = (p) => `M${pts([[0, 720], ...p, [1280, 720]]).replace(/ /g, " L")} Z`;

let land = `
  <path d="${ridgePath(far)}" fill="#26201C" stroke="${C.cream}" stroke-opacity="0.35" stroke-width="2"/>
  <path d="${ridgePath(far)}" fill="url(#hatchX)" opacity="0.6"/>`;
// distant wall: thin crenellated line on the far ridge
let farWall = "";
for (let i = 0; i < far.length - 1; i++) {
  const a = v.add(far[i], [0, -6]);
  const b = v.add(far[i + 1], [0, -6]);
  farWall += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
  const n = Math.floor(v.len(v.sub(b, a)) / 10);
  for (let k = 0; k < n; k += 2) {
    const p = v.lerp(a, b, (k + 0.5) / n);
    farWall += `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(p[0])}" y2="${f(p[1] - 3)}"/>`;
  }
}
land += `<g stroke="${C.cream}" stroke-opacity="0.35" stroke-width="1.6">${farWall}</g>`;

land += `<path d="${ridgePath(near)}" fill="#191512" stroke="${C.cream}" stroke-opacity="0.6" stroke-width="2.4"/>`;

// near wall: walkway band following the ridge, merlons, brick lines, watchtowers
const H = 26;
let wall = "";
for (let i = 0; i < near.length - 1; i++) {
  const a = near[i];
  const b = near[i + 1];
  const at = v.add(a, [0, -H]);
  const bt = v.add(b, [0, -H]);
  wall += `<polygon points="${pts([at, bt, b, a])}" fill="#3A3029" stroke="${C.cream}" stroke-width="2.2" stroke-linejoin="round"/>`;
  wall += `<polygon points="${pts([at, bt, b, a])}" fill="url(#hatch)" opacity="0.7"/>`;
  const mid = [v.add(a, [0, -H / 2]), v.add(b, [0, -H / 2])];
  wall += `<line x1="${f(mid[0][0])}" y1="${f(mid[0][1])}" x2="${f(mid[1][0])}" y2="${f(mid[1][1])}" stroke="${C.cream}" stroke-opacity="0.35" stroke-dasharray="10 7"/>`;
  const n = Math.floor(v.len(v.sub(bt, at)) / 15);
  for (let k = 0; k < n; k++) {
    const p = v.lerp(at, bt, (k + 0.5) / n);
    wall += `<rect x="${f(p[0] - 4.5)}" y="${f(p[1] - 9)}" width="9" height="9" fill="#3A3029" stroke="${C.cream}" stroke-width="1.6"/>`;
  }
}
// watchtowers on the ridge peaks
for (const i of [3, 5, 7, 9]) {
  const [x, y] = near[i];
  const top = y - H - 52;
  wall += `
    <rect x="${x - 26}" y="${top}" width="52" height="${52 + H}" fill="#43382F" stroke="${C.cream}" stroke-width="2.4"/>
    <rect x="${x - 26}" y="${top}" width="52" height="${52 + H}" fill="url(#hatchX)"/>
    <path d="M${x - 9} ${top + 52} v-16 a9 9 0 0 1 18 0 v16" fill="${C.ink}" stroke="${C.cream}" stroke-width="1.8"/>
    <rect x="${x - 20}" y="${top + 12}" width="8" height="12" fill="${C.ink}" stroke="${C.cream}" stroke-width="1.4"/>
    <rect x="${x + 12}" y="${top + 12}" width="8" height="12" fill="${C.ink}" stroke="${C.cream}" stroke-width="1.4"/>`;
  for (let k = 0; k < 4; k++) {
    wall += `<rect x="${x - 26 + k * 14}" y="${top - 10}" width="10" height="10" fill="#43382F" stroke="${C.cream}" stroke-width="1.8"/>`;
  }
}

// foreground hill with shrubs and grass ticks (fills the bottom of the frame)
const hill = "M0 720 L0 646 C 180 606, 400 676, 640 640 S 1010 598, 1280 652 L1280 720 Z";
let fore = `
  <path d="${hill}" fill="#100E0C" stroke="${C.cream}" stroke-opacity="0.55" stroke-width="2.4"/>
  <path d="${hill}" fill="url(#hatchX)" opacity="0.5"/>`;
for (let i = 0; i < 46; i++) {
  const x = r() * 1280;
  const y = 670 + r() * 44;
  fore += `<path d="M${f(x)} ${f(y)} l ${f(-3 - r() * 3)} ${f(-8 - r() * 8)} M ${f(x)} ${f(y)} l ${f(3 + r() * 3)} ${f(-8 - r() * 8)}" stroke="${C.cream}" stroke-opacity="0.4" stroke-width="1.6" fill="none"/>`;
}
for (const [x, y, s] of [[90, 640, 1], [1180, 634, 1.2], [470, 664, 0.8], [880, 628, 0.9]]) {
  fore += `<path d="M${x} ${y} c ${-24 * s} 0 ${-26 * s} ${-30 * s} ${-4 * s} ${-34 * s} c ${4 * s} ${-22 * s} ${36 * s} ${-20 * s} ${38 * s} ${-2 * s} c ${22 * s} ${2 * s} ${22 * s} ${34 * s} ${-2 * s} ${36 * s} Z" fill="${C.stage}" stroke="${C.cream}" stroke-opacity="0.7" stroke-width="2"/>`;
}
land += fore;

// clouds & birds
const cloud = (x, y, s) =>
  `<path d="M${x} ${y} c ${-30 * s} 0 ${-30 * s} ${-28 * s} 0 ${-28 * s} c ${4 * s} ${-26 * s} ${46 * s} ${-26 * s} ${50 * s} ${-4 * s} c ${18 * s} ${-14 * s} ${44 * s} ${2 * s} ${34 * s} ${32 * s} Z" fill="${C.char3}" fill-opacity="0.85" stroke="${C.cream}" stroke-opacity="0.55" stroke-width="2"/>`;
const birds = [[930, 150], [960, 132], [985, 158]].map(([x, y]) => `<path d="M${x} ${y} q 8 -8 16 0 q 8 -8 16 0" fill="none" stroke="${C.cream}" stroke-opacity="0.7" stroke-width="2"/>`).join("");
const air = cloud(250, 170, 1.4) + cloud(560, 92, 0.9) + birds;

// ── the flying triangular pencil ──────────────────────────────────────────
const S = [270, 520]; // eraser end (back)
const E = [1010, 340]; // graphite tip (front)
const d = v.sub(E, S);
const u = v.norm(d);
const n = [-u[1], u[0]]; // points "down" (screen-space)
const W = 30; // half thickness
const at = (t) => v.add(S, v.mul(d, t));
const topEdge = (t, k = 1) => v.sub(at(t), v.mul(n, W * k));
const ridge = (t, k = 1) => v.add(at(t), v.mul(n, W * 0.12 * k));
const botEdge = (t, k = 1) => v.add(at(t), v.mul(n, W * k));

const T0 = 0.035, T1 = 0.09, T2 = 0.82, T3 = 0.95;
let pencil = "";
// speed lines behind
for (let i = 0; i < 7; i++) {
  const off = -40 + i * 13 + r() * 6;
  const start = v.add(v.sub(S, v.mul(u, 30 + r() * 30)), v.mul(n, off));
  const end = v.sub(start, v.mul(u, 90 + r() * 140));
  pencil += `<line x1="${f(start[0])}" y1="${f(start[1])}" x2="${f(end[0])}" y2="${f(end[1])}" stroke="${i % 2 ? C.terra : C.cream}" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/>`;
}
// eraser
pencil += `<polygon points="${pts([topEdge(0), topEdge(T0), botEdge(T0), botEdge(0)])}" fill="#E8A08A" stroke="${C.cream}" stroke-width="2.6"/>`;
// ferrule with crimps
pencil += `<polygon points="${pts([topEdge(T0), topEdge(T1), botEdge(T1), botEdge(T0)])}" fill="${C.creamMuted}" stroke="${C.cream}" stroke-width="2.6"/>`;
for (const t of [0.05, 0.062, 0.074]) pencil += `<line x1="${f(topEdge(t)[0])}" y1="${f(topEdge(t)[1])}" x2="${f(botEdge(t)[0])}" y2="${f(botEdge(t)[1])}" stroke="${C.ink}" stroke-opacity="0.55" stroke-width="2"/>`;
// body: two visible faces of the triangular prism
pencil += `<polygon points="${pts([topEdge(T1), topEdge(T2), ridge(T2), ridge(T1)])}" fill="${C.crimson}" stroke="${C.cream}" stroke-width="2.6"/>`;
pencil += `<polygon points="${pts([ridge(T1), ridge(T2), botEdge(T2), botEdge(T1)])}" fill="${C.crimsonDeep}" stroke="${C.cream}" stroke-width="2.6"/>`;
pencil += `<polygon points="${pts([ridge(T1), ridge(T2), botEdge(T2), botEdge(T1)])}" fill="url(#hatch)"/>`;
// sharpened wood cone with scalloped shavings edge
const coneTip = [topEdge(T3, 0.28), botEdge(T3, 0.28)];
pencil += `<polygon points="${pts([topEdge(T2), coneTip[0], coneTip[1], botEdge(T2)])}" fill="${C.paperWarm}" stroke="${C.cream}" stroke-width="2.6"/>`;
let scallop = `M${f(topEdge(T2)[0])} ${f(topEdge(T2)[1])}`;
for (let k = 1; k <= 4; k++) {
  const p = v.lerp(topEdge(T2), botEdge(T2), k / 4);
  const c = v.add(v.lerp(topEdge(T2), botEdge(T2), (k - 0.5) / 4), v.mul(u, 14));
  scallop += ` Q${f(c[0])} ${f(c[1])} ${f(p[0])} ${f(p[1])}`;
}
pencil += `<path d="${scallop}" fill="${C.crimson}" stroke="${C.cream}" stroke-width="2.2"/>`;
// graphite tip
pencil += `<polygon points="${pts([coneTip[0], E, coneTip[1]])}" fill="${C.ink}" stroke="${C.cream}" stroke-width="2.4"/>`;
// "IDEA5 · HB" stamped on the top face
const label = topEdge(0.12, 0.45);
const angle = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
const pencilText = `<text x="${f(label[0])}" y="${f(label[1])}" transform="rotate(${f(angle)} ${f(label[0])} ${f(label[1])})" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="3" fill="${C.paperWarm}" fill-opacity="0.9">IDEA5 · HB · 5 MIN</text>`;

// ── the rider (side view, facing the tip, chin on fist) ────────────────────
const hip = v.sub(topEdge(0.47), [4, 2]);
const [hx, hy] = hip;
const rider = `
  <!-- far arm gripping the pencil -->
  <path d="M${hx + 2} ${hy - 86} C ${hx - 26} ${hy - 50}, ${hx - 40} ${hy - 20}, ${hx - 36} ${hy - 2}" fill="none" stroke="${C.cobalt}" stroke-width="18" stroke-linecap="round"/>
  <circle cx="${hx - 36}" cy="${hy - 2}" r="10" fill="${C.skinShade}" stroke="${C.cream}" stroke-width="2.2"/>
  <!-- torso, hunched forward -->
  <path d="M${hx - 22} ${hy + 4} C ${hx - 36} ${hy - 50}, ${hx - 20} ${hy - 96}, ${hx + 8} ${hy - 104} L ${hx + 34} ${hy - 94} C ${hx + 48} ${hy - 60}, ${hx + 40} ${hy - 24}, ${hx + 30} ${hy + 4} Z" fill="${C.cobalt}" stroke="${C.cream}" stroke-width="2.8"/>
  <path d="M${hx - 22} ${hy + 4} C ${hx - 36} ${hy - 50}, ${hx - 20} ${hy - 96}, ${hx + 8} ${hy - 104} L ${hx + 34} ${hy - 94} C ${hx + 48} ${hy - 60}, ${hx + 40} ${hy - 24}, ${hx + 30} ${hy + 4} Z" fill="url(#hatch)"/>
  <!-- thigh along the pencil -->
  <path d="M${hx - 6} ${hy - 8} L ${hx + 62} ${hy - 30}" stroke="${C.char3}" stroke-width="30" stroke-linecap="round"/>
  <path d="M${hx - 14} ${hy - 22} L ${hx + 58} ${hy - 46} M ${hx - 2} ${hy + 6} L ${hx + 70} ${hy - 16}" stroke="${C.cream}" stroke-width="2.4" fill="none"/>
  <!-- head -->
  <circle cx="${hx + 34}" cy="${hy - 140}" r="36" fill="${C.skin}" stroke="${C.cream}" stroke-width="2.8"/>
  <path d="M${hx + 2} ${hy - 150} C ${hx + 4} ${hy - 186}, ${hx + 58} ${hy - 190}, ${hx + 66} ${hy - 160} C ${hx + 50} ${hy - 168}, ${hx + 32} ${hy - 166}, ${hx + 22} ${hy - 152} C ${hx + 16} ${hy - 142}, ${hx + 6} ${hy - 136}, ${hx + 2} ${hy - 150} Z" fill="${C.char3}" stroke="${C.cream}" stroke-width="2.4"/>
  <!-- face: furrowed brow, squinting eye, nose, wobbly mouth -->
  <path d="M${hx + 70} ${hy - 136} q 8 4 0 10" fill="none" stroke="${C.cream}" stroke-width="2.2"/>
  <path d="M${hx + 46} ${hy - 152} L ${hx + 62} ${hy - 146}" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M${hx + 50} ${hy - 140} q 5 -3 10 0" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M${hx + 40} ${hy - 160} q 6 -3 12 0 M ${hx + 38} ${hy - 165} q 6 -3 12 0" fill="none" stroke="${C.skinShade}" stroke-width="1.8"/>
  <path d="M${hx + 50} ${hy - 120} q 4 -3 8 0 q 4 3 8 0" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M${hx + 14} ${hy - 136} q 6 2 4 10" fill="none" stroke="${C.skinShade}" stroke-width="2"/>
  <!-- thinker arm: elbow on knee, fist under chin -->
  <path d="M${hx + 24} ${hy - 92} L ${hx + 66} ${hy - 40}" stroke="${C.cobalt}" stroke-width="20" stroke-linecap="round"/>
  <path d="M${hx + 66} ${hy - 40} L ${hx + 58} ${hy - 98}" stroke="${C.skin}" stroke-width="15" stroke-linecap="round"/>
  <path d="M${hx + 24} ${hy - 92} L ${hx + 66} ${hy - 40} L ${hx + 58} ${hy - 98}" fill="none" stroke="${C.cream}" stroke-width="2" stroke-opacity="0.8"/>
  <circle cx="${hx + 58}" cy="${hy - 104}" r="12" fill="${C.skin}" stroke="${C.cream}" stroke-width="2.4"/>
  <!-- shin hanging over the near face of the pencil + sneaker -->
  <path d="M${hx + 64} ${hy - 32} L ${hx + 74} ${hy + 48}" stroke="${C.char3}" stroke-width="24" stroke-linecap="round"/>
  <path d="M${hx + 52} ${hy - 30} L ${hx + 62} ${hy + 46} M ${hx + 76} ${hy - 34} L ${hx + 86} ${hy + 44}" stroke="${C.cream}" stroke-width="2.4" fill="none"/>
  <path d="M${hx + 58} ${hy + 46} L ${hx + 104} ${hy + 46} Q ${hx + 108} ${hy + 64} ${hx + 92} ${hy + 64} L ${hx + 58} ${hy + 64} Z" fill="${C.cream}" stroke="${C.cream}" stroke-width="2"/>
  <path d="M${hx + 58} ${hy + 58} L ${hx + 104} ${hy + 58}" stroke="${C.terra}" stroke-width="3"/>
  <!-- sweat drop + strain marks -->
  <path d="M${hx - 6} ${hy - 168} q -9 14 0 18 q 9 -4 0 -18 Z" fill="#9DB7EA" stroke="${C.cream}" stroke-width="1.6"/>
  <g stroke="${C.terra}" stroke-width="3.4" stroke-linecap="round" fill="none">
    <path d="M${hx + 18} ${hy - 196} l -6 -16"/>
    <path d="M${hx + 40} ${hy - 202} l 0 -18"/>
    <path d="M${hx + 62} ${hy - 196} l 8 -14"/>
  </g>
  <path d="M${hx + 92} ${hy - 168} c 10 -6 18 2 10 8 c -8 6 -14 -6 -2 -10 c 12 -4 18 10 6 14" fill="none" stroke="${C.cream}" stroke-width="2" stroke-opacity="0.8"/>`;

// ── thought bubble: lightbulb + 5:00 ───────────────────────────────────────
const bx = hx + 196;
const by = hy - 246;
const thought = `
  <circle cx="${hx + 100}" cy="${hy - 200}" r="7" fill="${C.paper}" stroke="${C.cream}" stroke-width="2"/>
  <circle cx="${hx + 120}" cy="${hy - 226}" r="11" fill="${C.paper}" stroke="${C.cream}" stroke-width="2"/>
  <path d="M${bx - 70} ${by + 34} c -30 -4 -34 -44 -4 -52 c 2 -34 52 -40 66 -16 c 18 -26 66 -18 66 14 c 34 0 40 46 6 54 c 0 26 -44 34 -60 14 c -20 22 -66 18 -74 -14 Z" fill="${C.paper}" stroke="${C.cream}" stroke-width="2.6"/>
  <!-- lightbulb -->
  <circle cx="${bx - 40}" cy="${by - 4}" r="20" fill="${C.paperWarm}" stroke="${C.ink}" stroke-width="2.6"/>
  <path d="M${bx - 48} ${by + 14} h16 v12 h-16 Z M ${bx - 48} ${by + 20} h16" fill="${C.creamMuted}" stroke="${C.ink}" stroke-width="2.2"/>
  <path d="M${bx - 46} ${by + 4} l 6 -12 l 6 12" fill="none" stroke="${C.terra}" stroke-width="2.4"/>
  <g stroke="${C.terra}" stroke-width="2.6" stroke-linecap="round">
    <line x1="${bx - 40}" y1="${by - 32}" x2="${bx - 40}" y2="${by - 40}"/>
    <line x1="${bx - 66}" y1="${by - 12}" x2="${bx - 74}" y2="${by - 16}"/>
    <line x1="${bx - 14}" y1="${by - 12}" x2="${bx - 6}" y2="${by - 16}"/>
    <line x1="${bx - 60}" y1="${by - 28}" x2="${bx - 66}" y2="${by - 34}"/>
    <line x1="${bx - 20}" y1="${by - 28}" x2="${bx - 14}" y2="${by - 34}"/>
  </g>`;
const thoughtText = `<text x="${bx + 2}" y="${by + 10}" font-family="${MONO}" font-size="30" font-weight="700" fill="${C.crimson}">5:00</text>`;

const sparkles = [sparkle(bx + 92, by - 30, 10, C.terra), sparkle(bx + 110, by + 30, 6, C.cream), sparkle(E[0] + 26, E[1] - 22, 12, C.cream)].join("");

const body = `
  ${sky}
  ${sketched("land", land + wall, { ghost: 0.14 })}
  ${sketched("air", air, { ghost: 0.18 })}
  <g transform="translate(640 420) scale(1.2) translate(-640 -420)">
  ${sketched("pencil", pencil, { ghost: 0.22 })}
  ${pencilText}
  ${sketched("rider", rider, { ghost: 0.22 })}
  ${sketched("thought", thought + sparkles, { ghost: 0.2 })}
  ${thoughtText}
  </g>`;

write(
  "idea5.svg",
  svgDoc({
    title: "Idea5: thinking on a flying pencil",
    desc: "Pencil sketch at dusk: a person with their chin on their fist thinks hard while riding a giant flying triangular pencil past the Great Wall winding over the mountain ridges; their thought bubble holds a lightbulb and a 5:00 timer.",
    body,
  }),
);
