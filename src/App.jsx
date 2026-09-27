import { HashRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Login from "./pages/Login.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import PendingApproval from "./pages/PendingApproval.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SetDish from "./pages/SetDish.jsx";
import Submit from "./pages/Submit.jsx";
import Book from "./pages/Book.jsx";
import Settings from "./pages/Settings.jsx";

function Tabbar() {
  return (
    <nav className="tabbar">
      <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
        <span>🍽️</span><span>Heute</span>
      </NavLink>
      <NavLink to="/book" className={({ isActive }) => (isActive ? "active" : "")}>
        <span>📖</span><span>Buch</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
        <span>⚙️</span><span>Mehr</span>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Tabbar />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Gate />
      </HashRouter>
    </AppProvider>
  );
}
