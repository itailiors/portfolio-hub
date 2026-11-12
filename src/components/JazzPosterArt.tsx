/**
 * JazzPosterArt — pure-SVG generative poster art.
 * Bauhaus half-disc + piano/equalizer bars (red/orange/cream) + cobalt
 * architectural ink lines of a late-night jazz club facade.
 * No images, no client JS: render it from Astro without a client: directive.
 */

const P = {
  night: "#0E0D0C",
  char: "#171513",
  paper: "#EFE9DC",
  paperWarm: "#F6EAC2",
  ink: "#1A1714",
  crimson: "#D9231A",
  terra: "#E85D1A",
  cobalt: "#1B4596",
  cream: "#F2EBDD",
  stage: "#174936",
};

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Card motif: Bauhaus disc + bars (default), piano keys & pulses, or chaotic slants. */
export type ArtMotif = "bauhaus" | "keys" | "slant";

const MOTIF_BY_PRODUCT: Record<string, ArtMotif> = {
  "the-woodshed": "keys",
  "bet-on-dave": "slant",
};

/** Motif for a product id (falls back to the Bauhaus motif). */
export function motifFor(productId: string): ArtMotif {
  return MOTIF_BY_PRODUCT[productId] ?? "bauhaus";
}

interface Props {
  variant?: "hero" | "card";
  /** Card variant only. */
  motif?: ArtMotif;
  /** Varies stripe / bar rhythm. */
  seed?: string;
  /** Lead color for card variant. */
  accent?: string;
  /** Card background surface. */
  surface?: "night" | "paper";
  className?: string;
  label?: string;
  animate?: boolean;
}

export default function JazzPosterArt({
  variant = "hero",
  motif = "bauhaus",
  seed = "north-gate",
  accent = P.terra,
  surface = "night",
  className,
  label = "Geometric jazz poster artwork",
  animate = true,
}: Props) {
  if (variant === "hero") return <HeroArt className={className} label={label} animate={animate} />;
  const common = { seed, surface, className, label, animate };
  if (motif === "keys") return <KeysArt {...common} />;
  if (motif === "slant") return <SlantArt {...common} />;
  return <CardArt {...common} accent={accent} />;
}

type MotifProps = { seed: string; surface: "night" | "paper"; className?: string; label: string; animate: boolean };

