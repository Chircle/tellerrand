import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { auth, db, doc, setDoc, updateDoc, getDoc, arrayUnion } from "../firebase.js";
import AvatarEditor from "./AvatarEditor.jsx";

function makeInviteCode() {
  const words = ["PFANNE", "LOEFFEL", "TOPF", "TELLER", "WOK", "OFEN"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${num}`;
}

function CreateProfileStep({ onDone }) {
  const [name, setName] = useState(auth.currentUser?.displayName?.split(" ")[0] || "");
  const [avatar, setAvatar] = useState({ bodyColor: 0, face: 0, headpiece: 0 });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      displayName: name.trim(),
      avatar,
      groupId: null,
    });
    setSaving(false);
    onDone();
  };

  return (
    <div className="screen">
      <h2>Willkommen! 👋</h2>
      <p>Wie sollen dich die anderen sehen?</p>
      <input placeholder="Dein Name" value={name} onChange={(e) => setName(e.target.value)} />
      <AvatarEditorInline avatar={avatar} setAvatar={setAvatar} />
      <button className="btn block" disabled={!name.trim() || saving} onClick={save}>
        {saving ? "Speichern…" : "Weiter"}
      </button>
    </div>
  );
}

// Leichte Wrapper-Variante ohne eigenen Speichern-Button, da der Schritt
// gemeinsam mit dem Namen gespeichert wird.
function AvatarEditorInline({ avatar, setAvatar }) {
  return (
    <AvatarEditor
      initial={avatar}
      saving={false}
      onSave={setAvatar}
    />
  );
}

function GroupStep({ profile, onDone }) {
  const [mode, setMode] = useState(null); // "create" | "join"
  const [groupName, setGroupName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!groupName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const inviteCode = makeInviteCode();
      const groupRef = doc(db, "groups", crypto.randomUUID());
      await setDoc(groupRef, {
        name: groupName.trim(),
        inviteCode,
        memberIds: [auth.currentUser.uid],
        rotationOrder: [auth.currentUser.uid],
        seasonStart: new Date().toISOString().slice(0, 7),
        skippedMonths: [],
        createdBy: auth.currentUser.uid,
      });
      // Eigene, schlanke Lookup-Collection: Code -> Gruppen-ID.
      // Macht den Beitritt per Code möglich, ohne eine Firestore-Query mit
      // Index über alle Gruppen zu brauchen.
      await setDoc(doc(db, "inviteCodes", inviteCode), { groupId: groupRef.id });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { groupId: groupRef.id });
      onDone();
    } catch (e) {
      setError("Konnte Gruppe nicht erstellen. Versuch's nochmal.");
    }
    setBusy(false);
  };

  const join = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    try {
      // Kleine Einschränkung: da Firestore keine "where inviteCode =="-Abfrage
      // ohne Index in dieser einfachen App hat, wird der Code als Dokument-ID-
      // Präfix erwartet — praktikabler: wir bitten um die Gruppen-ID direkt.
      // Für eine schlanke App reicht ein Lookup über eine eigene Codes-Collection:
      const codeSnap = await getDoc(doc(db, "inviteCodes", code.trim().toUpperCase()));
      if (!codeSnap.exists()) {
        setError("Code nicht gefunden. Bitte prüfen.");
        setBusy(false);
        return;
      }
      const groupId = codeSnap.data().groupId;
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        setError("Diese Gruppe existiert nicht mehr.");
        setBusy(false);
        return;
      }
      if ((groupSnap.data().memberIds || []).length >= 5) {
        setError("Diese Gruppe ist bereits voll (max. 5 Personen).");
        setBusy(false);
        return;
      }
      await updateDoc(groupRef, {
        memberIds: arrayUnion(auth.currentUser.uid),
        rotationOrder: arrayUnion(auth.currentUser.uid),
      });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { groupId });
      onDone();
    } catch (e) {
      setError("Beitritt fehlgeschlagen. Versuch's nochmal.");
    }
    setBusy(false);
  };

  if (!mode) {
    return (
      <div className="screen">
        <h2>Hallo {profile.displayName}!</h2>
        <p>Erstell eine neue Gruppe oder tritt mit einem Code bei.</p>
        <button className="btn block" onClick={() => setMode("create")}>Neue Gruppe gründen</button>
        <button className="btn secondary block" onClick={() => setMode("join")}>Mit Code beitreten</button>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="screen">
        <button className="btn ghost" style={{ alignSelf: "flex-start" }} onClick={() => setMode(null)}>‹ Zurück</button>
        <h2>Wie heißt eure Gruppe?</h2>
        <input placeholder="z. B. Pfannenbande" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
        <button className="btn block" disabled={!groupName.trim() || busy} onClick={create}>
          {busy ? "Erstellen…" : "Gruppe erstellen"}
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <button className="btn ghost" style={{ alignSelf: "flex-start" }} onClick={() => setMode(null)}>‹ Zurück</button>
      <h2>Einladungscode</h2>
      <input placeholder="z. B. PFANNE-7213" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
      {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
      <button className="btn block" disabled={!code.trim() || busy} onClick={join}>
        {busy ? "Beitreten…" : "Beitreten"}
      </button>
    </div>
  );
}

export default function Onboarding() {
  const { profile } = useApp();

  if (profile === null) {
    return <CreateProfileStep onDone={() => {}} />;
  }
  if (profile && !profile.groupId) {
    return <GroupStep profile={profile} onDone={() => {}} />;
  }
  return null;
}
