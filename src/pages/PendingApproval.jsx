import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { auth, db, doc, onSnapshot, deleteDoc, updateDoc, logout } from "../firebase.js";

export default function PendingApproval() {
  const { group } = useApp();
  const [request, setRequest] = useState(undefined); // undefined = lädt, null = nicht (mehr) vorhanden
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "groups", group.id, "joinRequests", auth.currentUser.uid),
      (snap) => setRequest(snap.exists() ? snap.data() : null)
    );
    return unsub;
  }, [group.id]);

  const withdraw = async () => {
    setBusy(true);
    await deleteDoc(doc(db, "groups", group.id, "joinRequests", auth.currentUser.uid));
    await updateDoc(doc(db, "users", auth.currentUser.uid), { groupId: null });
    setBusy(false);
  };

  if (request === undefined) {
    return <div className="center-screen"><p>Lädt…</p></div>;
  }

  if (request === null) {
    // Anfrage wurde abgelehnt oder existiert nicht mehr — eigenes Profil
    // aufräumen, damit man zurück zur Gruppenauswahl kommt.
    return (
      <div className="center-screen">
        <div style={{ fontSize: 40 }}>😕</div>
        <div>
          <h2>Anfrage abgelehnt</h2>
          <p style={{ marginTop: 8 }}>Deine Anfrage für "{group.name}" wurde nicht angenommen.</p>
        </div>
        <button className="btn block" disabled={busy} onClick={withdraw}>
          {busy ? "Einen Moment…" : "Zurück zur Gruppenauswahl"}
        </button>
      </div>
    );
  }

  return (
    <div className="center-screen">
      <div style={{ fontSize: 40 }}>📬</div>
      <div>
        <h2>Anfrage gesendet</h2>
        <p style={{ marginTop: 8 }}>
          Du wartest auf Freigabe für <strong style={{ color: "var(--text)" }}>{group.name}</strong>.
          Jemand aus der Gruppe muss dich noch bestätigen.
        </p>
      </div>
      <button className="btn secondary block" disabled={busy} onClick={withdraw}>
        {busy ? "Einen Moment…" : "Anfrage zurückziehen"}
      </button>
      <button className="btn ghost" onClick={logout}>Abmelden</button>
    </div>
  );
}
