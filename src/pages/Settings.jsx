import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, logout, auth, collection, onSnapshot } from "../firebase.js";
import { currentMonthId, monthLabel } from "../utils/rotation.js";
import Avatar from "../components/Avatar.jsx";
import AvatarEditor from "./AvatarEditor.jsx";
import Sticker from "../components/Stickers.jsx";

function Members({ group }) {
  const [users, setUsers] = useState({});
  const [confirmUid, setConfirmUid] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = group.createdBy === auth.currentUser.uid;

  useEffect(() => {
    const unsubs = group.memberIds.map((uid) =>
      onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) setUsers((u) => ({ ...u, [uid]: snap.data() }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [group.memberIds.join(",")]);

  // Kochreihenfolge: rotationOrder, bereinigt um Nicht-Mitglieder;
  // Mitglieder ohne Eintrag werden hinten angehängt.
  const order = group.rotationOrder || [];
  const ordered = [
    ...order.filter((uid) => group.memberIds.includes(uid)),
    ...group.memberIds.filter((uid) => !order.includes(uid)),
  ];

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError("Das hat nicht geklappt. Prüf deine Verbindung und die Firestore-Regeln.");
    }
    setBusy(false);
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= ordered.length) return;
    const next = [...ordered];
    [next[i], next[j]] = [next[j], next[i]];
    run(() => updateDoc(doc(db, "groups", group.id), { rotationOrder: next }));
  };

  const remove = (uid) =>
    run(async () => {
      await updateDoc(doc(db, "groups", group.id), {
        memberIds: arrayRemove(uid),
        rotationOrder: arrayRemove(uid),
      });
      setConfirmUid(null);
    });

  return (
    <div className="card stack" style={{ alignItems: "stretch" }}>
      <p style={{ fontSize: 13, fontWeight: 800 }}>Mitglieder &amp; Kochreihenfolge</p>

      {ordered.map((uid, i) => {
        const u = users[uid];
        const isCreator = uid === group.createdBy;
        return (
          <div key={uid} className="stack" style={{ gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="chip" style={{ minWidth: 30, justifyContent: "center", padding: "4px 8px" }}>{i + 1}</span>
              <Avatar avatar={u?.avatar} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u?.displayName || "…"}{uid === auth.currentUser.uid ? " (du)" : ""}
                </strong>
                {isCreator && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Gruppenersteller</span>}
              </div>

              {isAdmin && (
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn secondary" style={{ padding: "6px 10px" }} disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Weiter nach vorne">▲</button>
                  <button className="btn secondary" style={{ padding: "6px 10px" }} disabled={busy || i === ordered.length - 1} onClick={() => move(i, 1)} aria-label="Weiter nach hinten">▼</button>
                </div>
              )}
            </div>

            {isAdmin && !isCreator && (
              confirmUid === uid ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 13 }}>{u?.displayName || "Person"} wirklich entfernen?</span>
                  <button className="btn ghost" onClick={() => setConfirmUid(null)}>Nein</button>
                  <button className="btn" style={{ background: "var(--tomato)", padding: "8px 14px" }} disabled={busy} onClick={() => remove(uid)}>Ja, entfernen</button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn ghost" style={{ fontSize: 13 }} onClick={() => setConfirmUid(uid)}>Aus Gruppe entfernen</button>
                </div>
              )
            )}
          </div>
        );
      })}

      {error && <p style={{ color: "var(--tomato)", fontWeight: 700 }}>{error}</p>}
      <p style={{ fontSize: 12 }}>
        {isAdmin
          ? "Die Nummer zeigt, wer wann als Gastgeber dran ist. Änderungen wirken sich auf Monate aus, für die noch kein Gericht eingetragen ist. Bereits gespeicherte Monate behalten ihren Gastgeber."
          : "Nur der Gruppenersteller kann Mitglieder entfernen oder die Reihenfolge ändern."}
      </p>
    </div>
  );
}

