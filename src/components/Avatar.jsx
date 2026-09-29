// Alle Optionen für den Avatar-Editor. Jede Kategorie ist eine reine Liste,
// gespeichert wird nur der Index -> extrem kompaktes Datenmodell.

export const BODY_COLORS = [
  "#E8A33D", // Safran
  "#C1542F", // Tomate
  "#7A9B5E", // Kräutergrün
  "#4E7F9B", // Ozeanblau
  "#9B5EA0", // Pflaume
  "#D9C36A", // Senfgelb
  "#E07A9E", // Altrosa
  "#5E6B9B", // Indigo
  "#3F9C8C", // Petrol
  "#E8875A", // Koralle
  "#6B4A2F", // Schokobraun
  "#8FC9A5", // Minze
  "#B79FD1", // Lavendel
  "#4A4A4A", // Graphit
  "#F2C29A", // Pfirsich
];

export const FACES = [
  "happy", "cool", "surprised", "sleepy", "winking", "grinning",
  "hearts", "chef", "yum", "horn", "kiss", "blush", "cat",
];

export const FACE_LABELS = {
  happy: "Fröhlich", cool: "Cool", surprised: "Überrascht", sleepy: "Verschlafen",
  winking: "Zwinkernd", grinning: "Breites Grinsen", hearts: "Verliebt", chef: "Chefkoch",
  yum: "Lecker", horn: "Party-Tröte", kiss: "Kussmund", blush: "Verlegen", cat: "Katze",
};

export const HEADPIECES = [
  "none", "chefhat", "cap", "bandana", "crown", "beanie", "headband", "party",
  "flower", "flowercrown", "turban", "kopftuch", "afro", "stars", "hearts",
];

export const HEAD_LABELS = {
  none: "Keine", chefhat: "Kochmütze", cap: "Cap", bandana: "Bandana", crown: "Krone",
  beanie: "Beanie", headband: "Stirnband", party: "Partyhut", flower: "Blume",
  flowercrown: "Blumenkranz", turban: "Turban", kopftuch: "Kopftuch", afro: "Afro",
  stars: "Sternchen", hearts: "Herzchen",
};