/** The Woodshed: a keyboard in ivory & cobalt with audio pulses rippling off a struck chord. */
function KeysArt({ seed, surface, className, label, animate }: MotifProps) {
  const r = rng(seed);
  const ivory = "#F6EFDF";
  const onPaper = surface === "paper";
  const bg = onPaper ? P.paperWarm : P.char;
  const whiteW = 20;
  const whites = Array.from({ length: 11 }, (_, i) => i * whiteW);
  // black keys follow the C-D-E / F-G-A-B pattern (no black after E and B)
  const blackAfter = [0, 1, 3, 4, 5, 7, 8, 10];
  const lit = new Set([2, 4, 6, 9]); // a "voicing" lit in cobalt
  const pulses = [24, 44, 66, 90, 116];
  const wave = Array.from({ length: 30 }, (_, i) => {
    const x = 230 + i * 5.6;
    const y = 112 + Math.sin(i * 0.9) * (6 + r() * 26) * Math.exp(-i / 22);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 400 225" className={className} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`jpa-k-${seed}`}>
          <rect x="210" width="190" height="225" />
        </clipPath>
      </defs>
      <rect width="400" height="225" fill={bg} />
      {/* keyboard */}
      <g transform="translate(-4 34)">
        {whites.map((x, i) => (
          <rect key={x} x={x + 6} y="0" width={whiteW - 2} height="150" fill={ivory} stroke={P.ink} strokeOpacity="0.25" />
        ))}
        {blackAfter.map((i) => (
          <rect key={`b${i}`} x={i * whiteW + 6 + whiteW - 5} y="0" width="9" height="90" fill={P.cobalt} />
        ))}
        {/* the voicing being played: cobalt dots on the struck keys */}
        {[...lit].map((i) => (
          <circle key={`l${i}`} cx={i * whiteW + 6 + (whiteW - 2) / 2} cy="128" r="5" fill={P.cobalt} />
        ))}
      </g>
      {/* cobalt stage with pulses */}
      <rect x="210" width="190" height="225" fill={P.cobalt} />
      <g clipPath={`url(#jpa-k-${seed})`} fill="none" stroke={ivory}>
        {pulses.map((rad, i) => (
          <circle
            key={rad}
            cx="214"
            cy="112"
            r={rad}
            strokeWidth={i === 0 ? 3 : 1.4}
            strokeOpacity={1 - i * 0.16}
            className={animate ? "pulse-ring" : undefined}
            style={animate ? { animationDelay: `${i * 0.35}s` } : undefined}
          />
        ))}
        <path d={wave} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <rect x="0" y="200" width="90" height="25" fill={P.crimson} />
      <circle cx="372" cy="28" r="9" fill={ivory} />
    </svg>
  );
}

/** Bet on Dave: chaotic slanted crimson/orange bars with a tumbling body and a betting-slip trajectory. */
function SlantArt({ seed, surface, className, label, animate }: MotifProps) {
  const r = rng(seed);
  const bg = surface === "paper" ? P.paperWarm : P.night;
  const colors = [P.crimson, P.terra, P.crimson, P.terra, P.cream];
  const bars = Array.from({ length: 16 }, () => ({
    x: Math.round(r() * 400),
    y: Math.round(-20 + r() * 220),
    w: 70 + Math.round(r() * 170),
    h: 5 + Math.round(r() * 16),
    a: Math.round(-58 + r() * 116),
    c: colors[Math.floor(r() * colors.length)],
  }));

  return (
    <svg viewBox="0 0 400 225" className={className} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="225" fill={bg} />
      <polygon points="250,0 400,0 400,225 170,225" fill={P.char} />
      {bars.map((b, i) => (
        <rect key={i} x={b.x - b.w / 2} y={b.y} width={b.w} height={b.h} fill={b.c} opacity={b.c === P.cream ? 0.8 : 1} transform={`rotate(${b.a} ${b.x} ${b.y})`} />
      ))}
      {/* trajectory of a launched ragdoll */}
      <path d="M30 200 Q150 -30 330 150" fill="none" stroke={P.cream} strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.7" />
      {/* tumbling geometric body */}
      <g transform="translate(250 92) rotate(-28)">
      <g className={animate ? "tumble" : undefined}>
        <rect x="-11" y="-14" width="22" height="30" fill={P.cream} />
        <circle cx="0" cy="-24" r="9" fill={P.cream} />
        <rect x="-30" y="-12" width="19" height="6" fill={P.terra} transform="rotate(-30 -11 -9)" />
        <rect x="11" y="-12" width="19" height="6" fill={P.terra} transform="rotate(40 11 -9)" />
        <rect x="-10" y="16" width="7" height="22" fill={P.crimson} transform="rotate(20 -6 16)" />
        <rect x="3" y="16" width="7" height="22" fill={P.crimson} transform="rotate(-35 6 16)" />
      </g>
      </g>
      {/* odds chip */}
      <g transform="translate(352 40) rotate(12)">
        <rect x="-26" y="-14" width="52" height="28" fill={P.crimson} />
        <text x="0" y="5" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="17" fill="#FFF8EC">
          7 : 2
        </text>
      </g>
      <rect x="0" y="200" width="90" height="25" fill={P.terra} />
    </svg>
  );
}

function HeroArt({ className, label, animate }: { className?: string; label: string; animate: boolean }) {
  const bars = [
    { x: 222, h: 150, c: P.cream },
    { x: 244, h: 205, c: P.terra },
    { x: 266, h: 120, c: P.crimson },
    { x: 288, h: 250, c: P.terra },
    { x: 310, h: 175, c: P.cream },
    { x: 332, h: 290, c: P.crimson },
    { x: 354, h: 210, c: P.terra },
    { x: 376, h: 140, c: P.cream },
  ];
  const base = 360;
  const stripes = [96, 124, 146, 178, 196, 226, 262, 284];
  return (
    <svg viewBox="0 0 400 520" className={className} role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="jpa-half">
          <path d="M200 40 A150 150 0 0 0 200 340 Z" />
        </clipPath>
      </defs>

      {/* canvas halves */}
      <rect width="400" height="520" fill={P.char} />
      <rect x="200" width="200" height="520" fill={P.night} />

      {/* Bauhaus half disc with stave stripes */}
      <path d="M200 40 A150 150 0 0 0 200 340 Z" fill={P.terra} />
      <g clipPath="url(#jpa-half)">
        {stripes.map((y, i) => (
          <rect key={y} x={i % 3 === 0 ? 50 : 80} y={y} width="160" height={i % 2 ? 9 : 14} fill={P.night} />
        ))}
        <rect x="120" y="226" width="80" height="22" fill={P.cream} opacity="0.85" />
      </g>
      <rect x="196" y="40" width="8" height="300" fill={P.crimson} />

      {/* equalizer / piano bars with strings */}
      {bars.map((b, i) => (
        <g key={b.x}>
          <line x1={b.x + 6} y1={base} x2={b.x + 6} y2={500} stroke={P.cream} strokeOpacity="0.35" strokeWidth="1" />
          <rect
            x={b.x}
            y={base - b.h}
            width="12"
            height={b.h}
            fill={b.c}
            className={animate ? "eq-bar" : undefined}
            style={animate ? { animationDelay: `${-i * 0.37}s` } : undefined}
          />
        </g>
      ))}
      <path d="M332 70 l12 -10 v20 z" fill={P.crimson} />

      {/* gallery-paper plate with cobalt ink club facade */}
      <rect x="0" y="352" width="200" height="168" fill={P.paperWarm} />
      <g fill="none" stroke={P.cobalt} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* sidewalk perspective */}
        <path d="M6 506 L196 470" />
        <path d="M6 516 L120 496" />
        <path d="M70 495 L104 474" />
        {/* building */}
        <path d="M40 486 V396 H176 V478" />
        <path d="M150 396 V362" />
        {/* wavy awning */}
        <path d="M34 432 C60 420 90 438 118 426 S170 420 182 428 V442 C160 436 130 450 104 442 S52 444 34 448 Z" />
        <circle cx="62" cy="438" r="1.6" />
        <circle cx="96" cy="436" r="1.6" />
        <circle cx="132" cy="434" r="1.6" />
        <circle cx="162" cy="432" r="1.6" />
        {/* doors & window */}
        <path d="M56 486 V452 H82 V482" />
        <path d="M69 452 V484" />
        <rect x="104" y="454" width="58" height="24" />
        {/* flagpole */}
        <path d="M118 400 L158 368" />
        <circle cx="159" cy="367" r="2" />
      </g>
      {/* flag with a note glyph (generic, not a venue logo) */}
      <path d="M124 394 L152 372 L160 408 L132 428 Z" fill={P.cobalt} />
      <path d="M140 414 V398 l8 -4" fill="none" stroke={P.paperWarm} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="138" cy="414" r="3" fill={P.paperWarm} />
      {/* tree scribble */}
      <path
        d="M16 470 V430 M16 430 c-10 -4 -10 -18 0 -20 c-4 -12 12 -18 16 -8 c8 -8 20 2 12 12 c8 6 0 18 -10 14 c-4 8 -16 6 -18 2"
        fill="none"
        stroke={P.cobalt}
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* crimson foot block */}
      <rect x="200" y="500" width="200" height="20" fill={P.crimson} />
    </svg>
  );
}

