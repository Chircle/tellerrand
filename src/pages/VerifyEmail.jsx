import { useState } from "react";
import { auth, logout, resendVerification, refreshCurrentUser } from "../firebase.js";

export default function VerifyEmail() {
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [notYet, setNotYet] = useState(false);

  const resend = async () => {
    await resendVerification();
    setResent(true);
    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const checkVerified = async () => {
    setChecking(true);
    setNotYet(false);
    const verified = await refreshCurrentUser();
    if (verified) {
      // Ein voller Reload lädt den Auth-Zustand sauber mit dem bestätigten
      // Status neu ein, statt uns auf Timing von internen SDK-Events zu verlassen.
      window.location.reload();
      return;
    }
    setChecking(false);
    setNotYet(true);
  };

  return (
    <div className="center-screen">
      <div style={{ fontSize: 40 }}>📬</div>
      <div>
        <h2>Bestätige deine E-Mail</h2>
        <p style={{ marginTop: 8 }}>
          Wir haben einen Link an <strong style={{ color: "var(--text)" }}>{auth.currentUser?.email}</strong> geschickt.
          Klick ihn an, dann geht's hier weiter.
        </p>
      </div>

      {notYet && <p style={{ color: "var(--tomato)" }}>Noch nicht bestätigt. Schau auch im Spam-Ordner nach.</p>}
      {resent && cooldown > 0 && <p style={{ color: "var(--herb)" }}>Mail erneut verschickt.</p>}

      <button className="btn block" onClick={checkVerified} disabled={checking}>
        {checking ? "Prüfe…" : "Ich hab's bestätigt"}
      </button>
      <button className="btn secondary block" onClick={resend} disabled={cooldown > 0}>
        {cooldown > 0 ? `Erneut senden (${cooldown}s)` : "Mail erneut senden"}
      </button>
      <button className="btn ghost" onClick={logout}>Falsche Adresse? Abmelden</button>
    </div>
  );
}
