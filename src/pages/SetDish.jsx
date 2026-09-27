import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, setDoc, auth } from "../firebase.js";
import { currentMonthId } from "../utils/rotation.js";
import { compressImage } from "../utils/imageCompress.js";

export default function SetDish() {
  const { group } = useApp();
  const navigate = useNavigate();
  const monthId = currentMonthId();

  const [dishName, setDishName] = useState("");
  const [introText, setIntroText] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImage(compressed);
  };

  const save = async () => {
    if (!dishName.trim()) return;
    setBusy(true);
    await setDoc(doc(db, "groups", group.id, "months", monthId), {
      hostUid: auth.currentUser.uid,
      dishName: dishName.trim(),
      introText: introText.trim(),
      recipeText: recipeText.trim(),
      recipeUrl: recipeUrl.trim(),
      referenceImageUrl: image || null,
      createdAt: new Date().toISOString(),
    });
    setBusy(false);
    navigate("/");
  };

  return (
    <div className="screen">
      <h2>Gericht des Monats</h2>
      <p>Alles außer dem Namen ist optional — Rezept und Bild könnt ihr auch später noch ergänzen.</p>

      <div className="stack">
        <label style={{ fontSize: 13 }}>Name des Gerichts *</label>
        <input placeholder="z. B. Kürbisrisotto" value={dishName} onChange={(e) => setDishName(e.target.value)} />
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>Kurze Einführung</label>
        <textarea rows={3} placeholder="Warum dieses Gericht? Worauf sollen die anderen achten?" value={introText} onChange={(e) => setIntroText(e.target.value)} />
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>Orientierungsbild (optional)</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {image && <img src={image} alt="Vorschau" style={{ width: "100%", borderRadius: "var(--radius-m)" }} />}
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>Rezept als Text (optional)</label>
        <textarea rows={4} placeholder="Zutaten & Zubereitung…" value={recipeText} onChange={(e) => setRecipeText(e.target.value)} />
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>oder Rezept-Link (optional)</label>
        <input placeholder="https://…" value={recipeUrl} onChange={(e) => setRecipeUrl(e.target.value)} />
      </div>

      <button className="btn block" disabled={!dishName.trim() || busy} onClick={save}>
        {busy ? "Speichern…" : "Challenge starten"}
      </button>
    </div>
  );
}