function CardArt({
  seed,
  accent,
  surface,
  className,
  label,
  animate,
}: {
  seed: string;
  accent: string;
  surface: "night" | "paper";
  className?: string;
  label: string;
  animate: boolean;
}) {
  const r = rng(seed);
  const onPaper = surface === "paper";
  const bg = onPaper ? P.paperWarm : P.char;
  const block = onPaper ? P.ink : P.night;
  const stripe = onPaper ? P.paperWarm : P.night;
  const palette = [accent, P.crimson, P.terra, onPaper ? P.cobalt : P.cream];
  const count = 9;
  const bars = Array.from({ length: count }, (_, i) => ({
    x: 228 + i * 18,
    h: 50 + Math.round(r() * 120),
    c: palette[Math.floor(r() * palette.length)],
  }));
  const stripes = Array.from({ length: 6 }, (_, i) => 52 + i * 22 + Math.round(r() * 6));

  return (
    <svg viewBox="0 0 400 225" className={className} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`jpa-c-${seed}`}>
          <path d="M200 20 A100 100 0 0 0 200 220 Z" />
        </clipPath>
      </defs>
      <rect width="400" height="225" fill={bg} />
      <rect x="210" width="190" height="225" fill={block} />
      <path d="M200 20 A100 100 0 0 0 200 220 Z" fill={accent} />
      <g clipPath={`url(#jpa-c-${seed})`}>
        {stripes.map((y, i) => (
          <rect key={y} x={i % 2 ? 110 : 130} y={y} width="100" height={i % 3 === 0 ? 10 : 6} fill={stripe} />
        ))}
      </g>
      {bars.map((b, i) => (
        <g key={b.x}>
          <line x1={b.x + 5} y1={190} x2={b.x + 5} y2={225} stroke={P.cream} strokeOpacity="0.3" />
          <rect
            x={b.x}
            y={190 - b.h}
            width="10"
            height={b.h}
            fill={b.c}
            className={animate ? "eq-bar" : undefined}
            style={animate ? { animationDelay: `${-i * 0.41}s` } : undefined}
          />
        </g>
      ))}
      <rect x="0" y="200" width="90" height="25" fill={P.crimson} />
    </svg>
  );
}
