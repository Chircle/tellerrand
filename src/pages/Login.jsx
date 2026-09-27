import { loginWithGoogle } from "../firebase.js";

export default function Login() {
  return (
    <div className="center-screen">
      <svg width="72" height="72" viewBox="0 0 80 80">
        <circle cx="40" cy="44" r="30" fill="#e8a33d" />
        <circle cx="30" cy="41" r="4.5" fill="#1c1a17" />
        <circle cx="50" cy="41" r="4.5" fill="#1c1a17" />
        <path d="M28 56 Q40 66 52 56" stroke="#1c1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M22 24 Q22 6 40 6 Q58 6 58 24 L58 28 L22 28 Z" fill="#f2ede4" />
      </svg>
      <div>
        <h1 style={{ fontSize: 30 }}>Tellerrand</h1>
        <p style={{ marginTop: 8 }}>Eure monatliche Kochchallenge. Ein Gericht, drei Küchen, viele Sterne.</p>
      </div>
      <button className="btn block" onClick={loginWithGoogle}>Mit Google anmelden</button>
    </div>
  );
}
