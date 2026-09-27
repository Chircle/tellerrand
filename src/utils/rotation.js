// Gibt den aktuellen Monat als "YYYY-MM" zurück.
export function currentMonthId(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(monthId, n) {
  const [y, m] = monthId.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return currentMonthId(d);
}

export function monthLabel(monthId) {
  const [y, m] = monthId.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

// Berechnet den Host für einen Monat: zählt ausgehend vom seasonStart nur
// Monate, die NICHT übersprungen wurden, und rotiert dann durch rotationOrder.
// skippedMonths: Array von Monat-IDs, die als "ausgefallen" markiert sind.
export function hostForMonth(monthId, { seasonStart, rotationOrder, skippedMonths = [] }) {
  if (!rotationOrder?.length) return null;
  if (skippedMonths.includes(monthId)) return null;

  let cursor = seasonStart;
  let effectiveIndex = 0;
  // Iteriere von seasonStart bis monthId und zähle nur nicht-übersprungene Monate.
  // Sicherheitslimit von 240 Monaten (20 Jahre) gegen Endlosschleifen.
  for (let i = 0; i < 240; i++) {
    const isSkipped = skippedMonths.includes(cursor);
    if (cursor === monthId) {
      if (isSkipped) return null;
      return rotationOrder[effectiveIndex % rotationOrder.length];
    }
    if (!isSkipped) effectiveIndex++;
    cursor = addMonths(cursor, 1);
  }
  return null;
}
