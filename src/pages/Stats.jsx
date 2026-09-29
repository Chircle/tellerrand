import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, getDoc, getDocs, collection } from "../firebase.js";
import { addMonths, currentMonthId, monthLabel } from "../utils/rotation.js";
import Avatar from "../components/Avatar.jsx";
import Sticker from "../components/Stickers.jsx";

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

// Lädt einmalig alle Monate samt Bewertungen und rechnet die Statistik aus.
// Bewusst kein Live-Listener: das wäre bei vielen Monaten unnötig viele
// gleichzeitige Firestore-Abos für eine Seite, die man nur ab und zu ansieht.
async function loadStats(group) {
  const months = allMonthsSince(group.seasonStart);
  const skipped = new Set(group.skippedMonths || []);
  const currentYear = String(new Date().getFullYear());

  const results = await Promise.all(
    months.map(async (monthId) => {
      if (skipped.has(monthId)) return { monthId, skipped: true };
      const monthSnap = await getDoc(doc(db, "groups", group.id, "months", monthId));
      if (!monthSnap.exists()) return { monthId, empty: true };
      const entriesSnap = await getDocs(collection(db, "groups", group.id, "months", monthId, "entries"));
      const entries = [];
      entriesSnap.forEach((d) => entries.push(d.data()));
      return { monthId, dish: monthSnap.data(), entries };
    })
  );

  let best = null; // { monthId, dishName, hostUid, avg }
  let totalPhotos = 0;
  let cookedCount = 0;
  let yearRatings = [];

  for (const r of results) {
    if (r.skipped || r.empty) continue;
    cookedCount++;
    if (r.dish.referenceImageUrl) totalPhotos++;

    if (r.entries.length > 0) {
      const ratings = r.entries.map((e) => e.rating).filter((n) => typeof n === "number");
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (!best || avg > best.avg) {
        best = { monthId: r.monthId, dishName: r.dish.dishName, hostUid: r.dish.hostUid, avg };
      }
      if (r.monthId.startsWith(currentYear)) yearRatings.push(...ratings);
    }
    totalPhotos += r.entries.filter((e) => e.photoUrl).length;
  }

  const yearAvg = yearRatings.length ? yearRatings.reduce((a, b) => a + b, 0) / yearRatings.length : null;

  return {
    best,
    totalPhotos,
    cookedCount,
    skippedCount: skipped.size,
    totalMonths: months.length,
    yearAvg,
    yearCount: yearRatings.length,
    currentYear,
  };
}

function StatCard({ sticker, rot, title, children }) {
  return (
    <div className="card taped stack" style={{ alignItems: "flex-start" }}>
      {sticker && <Sticker type={sticker} size={52} rot={rot ?? 12} par={0.03} pos={{ top: -20, right: 14 }} />}
      <p style={{ fontSize: 13, fontWeight: 800 }}>{title}</p>
      {children}
    </div>
  );
}

export default function Stats() {
  const { group, profile } = useApp();
  const [members, setMembers] = useState({});
  const [stats, setStats] = useState(undefined); // undefined = lädt, null = Fehler

  useEffect(() => {
    if (!group) return;
    Promise.all(group.memberIds.map((uid) => getDoc(doc(db, "users", uid)))).then((snaps) => {
      const map = {};
      snaps.forEach((s) => { if (s.exists()) map[s.id] = s.data(); });
      setMembers(map);
    });
  }, [group?.id]);

  useEffect(() => {
    if (!group) return;
    setStats(undefined);
    loadStats(group)
      .then(setStats)
      .catch(() => setStats(null));
  }, [group?.id]);

  if (!group) return null;

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link to="/settings" className="btn ghost" style={{ padding: "6px 10px" }} aria-label="Zurück">‹</Link>
        <h2 className="title-label">Statistiken</h2>
      </div>

      {stats === undefined && (
        <div className="stack" style={{ alignItems: "center", padding: "30px 0" }}>
          <Sticker type="sun" size={70} spin={0.08} inline />
          <p>Rechne durchs ganze Buch…</p>
        </div>
      )}

      {stats === null && (
        <p style={{ color: "var(--tomato)", fontWeight: 700 }}>
          Konnte die Statistik nicht laden. Vielleicht ist gerade keine Verbindung da — zieh die Seite runter zum Neuladen.
        </p>
      )}

      {stats && stats.cookedCount === 0 && (
        <div className="card stack" style={{ alignItems: "center", padding: "20px 0" }}>
          <p>Noch keine abgeschlossenen Monate — sobald das erste Gericht bewertet ist, taucht hier was auf.</p>
        </div>
      )}

      {stats && stats.best && (
        <StatCard sticker="cookie" rot={14} title="🏆 Bestbewertetes Gericht">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar avatar={members[stats.best.hostUid]?.avatar} size={44} />
            <div>
              <h3 style={{ fontSize: 20 }}>{stats.best.dishName}</h3>
              <p style={{ fontSize: 13 }}>
                {members[stats.best.hostUid]?.displayName} · {monthLabel(stats.best.monthId)}
              </p>
            </div>
          </div>
          <span className="chip" style={{ fontWeight: 800 }}>★ {stats.best.avg.toFixed(1)} Schnitt</span>
        </StatCard>
      )}

      {stats && (
        <StatCard sticker="jar" rot={-8} title="📸 Fotos gesamt">
          <p style={{ fontSize: 32, fontFamily: "var(--font-display)", color: "var(--cocoa)" }}>{stats.totalPhotos}</p>
          <p>Bewertungsfotos und Orientierungsbilder zusammen, seit {monthLabel(group.seasonStart)}.</p>
        </StatCard>
      )}

      {stats && (
        <StatCard sticker="fawn" rot={5} title="📅 Bilanz">
          <div style={{ display: "flex", gap: 22 }}>
            <div>
              <p style={{ fontSize: 28, fontFamily: "var(--font-display)", color: "var(--cocoa)" }}>{stats.cookedCount}</p>
              <p style={{ fontSize: 13 }}>gekocht</p>
            </div>
            <div>
              <p style={{ fontSize: 28, fontFamily: "var(--font-display)", color: "var(--cocoa)" }}>{stats.skippedCount}</p>
              <p style={{ fontSize: 13 }}>ausgesetzt</p>
            </div>
            <div>
              <p style={{ fontSize: 28, fontFamily: "var(--font-display)", color: "var(--cocoa)" }}>{stats.totalMonths}</p>
              <p style={{ fontSize: 13 }}>insgesamt</p>
            </div>
          </div>
        </StatCard>
      )}

      {stats && (
        <StatCard sticker="berry" rot={-12} title={`⭐ Gesamtschnitt ${stats.currentYear}`}>
          {stats.yearAvg !== null ? (
            <>
              <p style={{ fontSize: 32, fontFamily: "var(--font-display)", color: "var(--cocoa)" }}>{stats.yearAvg.toFixed(2)}</p>
              <p>Durchschnitt über {stats.yearCount} Bewertungen in diesem Jahr.</p>
            </>
          ) : (
            <p>Für {stats.currentYear} liegt noch keine Bewertung vor.</p>
          )}
        </StatCard>
      )}
    </div>
  );
}
