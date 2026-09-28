import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, getDoc, collection, onSnapshot, auth } from "../firebase.js";
import { currentMonthId, monthLabel, addMonths } from "../utils/rotation.js";
import Avatar from "../components/Avatar.jsx";
import Stars from "../components/Stars.jsx";

function allMonthsSince(seasonStart) {
  const months = [];
  let cursor = seasonStart;
  const now = currentMonthId();
  for (let i = 0; i < 240; i++) {
    months.push(cursor);
    if (cursor === now) break;
    cursor = addMonths(cursor, 1);
  }
  return months;
}

function EntryRow({ entry, member }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar avatar={member?.avatar} size={30} />
        {entry.photoUrl && (
          <img src={entry.photoUrl} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} />
        )}
        <div>
          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{member?.displayName}</div>
          <Stars value={entry.rating} readOnly />
        </div>
      </div>

      {entry.comment && (
        <p
          onClick={() => setOpen((o) => !o)}
          style={{
            cursor: "pointer",
            fontSize: 14,
            ...(open
              ? {}
              : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
          }}
        >
          {entry.comment}
        </p>
      )}
    </div>
  );
}

function Page({ groupId, monthId, members, skippedMonths }) {
  const [monthDoc, setMonthDoc] = useState(undefined);
  const [entries, setEntries] = useState({});

  useEffect(() => {
    getDoc(doc(db, "groups", groupId, "months", monthId)).then((snap) =>
      setMonthDoc(snap.exists() ? snap.data() : null)
    );
    const unsub = onSnapshot(collection(db, "groups", groupId, "months", monthId, "entries"), (snap) => {
      const map = {};
      snap.forEach((d) => (map[d.id] = d.data()));
      setEntries(map);
    });
    return unsub;
  }, [groupId, monthId]);

  const isSkipped = skippedMonths.includes(monthId);
  const myUid = auth.currentUser.uid;
  const myEntry = entries[myUid];

  return (
    <div className="card stack" style={{ minHeight: 380 }}>
      <p style={{ fontSize: 13 }}>{monthLabel(monthId)}</p>

      {monthDoc === undefined && <p>Lädt…</p>}

      {isSkipped && (
        <div className="stack" style={{ alignItems: "center", padding: "30px 0" }}>
          <div style={{ fontSize: 40 }}>🏖️</div>
          <p>Dieser Monat wurde ausgesetzt.</p>
        </div>
      )}

      {!isSkipped && monthDoc === null && (
        <div className="stack" style={{ alignItems: "center", padding: "20px 0" }}>
          <p>Für {monthLabel(monthId)} ist noch kein Gericht eingetragen.</p>
          <Link to={`/set-dish?month=${monthId}`} className="btn">Gericht nachtragen</Link>
        </div>
      )}

      {!isSkipped && monthDoc && (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Avatar avatar={members[monthDoc.hostUid]?.avatar} size={30} />
              <span className="chip">{members[monthDoc.hostUid]?.displayName}</span>
            </div>
            <Link to={`/set-dish?month=${monthId}`} className="btn ghost" style={{ padding: "4px 10px", fontSize: 13 }}>Bearbeiten</Link>
          </div>
          <h2 style={{ fontSize: 20 }}>{monthDoc.dishName}</h2>
          {monthDoc.introText && <p>{monthDoc.introText}</p>}
          {monthDoc.referenceImageUrl && (
            <img src={monthDoc.referenceImageUrl} alt="" style={{ width: "100%", borderRadius: "var(--radius-m)" }} />
          )}

          <div className="stack">
            {Object.entries(entries).map(([uid, entry]) => (
              <EntryRow key={uid} entry={entry} member={members[uid]} />
            ))}
            {Object.keys(entries).length === 0 && <p>Noch keine Bewertungen.</p>}
          </div>

          <Link to={`/submit?month=${monthId}`} className="btn secondary block">
            {myEntry ? "Deine Bewertung bearbeiten" : "Deine Bewertung nachtragen"}
          </Link>
        </>
      )}
    </div>
  );
}

export default function Book() {
  const { group } = useApp();
  const months = useMemo(() => (group ? allMonthsSince(group.seasonStart) : []), [group?.seasonStart]);
  const [index, setIndex] = useState(months.length - 1);
  const [members, setMembers] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (!group) return;
    const unsubs = group.memberIds.map((uid) =>
      onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) setMembers((m) => ({ ...m, [uid]: snap.data() }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [group?.id]);

  if (!group || months.length === 0) return null;

  const go = (dir) => setIndex((i) => Math.max(0, Math.min(months.length - 1, i + dir)));

  const onTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 50) go(-1);
    if (diff < -50) go(1);
    setTouchStartX(null);
  };

  return (
    <div className="screen" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <h2>Das Buch</h2>
      <Page groupId={group.id} monthId={months[index]} members={members} skippedMonths={group.skippedMonths || []} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn secondary" onClick={() => go(-1)} disabled={index === 0}>‹ Zurück</button>
        <span className="chip">{index + 1} / {months.length}</span>
        <button className="btn secondary" onClick={() => go(1)} disabled={index === months.length - 1}>Weiter ›</button>
      </div>
    </div>
  );
}
