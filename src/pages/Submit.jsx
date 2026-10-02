import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, setDoc, getDoc, auth, serverTimestamp } from "../firebase.js";
import { currentMonthId, monthLabel } from "../utils/rotation.js";
import { compressImage, rotateImage } from "../utils/imageCompress.js";
import Stars from "../components/Stars.jsx";

export default function Submit() {
  const { group } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const monthId = searchParams.get("month") || currentMonthId();

  const [photo, setPhoto] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const camRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "groups", group.id, "months", monthId, "entries", auth.currentUser.uid));
      if (snap.exists()) {
        const d = snap.data();
        setPhoto(d.photoUrl || null);
        setRating(d.rating || 0);
        setComment(d.comment || "");
      } else {
        setPhoto(null);
        setRating(0);
        setComment("");
      }
      setLoaded(true);
    })();
  }, [group.id, monthId]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhoto(await compressImage(file));
  };

  const save = async () => {
    setBusy(true);
    await setDoc(doc(db, "groups", group.id, "months", monthId, "entries", auth.currentUser.uid), {
      photoUrl: photo || null,
      rating,
      comment: comment.trim(),
      createdAt: serverTimestamp(),
    });
    setBusy(false);
    navigate(monthId === currentMonthId() ? "/" : "/book");
  };

  const isPast = monthId !== currentMonthId();

  if (!loaded) return null;

  return (
    <div className="screen">
      <h2 className="title-label">Dein Gericht — {monthLabel(monthId)}</h2>
      {isPast && <p>Du trägst hier einen vergangenen Monat nach.</p>}

      <div className="card stack" style={{ gap: 18 }}>
      <div className="stack">
        <label style={{ fontSize: 13 }}>Foto</label>
          <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={handlePhoto} />
          <input ref={galleryRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn secondary" style={{ flex: 1 }} onClick={() => camRef.current?.click()}>📷 Foto aufnehmen</button>
            <button type="button" className="btn secondary" style={{ flex: 1 }} onClick={() => galleryRef.current?.click()}>🖼️ Aus Galerie</button>
          </div>
        {photo && (
          <>
            <img src={photo} alt="Dein Gericht" style={{ width: "100%", borderRadius: "var(--radius-m)" }} />
            <button
              type="button"
              className="btn secondary"
              onClick={async () => setPhoto(await rotateImage(photo, 90))}
            >
              🔄 Drehen
            </button>
          </>
        )}
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>Bewertung</label>
        <Stars value={rating} onChange={setRating} size="lg" />
        <p style={{ fontSize: 13 }}>{rating > 0 ? `${rating} von 5 Sternen` : "Tippe auf einen Stern"}</p>
      </div>

      <div className="stack">
        <label style={{ fontSize: 13 }}>Kommentar (optional)</label>
        <textarea rows={3} placeholder="Wie ist es gelaufen?" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      </div>

      <button className="btn block" disabled={rating === 0 || busy} onClick={save}>
        {busy ? "Speichern…" : "Abgeben"}
      </button>
    </div>
  );
}
