import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, watchAuth, doc, onSnapshot } from "../firebase.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [authUser, setAuthUser] = useState(undefined); // undefined = lädt noch, null = ausgeloggt
  const [profile, setProfile] = useState(undefined);
  const [group, setGroup] = useState(undefined);

  useEffect(() => watchAuth(setAuthUser), []);

  useEffect(() => {
    if (!authUser) {
      setProfile(authUser === null ? null : undefined);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", authUser.uid), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [authUser]);

  useEffect(() => {
    if (profile === undefined) {
      setGroup(undefined); // Profil lädt noch -> Gruppe auch noch unklar
      return;
    }
    if (!profile || !profile.groupId) {
      setGroup(null); // kein Profil oder noch keiner Gruppe beigetreten
      return;
    }
    const unsub = onSnapshot(doc(db, "groups", profile.groupId), (snap) => {
      setGroup(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [profile]);

  const loading = authUser === undefined || (authUser && profile === undefined);

  return (
    <AppContext.Provider value={{ authUser, profile, group, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
