import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, onSnapshot, collection } from "../firebase.js";
import { currentMonthId, hostForMonth, monthLabel } from "../utils/rotation.js";
import Avatar from "../components/Avatar.jsx";
import Stars from "../components/Stars.jsx";

export default function Dashboard() {
  const { authUser, profile, group } = useApp();
  const monthId = currentMonthId();
  const [monthDoc, setMonthDoc] = useState(undefined);
  const [entries, setEntries] = useState({});
  const [members, setMembers] = useState({});

  const hostUid = group
    ? hostForMonth(monthId, {
        seasonStart: group.seasonStart,
        rotationOrder: group.rotationOrder,
        skippedMonths: group.skippedMonths || [],
      })
    : null;

  useEffect(() => {
    if (!group) return;
    const unsub = onSnapshot(doc(db, "groups", group.id, "months", monthId), (snap) => {
      setMonthDoc(snap.exists() ? snap.data() : null);
    });
    return unsub;
  }, [group?.id, monthId]);

  useEffect(() => {
    if (!group) return;
    const unsub = onSnapshot(collection(db, "groups", group.id, "months", monthId, "entries"), (snap) => {
      const map = {};
      snap.forEach((d) => (map[d.id] = d.data()));
      setEntries(map);
    });
    return unsub;
  }, [group?.id, monthId]);

  useEffect(() => {
    if (!group) return;
    const unsubs = group.memberIds.map((uid) =>
      onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) setMembers((m) => ({ ...m, [uid]: snap.data() }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [group?.id]);

  if (!group) return null;

  const isHost = hostUid === authUser.uid;
  const myEntry = entries[authUser.uid];
  const today = new Date();

  return (
    <div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 13 }}>{group.name}</p>
          <h1 style={{ fontSize: 24 }}>{monthLabel(monthId)}</h1>
        </div>
        <span className="chip">KW {getWeek(today)}</span>
      </div>

      {monthDoc === undefined && <p>Lädt…</p>}

      {monthDoc === null && !hostUid && (
        <div className="card">
          <p>Für diesen Monat wurde noch kein Gericht festgelegt.</p>
        </div>
      )}

      {monthDoc === null && hostUid && isHost && (
        <div className="card stack" style={{ alignItems: "flex-start" }}>
          <h2 style={{ fontSize: 18 }}>Du bist dran! 🎉</h2>
          <p>Lege das Gericht für {monthLabel(monthId)} fest, damit die anderen loslegen können.</p>
          <Link to="/set-dish" className="btn">Gericht festlegen</Link>
        </div>
      )}

      {monthDoc === null && hostUid && !isHost && (
        <div className="card">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar avatar={members[hostUid]?.avatar} size={40} />
            <p><strong style={{ color: "var(--text)" }}>{members[hostUid]?.displayName || "…"}</strong> ist diesen Monat dran und hat das Gericht noch nicht festgelegt.</p>
          </div>
        </div>
      )}

      {monthDoc && (
        <>
          <div className="card stack" style={{ alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar avatar={members[hostUid]?.avatar} size={36} />
              <span className="chip">Gastgeber: {members[hostUid]?.displayName}</span>
            </div>
            <h2 style={{ fontSize: 22 }}>{monthDoc.dishName}</h2>
            {monthDoc.introText && <p>{monthDoc.introText}</p>}
            {monthDoc.referenceImageUrl && (
              <img src={monthDoc.referenceImageUrl} alt="Orientierungsbild" style={{ width: "100%", borderRadius: "var(--radius-m)" }} />
            )}
            {monthDoc.recipeText && (
              <details style={{ width: "100%" }}>
                <summary style={{ cursor: "pointer", color: "var(--saffron)" }}>Rezept anzeigen</summary>
                <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{monthDoc.recipeText}</p>
              </details>
            )}
            {monthDoc.recipeUrl && (
              <a href={monthDoc.recipeUrl} target="_blank" rel="noreferrer" style={{ color: "var(--saffron)" }}>Rezept-Link öffnen ↗</a>
            )}
          </div>

          <div className="card stack">
            <p style={{ fontSize: 13 }}>Abgaben</p>
            <div style={{ display: "flex", gap: 14 }}>
              {group.memberIds.map((uid) => (
                <div key={uid} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ position: "relative" }}>
                    <Avatar avatar={members[uid]?.avatar} size={44} />
                    {entries[uid] && (
                      <span style={{ position: "absolute", bottom: -2, right: -2, background: "var(--herb)", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{members[uid]?.displayName?.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {myEntry ? (
            <div className="card stack" style={{ alignItems: "flex-start" }}>
              <p style={{ fontSize: 13 }}>Deine Bewertung</p>
              <Stars value={myEntry.rating} readOnly />
              {myEntry.photoUrl && <img src={myEntry.photoUrl} alt="Dein Gericht" style={{ width: "100%", borderRadius: "var(--radius-m)" }} />}
              <Link to="/submit" className="btn ghost">Bearbeiten</Link>
            </div>
          ) : (
            <Link to="/submit" className="btn block">Mein Gericht hochladen</Link>
          )}
        </>
      )}
    </div>
  );
}

function getWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