function JoinRequests({ group }) {
  const [requests, setRequests] = useState({});
  const [busyUid, setBusyUid] = useState(null);
  const isAdmin = group.createdBy === auth.currentUser.uid;

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, "groups", group.id, "joinRequests"), (snap) => {
      const map = {};
      snap.forEach((d) => (map[d.id] = d.data()));
      setRequests(map);
    });
    return unsub;
  }, [group.id, isAdmin]);

  if (!isAdmin) return null;

  const entries = Object.entries(requests);
  if (entries.length === 0) return null;

  const accept = async (uid) => {
    setBusyUid(uid);
    await updateDoc(doc(db, "groups", group.id), {
      memberIds: arrayUnion(uid),
      rotationOrder: arrayUnion(uid),
    });
    await deleteDoc(doc(db, "groups", group.id, "joinRequests", uid));
    setBusyUid(null);
  };

  const reject = async (uid) => {
    setBusyUid(uid);
    await deleteDoc(doc(db, "groups", group.id, "joinRequests", uid));
    setBusyUid(null);
  };

  return (
    <div className="card stack" style={{ alignItems: "flex-start" }}>
      <p style={{ fontSize: 13 }}>Offene Beitrittsanfragen</p>
      {entries.map(([uid, req]) => (
        <div key={uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 8 }}>
          <span>{req.displayName}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn ghost" style={{ padding: "6px 10px" }} disabled={busyUid === uid} onClick={() => reject(uid)}>Ablehnen</button>
            <button className="btn" style={{ padding: "6px 14px" }} disabled={busyUid === uid || group.memberIds.length >= 5} onClick={() => accept(uid)}>
              {group.memberIds.length >= 5 ? "Gruppe voll" : "Annehmen"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Settings() {
  const { profile, group } = useApp();
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStart, setEditingStart] = useState(false);
  const [newStart, setNewStart] = useState(group?.seasonStart || currentMonthId());

  const monthId = currentMonthId();
  const alreadySkipped = group?.skippedMonths?.includes(monthId);

  const skipMonth = async () => {
    setSaving(true);
    await updateDoc(doc(db, "groups", group.id), {
      skippedMonths: arrayUnion(monthId),
    });
    setSaving(false);
    setConfirmSkip(false);
  };

  const saveStart = async () => {
    setSaving(true);
    await updateDoc(doc(db, "groups", group.id), { seasonStart: newStart });
    setSaving(false);
    setEditingStart(false);
  };

  const saveAvatar = async (avatar) => {
    setSaving(true);
    await updateDoc(doc(db, "users", auth.currentUser.uid), { avatar });
    setSaving(false);
    setEditingAvatar(false);
  };

  if (editingAvatar) {
    return (
      <div className="screen">
        <button className="btn ghost" style={{ alignSelf: "flex-start" }} onClick={() => setEditingAvatar(false)}>‹ Zurück</button>
        <h2 className="title-label">Dein Icon</h2>
        <AvatarEditor initial={profile.avatar} onSave={saveAvatar} saving={saving} />
      </div>
    );
  }

  return (
    <div className="screen">
      <h2 className="title-label">Einstellungen</h2>

      <JoinRequests group={group} />

      <div className="card stack" style={{ alignItems: "flex-start" }}>
        <Sticker type="bow" size={52} rot={16} par={0.03} pos={{ top: -20, right: 16 }} />
        <p style={{ fontSize: 13 }}>Dein Profil</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar avatar={profile.avatar} size={56} />
          <div>
            <strong style={{ color: "var(--text)" }}>{profile.displayName}</strong>
          </div>
        </div>
        <button className="btn secondary" onClick={() => setEditingAvatar(true)}>Icon ändern</button>
      </div>

      <div className="card stack" style={{ alignItems: "flex-start" }}>
        <Sticker type="jar" size={64} rot={8} par={0.05} pos={{ top: -26, right: 12 }} />
        <p style={{ fontSize: 13 }}>Gruppe</p>
        <strong style={{ color: "var(--text)" }}>{group.name}</strong>
        <p>Einladungscode: <span className="chip">{group.inviteCode}</span></p>
        <p>{group.memberIds.length} / 5 Mitgliedern</p>
        <p>Läuft seit {monthLabel(group.seasonStart)}</p>
        {editingStart ? (
          <div className="stack" style={{ width: "100%" }}>
            <p style={{ fontSize: 13 }}>Verschiebt nur, ab wann Monate im Buch auftauchen — nützlich, um Gerichte von vor der App-Nutzung nachzutragen. Die Rotation wird ab diesem Punkt neu durchgezählt.</p>
            <input type="month" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn secondary" onClick={() => setEditingStart(false)}>Abbrechen</button>
              <button className="btn" disabled={saving} onClick={saveStart}>{saving ? "Speichern…" : "Speichern"}</button>
            </div>
          </div>
        ) : (
          <button className="btn secondary" onClick={() => { setNewStart(group.seasonStart); setEditingStart(true); }}>
            Frühere Monate nachtragen
          </button>
        )}
      </div>

      <Members group={group} />

      <div className="card stack" style={{ alignItems: "flex-start" }}>
        <Sticker type="sun" size={58} rot={-8} spin={0.06} pos={{ top: -22, right: 14 }} />
        <p style={{ fontSize: 13 }}>Diesen Monat aussetzen</p>
        <p>Für Sonderfälle wie einen gemeinsamen Urlaub. Der Monat zählt dann nicht in der Rotation.</p>
        {alreadySkipped ? (
          <span className="chip">{monthLabel(monthId)} ist bereits ausgesetzt 🏖️</span>
        ) : confirmSkip ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn secondary" onClick={() => setConfirmSkip(false)}>Doch nicht</button>
            <button className="btn" style={{ background: "var(--tomato)", color: "#fff" }} disabled={saving} onClick={skipMonth}>
              Ja, {monthLabel(monthId)} aussetzen
            </button>
          </div>
        ) : (
          <button className="btn secondary" onClick={() => setConfirmSkip(true)}>{monthLabel(monthId)} aussetzen</button>
        )}
      </div>

      <button className="btn secondary block" onClick={logout}>Abmelden</button>
    </div>
  );
}
