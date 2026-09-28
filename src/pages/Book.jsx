import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, getDoc, getDocs, collection, onSnapshot, auth } from "../firebase.js";
import { currentMonthId, monthLabel, addMonths, seasonOf } from "../utils/rotation.js";
import Avatar from "../components/Avatar.jsx";
import Stars from "../components/Stars.jsx";
import Lightbox from "../components/Lightbox.jsx";
import Sticker from "../components/Stickers.jsx";

const FLIP_MS = 850;

// Kleiner Zwischenspeicher, damit eine Seite beim Umblättern sofort mit Inhalt
// erscheint (statt kurz "Lädt…" zu zeigen). Die Daten werden trotzdem immer
// frisch nachgeladen ("stale-while-revalidate").
const pageCache = new Map();

async function prefetch(groupId, monthId) {
  try {
    const [m, e] = await Promise.all([
      getDoc(doc(db, "groups", groupId, "months", monthId)),
      getDocs(collection(db, "groups", groupId, "months", monthId, "entries")),
    ]);
    const entries = {};
    e.forEach((d) => (entries[d.id] = d.data()));
    pageCache.set(`${groupId}|${monthId}`, { monthDoc: m.exists() ? m.data() : null, entries });
  } catch {
    /* Vorladen ist nur ein Bonus – Fehler ignorieren */
  }
}

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
  const [zoom, setZoom] = useState(false);

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar avatar={member?.avatar} size={32} />
        {entry.photoUrl && (
          <img
            src={entry.photoUrl}
            alt=""
            onClick={() => setZoom(true)}
            style={{
              width: 48, height: 48, objectFit: "cover", cursor: "zoom-in",
              border: "3px solid #fff", borderRadius: 3, transform: "rotate(-3deg)",
              boxShadow: "0 3px 6px rgba(74,56,45,.35)",
            }}
          />
        )}
        <div>
          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 800 }}>{member?.displayName}</div>
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
      {zoom && <Lightbox src={entry.photoUrl} onClose={() => setZoom(false)} />}
    </div>
  );
}

