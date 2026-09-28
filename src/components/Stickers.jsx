import { useState } from "react";

/* Alle Motive sind selbst gezeichnete SVGs (viewBox 0 0 100 100), angelehnt an
   die Scrapbook-Stimmung der Referenzen. Den weißen Stanzrand liefert CSS
   (.sticker-svg -> drop-shadow), deshalb sind die Formen hier bewusst flach. */

function Gingham({ id, a = "#f6ecd3", b = "#3f3a3a", size = 6 }) {
  return (
    <pattern id={id} width={size * 2} height={size * 2} patternUnits="userSpaceOnUse">
      <rect width={size * 2} height={size * 2} fill={a} />
      <rect width={size} height={size} fill={b} opacity=".9" />
      <rect x={size} y={size} width={size} height={size} fill={b} opacity=".9" />
    </pattern>
  );
}

/* ---- Jahreszeiten-Glyphen für den Stempel ---- */
const GLYPHS = {
  pumpkin: (
    <g>
      <ellipse cx="20" cy="38" rx="13" ry="17" fill="#c58448" />
      <ellipse cx="40" cy="38" rx="13" ry="17" fill="#c58448" />
      <ellipse cx="30" cy="38" rx="12" ry="19" fill="#d8985a" />
      <path d="M29 18 q1-9 6-11" stroke="#6b4a2f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M34 13 q7-3 9 2" stroke="#7d9a5a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  berry: (
    <g>
      <path d="M30 56 C8 46 8 20 30 20 C52 20 52 46 30 56Z" fill="#b8453f" />
      <path d="M20 16 l10 8 10-8 -4 10 -6 -3 -6 3Z" fill="#6f8f55" />
      {[[22, 30], [34, 28], [28, 40], [38, 38], [20, 40]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.6" ry="2.4" fill="#f3d9a4" />
      ))}
    </g>
  ),
  flake: (
    <g stroke="#6d8296" strokeWidth="3" strokeLinecap="round" fill="none">
      {[0, 60, 120].map((r) => (
        <g key={r} transform={`rotate(${r} 30 32)`}>
          <line x1="30" y1="8" x2="30" y2="56" />
          <path d="M24 14l6 6 6-6M24 50l6-6 6 6" />
        </g>
      ))}
    </g>
  ),
  tulip: (
    <g>
      <path d="M30 56 V30" stroke="#6f8f55" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M30 46 q-14-4-16-14 M30 42 q12-2 16-12" stroke="#6f8f55" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M17 14 q0 20 13 20 q13 0 13-20 l-7 7 -6-9 -6 9Z" fill="#c9667a" />
    </g>
  ),
};