function Face({ type, color }) {
  switch (type) {
    case "cool":
      return (
        <g>
          <rect x="24" y="38" width="14" height="7" rx="3" fill="#1c1a17" />
          <rect x="42" y="38" width="14" height="7" rx="3" fill="#1c1a17" />
          <rect x="38" y="41" width="4" height="2" fill="#1c1a17" />
          <path d="M30 58 Q40 62 50 58" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "surprised":
      return (
        <g>
          <circle cx="30" cy="41" r="4.5" fill="#1c1a17" />
          <circle cx="50" cy="41" r="4.5" fill="#1c1a17" />
          <circle cx="40" cy="58" r="5" fill="#1c1a17" />
        </g>
      );
    case "sleepy":
      return (
        <g>
          <path d="M25 41 Q30 37 35 41" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M45 41 Q50 37 55 41" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M32 58 Q40 56 48 58" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "winking":
      return (
        <g>
          <circle cx="30" cy="41" r="4.5" fill="#1c1a17" />
          <path d="M45 41 Q50 37 55 41" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M28 56 Q40 66 52 56" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "grinning":
      return (
        <g>
          <circle cx="30" cy="41" r="4.5" fill="#1c1a17" />
          <circle cx="50" cy="41" r="4.5" fill="#1c1a17" />
          <path d="M26 54 Q40 68 54 54 Z" fill="#1c1a17" />
          <path d="M30 55 L50 55 L48 60 L32 60 Z" fill="#fff" />
        </g>
      );
    case "hearts":
      return (
        <g fill="#c1542f">
          <path d="M30 38c-3-3-8-1-8 3 0 4 8 8 8 8s8-4 8-8c0-4-5-6-8-3z" />
          <path d="M50 38c-3-3-8-1-8 3 0 4 8 8 8 8s8-4 8-8c0-4-5-6-8-3z" />
          <path d="M30 58 Q40 64 50 58" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "chef":
      return (
        <g>
          <circle cx="30" cy="41" r="4.5" fill="#1c1a17" />
          <circle cx="50" cy="41" r="4.5" fill="#1c1a17" />
          <path d="M33 58 Q40 54 47 58" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M20 46 h4 M56 46 h4 M18 40 l3 2 M62 40 l-3 2" stroke="#1c1a17" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "yum":
      return (
        <g>
          <path d="M24 40 Q29 35 34 40" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M46 40 Q51 35 56 40" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M23 51 Q40 74 57 51 Z" fill="#1c1a17" />
          <path d="M31 54 Q31 73 40 73 Q49 73 49 54 Z" fill="#c1542f" />
          <path d="M35 58 Q35 67 40 67 Q45 67 45 58" fill="none" stroke="#8a3a20" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    case "horn":
      return (
        <g>
          <path d="M23 39 L34 36" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M46 36 L57 39" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="45" cy="58" r="3.2" fill="#1c1a17" />
          <path d="M48 57 L64 51 L63 61 Z" fill="#c1542f" />
          <circle cx="65" cy="52" r="2.6" fill="#e8a33d" />
          <g strokeLinecap="round">
            <rect x="14" y="26" width="4" height="4" fill="#4e7f9b" transform="rotate(20 16 28)" />
            <rect x="60" y="24" width="4" height="4" fill="#7a9b5e" transform="rotate(-15 62 26)" />
            <rect x="18" y="60" width="4" height="4" fill="#e07a9e" transform="rotate(10 20 62)" />
          </g>
        </g>
      );
    case "kiss":
      return (
        <g>
          <circle cx="30" cy="43" r="6" fill="#1c1a17" />
          <circle cx="27.5" cy="40.5" r="1.6" fill="#fff" />
          <circle cx="50" cy="43" r="6" fill="#1c1a17" />
          <circle cx="47.5" cy="40.5" r="1.6" fill="#fff" />
          <path d="M42 53 q-7 -5 -7 3 q0 8 7 3" stroke="#1c1a17" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="22" cy="52" rx="4.5" ry="2.6" fill="#e07a9e" opacity="0.75" />
          <ellipse cx="58" cy="52" rx="4.5" ry="2.6" fill="#e07a9e" opacity="0.75" />
        </g>
      );
    case "blush":
      return (
        <g>
          <path d="M24 41 Q30 35 36 41" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M44 41 Q50 35 56 41" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M27 55 Q40 67 53 55" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="21" cy="51" rx="5" ry="3" fill="#e8875a" opacity="0.7" />
          <ellipse cx="59" cy="51" rx="5" ry="3" fill="#e8875a" opacity="0.7" />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M14 24 L26 10 L28 30 Z" fill={color || "#c1a27a"} stroke="#1c1a17" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M66 24 L54 10 L52 30 Z" fill={color || "#c1a27a"} stroke="#1c1a17" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M18 22 L24 14 L25 27 Z" fill="#f0cdb0" />
          <path d="M62 22 L56 14 L55 27 Z" fill="#f0cdb0" />
          <path d="M24 40 Q28 36 33 40" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M47 40 Q52 36 56 40" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M40 48 l-3 4 h6 Z" fill="#e07a9e" />
          <path d="M40 52 Q40 56 34 57 M40 52 Q40 56 46 57" stroke="#1c1a17" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <g stroke="#1c1a17" strokeWidth="1.3" strokeLinecap="round" opacity="0.75">
            <path d="M10 48 L22 46 M10 54 L22 52" />
            <path d="M70 48 L58 46 M70 54 L58 52" />
          </g>
        </g>
      );
    default:
      return (
        <g>
          <circle cx="30" cy="41" r="4.5" fill="#1c1a17" />
          <circle cx="50" cy="41" r="4.5" fill="#1c1a17" />
          <path d="M28 56 Q40 66 52 56" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

function Headpiece({ type }) {
  switch (type) {
    case "chefhat":
      return (
        <g>
          <path d="M22 24 Q22 6 40 6 Q58 6 58 24 L58 28 L22 28 Z" fill="#f2ede4" />
          <rect x="24" y="24" width="32" height="8" rx="3" fill="#f2ede4" />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M18 26 Q18 8 40 8 Q62 8 62 26 Z" fill="#c1542f" />
          <path d="M56 22 Q70 22 70 28 Q70 32 58 30 Z" fill="#a33f21" />
        </g>
      );
    case "bandana":
      return (
        <g>
          <path d="M16 24 Q40 6 64 24 L64 20 Q40 4 16 20 Z" fill="#4e7f9b" />
          <circle cx="24" cy="17" r="2" fill="#f2ede4" />
          <circle cx="32" cy="13" r="2" fill="#f2ede4" />
          <circle cx="48" cy="13" r="2" fill="#f2ede4" />
          <circle cx="56" cy="17" r="2" fill="#f2ede4" />
        </g>
      );
    case "crown":
      return (
        <g fill="#e8c33d">
          <path d="M18 26 L22 10 L32 20 L40 6 L48 20 L58 10 L62 26 Z" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M18 26 Q18 4 40 4 Q62 4 62 26 Z" fill="#7a9b5e" />
          <rect x="18" y="20" width="44" height="7" rx="3" fill="#5e7a48" />
          <circle cx="40" cy="4" r="4" fill="#f2ede4" />
        </g>
      );
    case "headband":
      return (
        <g>
          <rect x="16" y="18" width="48" height="7" rx="3" fill="#e07a9e" />
          <circle cx="60" cy="16" r="4" fill="#e07a9e" />
        </g>
      );
    case "party":
      return (
        <g>
          <path d="M28 26 L40 2 L52 26 Z" fill="#9b5ea0" />
          <circle cx="40" cy="2" r="3" fill="#e8c33d" />
        </g>
      );
    case "flower": {
      const petal = (rot) => (
        <ellipse cx="0" cy="-5" rx="3.4" ry="5" fill="#e07a9e" transform={`rotate(${rot})`} />
      );
      return (
        <g transform="translate(56 14)">
          {[0, 72, 144, 216, 288].map((r) => <g key={r}>{petal(r)}</g>)}
          <circle r="3" fill="#e8c33d" />
        </g>
      );
    }
    case "flowercrown": {
      const bloom = (cx, cy, s, c) => (
        <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy}) scale(${s})`}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-3.4" rx="2.2" ry="3.2" fill={c} transform={`rotate(${r})`} />
          ))}
          <circle r="1.8" fill="#e8c33d" />
        </g>
      );
      return (
        <g>
          <path d="M16 24 Q40 10 64 24" stroke="#7a9b5e" strokeWidth="4" fill="none" strokeLinecap="round" />
          {bloom(20, 21, 1, "#e07a9e")}
          {bloom(31, 14, 1.1, "#e8a33d")}
          {bloom(44, 12, 1.1, "#c1542f")}
          {bloom(57, 18, 1, "#9b5ea0")}
          {bloom(63, 24, 0.9, "#e07a9e")}
        </g>
      );
    }
    case "turban":
      return (
        <g>
          <path d="M16 27 Q16 4 40 4 Q64 4 64 27 Z" fill="#5e6b9b" />
          <path d="M16 22 Q40 30 64 22" stroke="#454f79" strokeWidth="2.5" fill="none" />
          <path d="M22 12 Q40 22 58 12" stroke="#454f79" strokeWidth="2" fill="none" />
          <circle cx="40" cy="6" r="3.4" fill="#e8c33d" />
        </g>
      );
    case "kopftuch":
      return (
        <g>
          <path d="M15 27 Q15 5 40 5 Q65 5 65 27 Z" fill="#c1542f" />
          <path d="M40 5 L34 -4 L46 -4 Z" fill="#c1542f" />
          <circle cx="40" cy="3" r="3" fill="#a33f21" />
          <circle cx="24" cy="16" r="1.6" fill="#f2ede4" />
          <circle cx="34" cy="10" r="1.6" fill="#f2ede4" />
          <circle cx="46" cy="10" r="1.6" fill="#f2ede4" />
          <circle cx="56" cy="16" r="1.6" fill="#f2ede4" />
        </g>
      );
    case "afro":
      return (
        <g fill="#3b2a20">
          <circle cx="40" cy="16" r="20" />
          <circle cx="22" cy="24" r="9" />
          <circle cx="58" cy="24" r="9" />
          <circle cx="16" cy="32" r="6" />
          <circle cx="64" cy="32" r="6" />
        </g>
      );
    case "stars":
      return (
        <g fill="#e8c33d">
          <path d="M18 18 l1.6 3.4 3.6.5-2.6 2.6.6 3.7-3.2-1.8-3.2 1.8.6-3.7-2.6-2.6 3.6-.5Z" />
          <path d="M62 20 l1.4 3 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5Z" />
          <path d="M42 2 l1 2.2 2.4.3-1.7 1.7.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.7-1.7 2.4-.3Z" />
        </g>
      );
    case "hearts":
      return (
        <g fill="#e07a9e">
          <path d="M17 22c-2-2-5.4-.7-5.4 2 0 2.6 5.4 5.4 5.4 5.4s5.4-2.8 5.4-5.4c0-2.7-3.4-4-5.4-2z" />
          <path d="M63 22c-2-2-5.4-.7-5.4 2 0 2.6 5.4 5.4 5.4 5.4s5.4-2.8 5.4-5.4c0-2.7-3.4-4-5.4-2z" />
          <path d="M40 4c-1.6-1.6-4.4-.6-4.4 1.6 0 2.1 4.4 4.4 4.4 4.4s4.4-2.3 4.4-4.4c0-2.2-2.8-3.2-4.4-1.6z" />
        </g>
      );
    default:
      return null;
  }
}

export default function Avatar({ avatar, size = 64 }) {
  const { bodyColor = 0, face = 0, headpiece = 0 } = avatar || {};
  const color = BODY_COLORS[bodyColor % BODY_COLORS.length];
  const faceType = FACES[face % FACES.length];
  const headType = HEADPIECES[headpiece % HEADPIECES.length];

  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <circle cx="40" cy="44" r="30" fill={color} />
        <Face type={faceType} color={color} />
        <Headpiece type={headType} />
      </svg>
    </div>
  );
}