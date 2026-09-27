import { useState } from "react";
import Avatar, { BODY_COLORS, FACES, HEADPIECES } from "../components/Avatar.jsx";

const CATEGORIES = [
  { key: "bodyColor", label: "Körperfarbe", options: BODY_COLORS },
  { key: "face", label: "Gesichtsausdruck", options: FACES },
  { key: "headpiece", label: "Kopfbedeckung", options: HEADPIECES },
];

function Picker({ label, options, value, onChange }) {
  const cycle = (dir) => onChange((value + dir + options.length) % options.length);
  return (
    <div className="stack" style={{ gap: 8 }}>
      <p style={{ fontSize: 13 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="btn secondary" style={{ padding: "8px 14px" }} onClick={() => cycle(-1)} aria-label={`${label} zurück`}>‹</button>
        <div className="chip" style={{ flex: 1, justifyContent: "center", textTransform: "capitalize" }}>
          {typeof options[value] === "string" && options[value].startsWith("#") ? `Farbe ${value + 1}` : options[value]}
        </div>
        <button className="btn secondary" style={{ padding: "8px 14px" }} onClick={() => cycle(1)} aria-label={`${label} vor`}>›</button>
      </div>
    </div>
  );
}

export default function AvatarEditor({ initial, onSave, saving }) {
  const [avatar, setAvatar] = useState(
    initial || { bodyColor: 0, face: 0, headpiece: 0 }
  );

  const randomize = () => {
    setAvatar({
      bodyColor: Math.floor(Math.random() * BODY_COLORS.length),
      face: Math.floor(Math.random() * FACES.length),
      headpiece: Math.floor(Math.random() * HEADPIECES.length),
    });
  };

  return (
    <div className="stack" style={{ alignItems: "center" }}>
      <div className="card" style={{ display: "flex", justifyContent: "center", padding: 28 }}>
        <Avatar avatar={avatar} size={140} />
      </div>

      <div className="stack" style={{ width: "100%" }}>
        {CATEGORIES.map((cat) => (
          <Picker
            key={cat.key}
            label={cat.label}
            options={cat.options}
            value={avatar[cat.key]}
            onChange={(v) => setAvatar((a) => ({ ...a, [cat.key]: v }))}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button className="btn secondary" style={{ flex: 1 }} onClick={randomize}>🎲 Zufall</button>
        <button className="btn" style={{ flex: 1 }} disabled={saving} onClick={() => onSave(avatar)}>
          {saving ? "Speichern…" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
