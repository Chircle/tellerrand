import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { db, doc, updateDoc, setDoc, arrayUnion, logout, auth } from "../firebase.js";
import { currentMonthId, monthLabel } from "../utils/rotation.js";
import Avatar from "../components/Avatar.jsx";
import AvatarEditor from "./AvatarEditor.jsx";

export default function Settings() {
  const { profile, group } = useApp();
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [saving, setSaving] = useState(false);

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
        <h2>Dein Icon</h2>
        <AvatarEditor initial={profile.avatar} onSave={saveAvatar} saving={saving} />
      </div>
    );
  }

  return (
    <div className="screen">
      <h2>Einstellungen</h2>

      <div className="card stack" style={{ alignItems: "flex-start" }}>
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
        <p style={{ fontSize: 13 }}>Gruppe</p>
        <strong style={{ color: "var(--text)" }}>{group.name}</strong>
        <p>Einladungscode: <span className="chip">{group.inviteCode}</span></p>
        <p>{group.memberIds.length} / 5 Mitgliedern</p>
        <p>Läuft seit {monthLabel(group.seasonStart)}</p>
      </div>

      <div className="card stack" style={{ alignItems: "flex-start" }}>
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
