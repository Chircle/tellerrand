import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Der "base"-Pfad muss dem Repo-Namen entsprechen, wenn die App unter
// https://<username>.github.io/<repo-name>/ läuft.
// Läuft sie unter einer User-Page (https://<username>.github.io/), auf "/" setzen.
export default defineConfig({
  plugins: [react()],
  base: "/tellerrand/",
});
