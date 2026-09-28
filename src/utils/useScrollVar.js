import { useEffect } from "react";

// Schreibt die Scroll-Position als CSS-Variable --sy auf <html>.
// Sticker nutzen sie, um sich beim Scrollen leicht zu verschieben/zu drehen.
export function useScrollVar() {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      document.documentElement.style.setProperty("--sy", String(Math.round(window.scrollY)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
}
