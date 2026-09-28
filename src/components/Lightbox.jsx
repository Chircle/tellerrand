import { useEffect } from "react";
import { createPortal } from "react-dom";

// Wird per Portal direkt in <body> gerendert. Wichtig, weil Buchseiten und
// Karten gedreht/transformiert werden – innerhalb solcher Elemente würde
// "position: fixed" sich sonst nicht mehr auf den Bildschirm beziehen.
export default function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!src) return null;

  return createPortal(
    <div
      onClick={onClose}
      // React-Events laufen auch durch Portale nach oben: verhindert, dass
      // Wischen im Vollbild das Buch im Hintergrund umblättert.
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(38, 26, 18, 0.93)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Schließen"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 14px)",
          right: 14,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "2px dashed rgba(246,236,211,.7)",
          background: "rgba(246,236,211,0.15)",
          color: "#f6ecd3",
          fontSize: 22,
        }}
      >
        ✕
      </button>
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          border: "10px solid #f6ecd3",
          borderBottomWidth: 28,
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,.55)",
          transform: "rotate(-1deg)",
        }}
      />
    </div>,
    document.body
  );
}
