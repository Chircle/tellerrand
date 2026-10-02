import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, setDoc, getDoc, auth, onSnapshot } from "../firebase.js";
import { currentMonthId, monthLabel, hostForMonth } from "../utils/rotation.js";
import { compressImage, rotateImage } from "../utils/imageCompress.js";

export default function SetDish() {
  const { group } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const monthId = searchParams.get("month") || currentMonthId();

  const [dishName, setDishName] = useState("");
  const [hostUid, setHostUid] = useState(auth.currentUser.uid);
  const [introText, setIntroText] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [members, setMembers] = useState({});

  // Wer laut Rotation an der Reihe wäre — nur als sinnvolle Vorauswahl,
  // du kannst beim Nachtragen alter Monate jederzeit jemand anderen wählen.
  const suggestedHost = group
    ? hostForMonth(monthId, {
        seasonStart: group.seasonStart,
        rotationOrder: group.rotationOrder,
        skippedMonths: group.skippedMonths || [],
      })
    : null;

  useEffect(() => {
    if (!group) return;
    const unsubs = group.memberIds.map((uid) =>
      onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) setMembers((m) => ({ ...m, [uid]: snap.data() }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [group?.id]);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "groups", group.id, "months", monthId));
      if (snap.exists()) {
        const d = snap.data();
        setDishName(d.dishName || "");
        setHostUid(d.hostUid || auth.currentUser.uid);
        setIntroText(d.introText || "");
        setRecipeText(d.recipeText || "");
        setRecipeUrl(d.recipeUrl || "");
        setImage(d.referenceImageUrl || null);
      } else {
        setHostUid(suggestedHost || auth.currentUser.uid);
      }
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id, monthId]);

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
      hostUid,
      dishName: dishName.trim(),
      introText: introText.trim(),
      recipeText: recipeText.trim(),
      recipeUrl: recipeUrl.trim(),
      referenceImageUrl: image || null,
      updatedAt: new Date().toISOString(),
    });
    setBusy(false);
    navigate(monthId === currentMonthId() ? "/" : "/book");
  };

  const isPast = monthId !== currentMonthId();

  if (!loaded) return null;

  return (
    <div className="screen">
      <h2 className="title-label">Gericht — {monthLabel(monthId)}</h2>
      {isPast && <p>Du trägst hier einen vergangenen Monat nach. Passt schon so. 👍</p>}

      <div className="card stack" style={{ gap: 18 }}>
      <div className="stack">
        <label style={{ fontSize: 13 }}>Wer hat gekocht?</label>
        <select
          value={hostUid}
          onChange={(e) => setHostUid(e.target.value)}
          style={{ background: "var(--surface-raised)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius-s)", padding: "10px 12px", fontSize: 16 }}
        >
          {group.memberIds.map((uid) => (
            <option key={uid} value={uid}>
              {members[uid]?.displayName || "…"}{uid === suggestedHost ? " (laut Rotation)" : ""}
            </option>
          ))}
        </select>
      </div>

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
        {image && (
          <>
            <img src={image} alt="Vorschau" style={{ width: "100%", borderRadius: "var(--radius-m)" }} />
            <button
              type="button"
              className="btn secondary"
              onClick={async () => setImage(await rotateImage(image, 90))}
            >
              🔄 Drehen
            </button>
          </>
        )}
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>Rezept als Text (optional)</label>
        <textarea rows={4} placeholder="Zutaten & Zubereitung…" value={recipeText} onChange={(e) => setRecipeText(e.target.value)} />
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>oder Rezept-Link (optional)</label>
        <input placeholder="https://…" value={recipeUrl} onChange={(e) => setRecipeUrl(e.target.value)} />
      </div>

      </div>

      <button className="btn block" disabled={!dishName.trim() || busy} onClick={save}>
        {busy ? "Speichern…" : isPast ? "Speichern" : "Challenge starten"}
      </button>
    </div>
  );
}
