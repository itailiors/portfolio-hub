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

interface Props {
  variant?: "hero" | "card";
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
  seed = "north-gate",
  accent = P.terra,
  surface = "night",
  className,
  label = "Geometric jazz poster artwork",
  animate = true,
}: Props) {
  return variant === "hero" ? (
    <HeroArt className={className} label={label} animate={animate} />
  ) : (
    <CardArt seed={seed} accent={accent} surface={surface} className={className} label={label} animate={animate} />
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
