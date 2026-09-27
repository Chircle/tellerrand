import { useState } from "react";
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } from "../firebase.js";

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Das ist keine gültige E-Mail-Adresse.";
    case "auth/email-already-in-use":
      return "Für diese E-Mail existiert schon ein Konto. Versuch dich anzumelden.";
    case "auth/weak-password":
      return "Das Passwort muss mindestens 6 Zeichen haben.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-Mail oder Passwort stimmt nicht.";
    case "auth/popup-closed-by-user":
      return null; // Nutzer hat das Google-Fenster selbst geschlossen, kein Fehler nötig
    default:
      return "Etwas ist schiefgelaufen. Versuch's nochmal.";
  }
}

export default function Login() {
  const [mode, setMode] = useState("start"); // start | login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (e) {
      const msg = friendlyError(e.code);
      if (msg) setError(msg);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "register" && password !== password2) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (mode === "register" && password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "register") {
        await registerWithEmail(email.trim(), password);
        setInfo("Konto erstellt. Bestätige jetzt den Link, den wir dir geschickt haben.");
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    }
    setBusy(false);
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Trag zuerst deine E-Mail-Adresse ein.");
      return;
    }
    setError("");
    try {
      await resetPassword(email.trim());
      setInfo("Link zum Zurücksetzen wurde geschickt, falls die Adresse bei uns bekannt ist.");
    } catch (err) {
      setError(friendlyError(err.code));
    }
  };

  const Logo = (
    <svg width="56" height="56" viewBox="0 0 80 80">
      <circle cx="40" cy="44" r="30" fill="#e8a33d" />
      <circle cx="30" cy="41" r="4.5" fill="#1c1a17" />
      <circle cx="50" cy="41" r="4.5" fill="#1c1a17" />
      <path d="M28 56 Q40 66 52 56" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M22 24 Q22 6 40 6 Q58 6 58 24 L58 28 L22 28 Z" fill="#f2ede4" />
    </svg>
  );

  if (mode === "start") {
    return (
      <div className="center-screen">
        {Logo}
        <div>
          <h1 style={{ fontSize: 30 }}>Tellerrand</h1>
          <p style={{ marginTop: 8 }}>Eure monatliche Kochchallenge. Ein Gericht, drei Küchen, viele Sterne.</p>
        </div>
        {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
        <div className="stack" style={{ width: "100%" }}>
          <button className="btn block" onClick={handleGoogle}>Mit Google anmelden</button>
          <button className="btn secondary block" onClick={() => setMode("login")}>Mit E-Mail anmelden</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ justifyContent: "center" }}>
      <button className="btn ghost" style={{ alignSelf: "flex-start" }} onClick={() => setMode("start")}>‹ Zurück</button>
      {Logo}
      <h2>{mode === "register" ? "Konto erstellen" : "Anmelden"}</h2>

      <form className="stack" onSubmit={handleEmailSubmit}>
        <input type="email" placeholder="E-Mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Passwort" autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "register" ? 8 : 6} />
        {mode === "register" && (
          <input type="password" placeholder="Passwort wiederholen" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} required minLength={8} />
        )}
        {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
        {info && <p style={{ color: "var(--herb)" }}>{info}</p>}
        <button className="btn block" type="submit" disabled={busy}>
          {busy ? "Einen Moment…" : mode === "register" ? "Konto erstellen" : "Anmelden"}
        </button>
      </form>

      {mode === "login" ? (
        <div className="stack" style={{ alignItems: "center" }}>
          <button className="btn ghost" onClick={handleReset}>Passwort vergessen?</button>
          <button className="btn ghost" onClick={() => setMode("register")}>Noch kein Konto? Registrieren</button>
        </div>
      ) : (
        <button className="btn ghost" onClick={() => setMode("login")}>Schon ein Konto? Anmelden</button>
      )}
    </div>
  );
}
