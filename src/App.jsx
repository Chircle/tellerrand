import { HashRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Login from "./pages/Login.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import PendingApproval from "./pages/PendingApproval.jsx";
import Sticker from "./components/Stickers.jsx";
import { useScrollVar } from "./utils/useScrollVar.js";
import Dashboard from "./pages/Dashboard.jsx";
import SetDish from "./pages/SetDish.jsx";
import Submit from "./pages/Submit.jsx";
import Book from "./pages/Book.jsx";
import Settings from "./pages/Settings.jsx";
import Stats from "./pages/Stats.jsx";

const iconProps = { width: 26, height: 26, viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };

function Tabbar() {
  const cls = ({ isActive }) => (isActive ? "active" : "");
  return (
    <nav className="tabbar">
      <NavLink to="/" end className={cls}>
        <svg {...iconProps}><circle cx="16" cy="17" r="10" /><circle cx="16" cy="17" r="5.5" /><path d="M4 4v8M2 4v5a2 2 0 0 0 4 0V4M29 4c-3 2-3 7 0 9v15" /></svg>
        <span>Heute</span>
      </NavLink>
      <NavLink to="/book" className={cls}>
        <svg {...iconProps}><path d="M16 8c-3-2.5-8-3-12-2v19c4-1 9-.5 12 2 3-2.5 8-3 12-2V6c-4-1-9-.5-12 2Z" /><path d="M16 8v19" /></svg>
        <span>Buch</span>
      </NavLink>
      <NavLink to="/settings" className={cls}>
        <svg {...iconProps}><circle cx="16" cy="16" r="4.5" /><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8" /></svg>
        <span>Mehr</span>
      </NavLink>
    </nav>
  );
}

function Gate() {
  const { authUser, profile, group, loading } = useApp();

  if (loading) {
    return <div className="center-screen"><p>Lädt…</p></div>;
  }
  if (!authUser) {
    return <Login />;
  }
  // Google-Konten kommen von Google immer schon mit emailVerified: true.
  // Nur bei E-Mail/Passwort-Registrierung muss der Link erst bestätigt werden.
  if (!authUser.emailVerified) {
    return <VerifyEmail />;
  }
  if (profile === null || (profile && !profile.groupId)) {
    return <Onboarding />;
  }
  if (!group) {
    return <div className="center-screen"><p>Lädt Gruppe…</p></div>;
  }
  // Profil zeigt auf eine Gruppe, aber die eigene uid steht noch nicht in
  // memberIds -> die Beitrittsanfrage wartet noch auf Freigabe.
  if (!group.memberIds.includes(authUser.uid)) {
    return <PendingApproval />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/set-dish" element={<SetDish />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/book" element={<Book />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Tabbar />
    </>
  );
}

// Gemeinsame Bausteine: SVG-Filter für den ausgefransten Papierrand und
// Sticker in den Rändern breiter Bildschirme (auf dem Handy ausgeblendet).
function Decor() {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="deckle" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="margin-stickers" aria-hidden="false">
        <Sticker type="roll" size={110} rot={-8} par={0.06} spin={0.03} pos={{ top: 90, left: "6%" }} />
        <Sticker type="jar" size={120} rot={6} par={0.1} pos={{ bottom: 70, left: "9%" }} />
        <Sticker type="candle" size={96} rot={-5} par={0.05} pos={{ top: 160, right: "7%" }} />
        <Sticker type="berry" size={80} rot={14} par={0.09} spin={0.05} pos={{ bottom: 120, right: "10%" }} />
      </div>
    </>
  );
}

export default function App() {
  useScrollVar();
  return (
    <AppProvider>
      <Decor />
      <HashRouter>
        <Gate />
      </HashRouter>
    </AppProvider>
  );
}