function Stamp({ glyph = "pumpkin", label = "Herbst", sub = "Kochbuch" }) {
  // Perforierter Rand: Kreise entlang der Kanten werden aus der Form ausgestanzt.
  const W = 100, H = 124, holes = [];
  for (let x = 6; x < W; x += 12) { holes.push([x, 0], [x, H]); }
  for (let y = 6; y < H; y += 12) { holes.push([0, y], [W, y]); }
  return (
    <svg className="sticker-svg" viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <mask id="perf">
          <rect width={W} height={H} fill="#fff" />
          {holes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.2" fill="#000" />)}
        </mask>
      </defs>
      <g mask="url(#perf)">
        <rect width={W} height={H} fill="#f7f0dc" />
        <rect x="9" y="9" width={W - 18} height={H - 18} fill="none" stroke="#b79a72" strokeWidth="1.2" />
        <text x="14" y="24" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="10" fill="#7a5f45">{sub}</text>
        <g transform="translate(20 28) scale(1.0)">{GLYPHS[glyph]}</g>
        <text x="50" y="106" textAnchor="middle" fontFamily="Chewy, cursive" fontSize="17" fill="#5b432f">{label}</text>
      </g>
    </svg>
  );
}

function Jar() {
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs><Gingham id="g-lid" /></defs>
      <path d="M22 40 h56 q6 0 6 8 v34 q0 10-10 10 H26 q-10 0-10-10 V48 q0-8 6-8Z" fill="#9c3a3f" />
      <path d="M26 52 q0 30 6 36" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="32" y="56" width="36" height="24" rx="4" fill="#f6ecd3" />
      <path d="M38 64h24M38 71h16" stroke="#9c3a3f" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 28 q32-12 64 0 l2 16 q-34 8-68 0Z" fill="url(#g-lid)" />
      <path d="M18 28 q32-12 64 0" stroke="#3f3a3a" strokeWidth="1.5" fill="none" />
      <path d="M16 42 q34 10 68 0" stroke="#b58b4f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M50 46 q-6 8-2 14 M50 46 q8 6 6 14" stroke="#b58b4f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Candle() {
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M28 46 h44 q4 0 4 6 v30 q0 8-8 8 H32 q-8 0-8-8 V52 q0-6 4-6Z" fill="#b3642b" />
      <path d="M31 54 q0 22 4 30" stroke="#fff" strokeOpacity=".3" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="33" y="58" width="34" height="22" rx="3" fill="#f6ecd3" />
      <path d="M38 65h24M38 72h14" stroke="#8a4c22" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="26" y="38" width="48" height="10" rx="3" fill="#5b3a26" />
      <path d="M50 38 v-8" stroke="#3a2a20" strokeWidth="2.4" strokeLinecap="round" />
      <g className="flame">
        <path d="M50 12 q10 10 4 19 q-4 3-8 0 q-6-9 4-19Z" fill="#f4a93a" />
        <path d="M50 20 q5 5 2 10 q-2 2-4 0 q-3-5 2-10Z" fill="#fde9a0" />
      </g>
    </svg>
  );
}

function Cookie() {
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="52" r="38" fill="#c98f52" />
      <circle cx="50" cy="50" r="35" fill="#dcaa6c" />
      <path d="M22 40 q8-14 24-16" stroke="#f0cf9a" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".7" />
      {[[36, 40, 7], [60, 36, 6], [48, 58, 7], [66, 58, 6], [30, 62, 5], [52, 30, 4]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.8} fill="#5a3a26" transform={`rotate(${i * 25} ${x} ${y})`} />
      ))}
    </svg>
  );
}

function Berry() {
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M50 92 C14 74 12 34 50 32 C88 34 86 74 50 92Z" fill="#c04a48" />
      <path d="M30 42 q4 26 14 40" stroke="#fff" strokeOpacity=".28" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M28 30 l14 10 8-14 8 14 14-10 -6 16 q-16 8-32 0Z" fill="#6f8f55" />
      <path d="M50 26 v-10" stroke="#5b7a45" strokeWidth="4" strokeLinecap="round" />
      {[[38, 54], [56, 52], [48, 66], [64, 66], [34, 70], [50, 80]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.2" ry="3.2" fill="#f5dfae" />
      ))}
    </svg>
  );
}

function Bow() {
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M46 52 L20 84 l14 2 10-16Z M54 52 L80 84 l-14 2 -10-16Z" fill="#dc8fa8" />
      <path d="M46 50 C28 20 6 22 8 46 C10 66 34 62 46 50Z" fill="#eaa9bd" />
      <path d="M54 50 C72 20 94 22 92 46 C90 66 66 62 54 50Z" fill="#eaa9bd" />
      <path d="M40 48 C30 34 18 34 16 46" stroke="#d4809b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 48 C70 34 82 34 84 46" stroke="#d4809b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="42" y="42" width="16" height="18" rx="6" fill="#d4809b" />
    </svg>
  );
}

function Roll() {
  // Archimedische Spirale als Teigschnecke
  const pts = [];
  for (let t = 0; t <= 4 * Math.PI * 1.9; t += 0.25) {
    const r = 3 + t * 1.5;
    pts.push(`${(50 + r * Math.cos(t)).toFixed(1)},${(50 + r * Math.sin(t)).toFixed(1)}`);
  }
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="41" fill="#e3bd86" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#c28d52" strokeWidth="4" />
      <path d={"M" + pts.join(" L")} stroke="#a86a35" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M22 42 q6-17 25-19 q-6 8-2 12 q10-6 21 0 q9 6 4 14 q11 0 13 11 q-15 7-32 2 q-11 6-23-2 q-4-8-6-18Z" fill="#fff8ea" opacity=".9" />
    </svg>
  );
}

