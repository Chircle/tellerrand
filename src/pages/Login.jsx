import { useState } from "react";
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } from "../firebase.js";
import Sticker from "../components/Stickers.jsx";

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

// Buchdeckel: Tartan-Stoff + Sticker. Muss auf Modul-Ebene stehen (nicht in
// Login), sonst würde React die Eingabefelder bei jedem Tastendruck neu
// aufbauen und sie verlören den Fokus.
function Cover({ children }) {
  return (
    <div className="cover">
      <Sticker type="stamp" size={84} rot={-7} par={0.05} glyph="pumpkin" label="Herbst" sub="Tellerrand" pos={{ top: 26, left: 22 }} />
      <Sticker type="roll" size={92} rot={9} spin={0.04} par={0.03} pos={{ top: 22, right: 20 }} />
      <Sticker type="candle" size={78} rot={-6} par={0.06} pos={{ bottom: 28, left: 30 }} />
      <Sticker type="jar" size={104} rot={7} par={0.04} pos={{ bottom: 22, right: 26 }} />
      {children}
    </div>
  );
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

  if (mode === "start") {
    return (
      <Cover>
        <div className="cover-label">
          <Sticker type="bow" size={62} rot={-14} par={0.02} pos={{ top: -26, left: -14 }} />
          <Sticker type="fawn" size={92} rot={3} par={0.03} pos={{ top: -64, right: -6 }} />
          <div className="cover-title">Tellerrand</div>
          <p style={{ marginTop: 16, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 17 }}>
            Euer monatliches Kochbuch.<br />Ein Gericht, viele Küchen, ganz viele Sterne.
          </p>
          <Sticker type="cookie" size={62} rot={14} spin={0.1} pos={{ bottom: -26, right: -10 }} />
          <Sticker type="berry" size={50} rot={-10} par={0.05} pos={{ bottom: -22, left: 12 }} />
        </div>
        {error && <p style={{ color: "#ffe3d6", textAlign: "center", marginBottom: 12 }}>{error}</p>}
        <div className="stack" style={{ position: "relative", zIndex: 2 }}>
          <button className="btn block" onClick={handleGoogle}>Mit Google anmelden</button>
          <button className="btn secondary block" onClick={() => setMode("login")}>Mit E-Mail anmelden</button>
        </div>
      </Cover>
    );
  }

  return (
    <Cover>
      <div className="cover-label" style={{ textAlign: "left" }}>
        <Sticker type="bow" size={56} rot={-14} par={0.02} pos={{ top: -24, left: -12 }} />
        <div className="stack" style={{ gap: 14 }}>
          <button className="btn ghost" style={{ alignSelf: "flex-start", padding: "0 4px" }} onClick={() => setMode("start")}>‹ Zurück</button>
          <h2 style={{ fontSize: 28 }}>{mode === "register" ? "Konto erstellen" : "Anmelden"}</h2>

          <form className="stack" onSubmit={handleEmailSubmit}>
            <input type="email" placeholder="E-Mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Passwort" autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "register" ? 8 : 6} />
            {mode === "register" && (
              <input type="password" placeholder="Passwort wiederholen" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} required minLength={8} />
            )}
            {error && <p style={{ color: "var(--tomato)", fontWeight: 700 }}>{error}</p>}
            {info && <p style={{ color: "var(--herb)", fontWeight: 700 }}>{info}</p>}
            <button className="btn block" type="submit" disabled={busy}>
              {busy ? "Einen Moment…" : mode === "register" ? "Konto erstellen" : "Anmelden"}
            </button>
          </form>

          {mode === "login" ? (
            <div className="stack" style={{ alignItems: "center", gap: 4 }}>
              <button className="btn ghost" onClick={handleReset}>Passwort vergessen?</button>
              <button className="btn ghost" onClick={() => setMode("register")}>Noch kein Konto? Registrieren</button>
            </div>
          ) : (
            <button className="btn ghost" onClick={() => setMode("login")}>Schon ein Konto? Anmelden</button>
          )}
        </div>
        <Sticker type="cookie" size={54} rot={14} spin={0.1} pos={{ bottom: -24, right: -8 }} />
      </div>
    </Cover>
  );
}