function Page({ groupId, monthId, members, skippedMonths, pageNo }) {
  const key = `${groupId}|${monthId}`;
  const cached = pageCache.get(key);
  const [monthDoc, setMonthDoc] = useState(cached && cached.monthDoc !== undefined ? cached.monthDoc : undefined);
  const [entries, setEntries] = useState(cached?.entries || {});
  const [zoomRef, setZoomRef] = useState(false);

  useEffect(() => {
    let alive = true;
    getDoc(doc(db, "groups", groupId, "months", monthId)).then((snap) => {
      if (!alive) return;
      const d = snap.exists() ? snap.data() : null;
      setMonthDoc(d);
      pageCache.set(key, { entries: {}, ...pageCache.get(key), monthDoc: d });
    });
    const unsub = onSnapshot(collection(db, "groups", groupId, "months", monthId, "entries"), (snap) => {
      const map = {};
      snap.forEach((d) => (map[d.id] = d.data()));
      setEntries(map);
      pageCache.set(key, { ...pageCache.get(key), entries: map });
    });
    return () => { alive = false; unsub(); };
  }, [groupId, monthId, key]);

  const isSkipped = skippedMonths.includes(monthId);
  const myEntry = entries[auth.currentUser.uid];
  const season = seasonOf(monthId);

  return (
    <div className="page">
      <div className="lines" />
      <Sticker type="stamp" size={66} rot={5} par={0} glyph={season.glyph} label={season.label} sub="Tellerrand" pos={{ top: 12, right: 12 }} />

      <div className="stack" style={{ position: "relative", zIndex: 1, gap: 14 }}>
        <div style={{ paddingRight: 84, minHeight: 88 }}>
          <h2 className="title-label" style={{ fontSize: 22, padding: "6px 14px 7px", borderWidth: 3.5 }}>{monthLabel(monthId)}</h2>
        </div>

        {monthDoc === undefined && <p>Lädt…</p>}

        {isSkipped && (
          <div className="stack" style={{ alignItems: "center", padding: "10px 0" }}>
            <Sticker type="sun" size={92} rot={-6} inline />
            <p style={{ textAlign: "center" }}>Dieser Monat wurde ausgesetzt.<br />Wir waren woanders satt. 🌴</p>
          </div>
        )}

        {!isSkipped && monthDoc === null && (
          <div className="stack" style={{ alignItems: "center", padding: "14px 0" }}>
            <p style={{ textAlign: "center" }}>Für {monthLabel(monthId)} ist noch kein Gericht eingetragen.</p>
            <Link to={`/set-dish?month=${monthId}`} className="btn">Gericht nachtragen</Link>
          </div>
        )}

        {!isSkipped && monthDoc && (
          <>
            <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Avatar avatar={members[monthDoc.hostUid]?.avatar} size={32} />
                <span className="chip">Gastgeber: {members[monthDoc.hostUid]?.displayName}</span>
              </div>
              <Link to={`/set-dish?month=${monthId}`} className="btn ghost" style={{ fontSize: 13 }}>Bearbeiten</Link>
            </div>

            <h3 style={{ fontSize: 24 }}>{monthDoc.dishName}</h3>
            {monthDoc.introText && <p>{monthDoc.introText}</p>}

            {monthDoc.referenceImageUrl && (
              <>
                <img
                  src={monthDoc.referenceImageUrl}
                  alt="Orientierungsbild"
                  onClick={() => setZoomRef(true)}
                  style={{ width: "100%", cursor: "zoom-in", border: "8px solid #fff", borderBottomWidth: 22, borderRadius: 3, transform: "rotate(1deg)", boxShadow: "0 4px 10px rgba(74,56,45,.3)" }}
                />
                {zoomRef && <Lightbox src={monthDoc.referenceImageUrl} onClose={() => setZoomRef(false)} />}
              </>
            )}

            <div className="stack" style={{ gap: 16 }}>
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

      <div className="page-number">– {pageNo} –</div>
    </div>
  );
}

export default function Book() {
  const { group } = useApp();
  const months = useMemo(() => (group ? allMonthsSince(group.seasonStart) : []), [group?.seasonStart]);
  const [index, setIndex] = useState(Math.max(0, months.length - 1));
  const [flip, setFlip] = useState(null); // { dir: "fwd"|"back", monthId, under? }
  const [members, setMembers] = useState({});
  const [drag, setDrag] = useState({ dx: 0, active: false });
  const [shake, setShake] = useState(false);
  const lock = useRef(false);
  const touch = useRef(null);

  useEffect(() => {
    if (!group) return;
    const unsubs = group.memberIds.map((uid) =>
      onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) setMembers((m) => ({ ...m, [uid]: snap.data() }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [group?.id]);

  // Nachbarseiten vorladen, damit das Blättern flüssig wirkt.
  useEffect(() => {
    if (!group) return;
    [index - 1, index, index + 1].forEach((i) => months[i] && prefetch(group.id, months[i]));
  }, [group?.id, index, months]);

  const go = useCallback(
    (dir) => {
      if (lock.current) return;
      const next = index + dir;
      if (next < 0 || next >= months.length) {
        setShake(true);
        setTimeout(() => setShake(false), 420);
        return;
      }
      lock.current = true;
      // vorwärts: die alte Seite dreht sich weg und gibt die neue frei
      // rückwärts: die neue Seite dreht sich von links über die alte
      setFlip(dir > 0 ? { dir: "fwd", monthId: months[index] } : { dir: "back", monthId: months[next], under: months[index] });
      setIndex(next);
      setTimeout(() => { setFlip(null); lock.current = false; }, FLIP_MS + 30);
    },
    [index, months]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!group || months.length === 0) return null;

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, dx: 0, horiz: null };
  };
  const onTouchMove = (e) => {
    const s = touch.current;
    if (!s || lock.current) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (s.horiz === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) s.horiz = Math.abs(dx) > Math.abs(dy);
    if (s.horiz) {
      s.dx = dx;
      setDrag({ dx, active: true });
    }
  };
  const onTouchEnd = () => {
    const s = touch.current;
    touch.current = null;
    setDrag({ dx: 0, active: false });
    if (s?.horiz && Math.abs(s.dx) > 70) go(s.dx < 0 ? 1 : -1);
  };

  const baseMonth = flip?.dir === "back" ? flip.under : months[index];
  const tilt = drag.active ? Math.max(-16, Math.min(16, drag.dx / 5)) : 0;
  const pageNoOf = (m) => months.indexOf(m) + 1;
  const skipped = group.skippedMonths || [];

  return (
    <div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h2 className="title-label">Das Buch</h2>
        <span className="eyebrow">wisch zum Blättern</span>
      </div>

      <div className={`book ${shake ? "shake" : ""}`} style={{ marginTop: 34 }}>
        <div className="book-spine" />
        <div className="ribbon" />
        <Sticker type="fawn" size={84} rot={-4} par={0.04} pos={{ top: -58, left: 34 }} />
        <Sticker type="cookie" size={54} rot={12} spin={0.08} pos={{ bottom: -20, left: -10 }} />

        <div className="page-stage" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div
            className="page-base"
            style={{
              position: "relative",
              transform: tilt ? `rotateY(${tilt}deg)` : "none",
              transition: drag.active ? "none" : "transform .5s cubic-bezier(.2,1.3,.3,1)",
            }}
          >
            <Page key={baseMonth} groupId={group.id} monthId={baseMonth} members={members} skippedMonths={skipped} pageNo={pageNoOf(baseMonth)} />
            <div className={`page-shade ${flip ? (flip.dir === "fwd" ? "shade-fwd" : "shade-back") : ""}`} />
          </div>

          {flip && (
            <div className={`flipper ${flip.dir}`}>
              <div className="face">
                <Page key={"f" + flip.monthId} groupId={group.id} monthId={flip.monthId} members={members} skippedMonths={skipped} pageNo={pageNoOf(flip.monthId)} />
              </div>
              <div className="face page back-face" />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn secondary turn-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Vorherige Seite">‹</button>
        <span className="chip">Seite {index + 1} von {months.length}</span>
        <button className="btn turn-btn" onClick={() => go(1)} disabled={index === months.length - 1} aria-label="Nächste Seite">›</button>
      </div>
    </div>
  );
}