function Fawn() {
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <ellipse cx="46" cy="70" rx="34" ry="19" fill="#b56e3d" />
      <ellipse cx="30" cy="84" rx="14" ry="6" fill="#a25f32" />
      <ellipse cx="64" cy="84" rx="12" ry="5.5" fill="#a25f32" />
      <path d="M62 66 q10-12 12-26" stroke="#b56e3d" strokeWidth="14" strokeLinecap="round" fill="none" />
      <circle cx="76" cy="36" r="15" fill="#c07d48" />
      <ellipse cx="88" cy="42" rx="8" ry="6" fill="#e6c399" />
      <ellipse cx="94" cy="41" rx="2.4" ry="2" fill="#4a2e22" />
      <path d="M66 26 q-10-16 -4-22 q10 4 12 20Z" fill="#a25f32" />
      <path d="M80 24 q4-16 12-18 q4 8 -4 22Z" fill="#a25f32" />
      <circle cx="80" cy="34" r="2" fill="#2f1f18" />
      {[[30, 62, 2.6], [42, 56, 2.4], [56, 60, 2.6], [36, 72, 2.2], [52, 72, 2.4], [22, 70, 2]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fbf1dc" />
      ))}
    </svg>
  );
}

function Sun() {
  return (
    <svg className="sticker-svg" viewBox="0 0 100 100" width="100%" height="100%">
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x="47" y="6" width="6" height="16" rx="3" fill="#e3a83c" transform={`rotate(${i * 36} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="24" fill="#f0bf55" />
      <circle cx="42" cy="46" r="2.6" fill="#5a3a26" />
      <circle cx="58" cy="46" r="2.6" fill="#5a3a26" />
      <path d="M40 57 q10 9 20 0" stroke="#5a3a26" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const ART = { stamp: Stamp, jar: Jar, candle: Candle, cookie: Cookie, berry: Berry, bow: Bow, roll: Roll, fawn: Fawn, sun: Sun };
const ANIM = { stamp: "wobble", jar: "hop", candle: "wobble", cookie: "spin", berry: "hop", bow: "wiggle", roll: "spin", fawn: "nod", sun: "spin" };
const LABELS = {
  stamp: "Briefmarke", jar: "Marmeladenglas", candle: "Kerze", cookie: "Keks", berry: "Erdbeere",
  bow: "Schleife", roll: "Zimtschnecke", fawn: "Rehkitz", sun: "Sonne",
};

/**
 * Ein antippbarer Sticker. Reagiert auf Berühren/Hover mit einer Bewegung
 * (wackeln, hüpfen, drehen, nicken) und bewegt sich beim Scrollen leicht mit
 * (per --sy, das in useScrollVar() gesetzt wird).
 *
 * pos: beliebige CSS-Positionswerte (top/left/right/bottom)
 * par: Parallax-Faktor (px pro gescrolltem px), spin: Grad Drehung pro gescrolltem px
 */
export default function Sticker({ type, size = 64, rot = 0, par = 0, spin = 0, pos = {}, inline = false, glyph, label, sub }) {
  const [playing, setPlaying] = useState(false);
  const Art = ART[type];
  if (!Art) return null;
  const anim = ANIM[type];
  const trigger = () => setPlaying(true);
  const w = type === "stamp" ? size : size;
  const h = type === "stamp" ? size * 1.24 : size;

  return (
    <div
      className="sticker-pos"
      role="img"
      aria-label={LABELS[type]}
      onPointerEnter={trigger}
      onPointerDown={trigger}
      style={{ ...(inline ? { position: "relative" } : {}), ...pos, width: w, height: h, "--rot": `${rot}deg`, "--par": par, "--spin": spin }}
    >
      <div className={`sticker-anim ${playing ? `play-${anim}` : ""}`} onAnimationEnd={() => setPlaying(false)} style={{ width: "100%", height: "100%" }}>
        <Art glyph={glyph} label={label} sub={sub} />
      </div>
    </div>
  );
}
