// Alle Optionen für den Avatar-Editor. Jede Kategorie ist eine reine Liste,
// gespeichert wird nur der Index -> extrem kompaktes Datenmodell.

export const BODY_COLORS = [
  "#E8A33D", "#C1542F", "#7A9B5E", "#4E7F9B",
  "#9B5EA0", "#D9C36A", "#5E6B9B", "#E07A9E",
];

export const FACES = ["happy", "cool", "surprised", "sleepy", "winking", "grinning", "hearts", "chef"];

export const HEADPIECES = ["none", "chefhat", "cap", "bandana", "crown", "beanie", "headband", "party"];

function Face({ type }) {
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
        <Face type={faceType} />
        <Headpiece type={headType} />
      </svg>
    </div>
  );
}
