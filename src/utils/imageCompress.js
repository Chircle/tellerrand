// Komprimiert ein Bild im Browser auf max. 1200px Kantenlänge und speichert
// es als JPEG-Base64. So passt ein Foto sicher unter das 1-MB-Dokumentlimit
// von Firestore, und wir kommen ganz ohne Firebase Storage (= ohne Blaze-Tarif) aus.
export function compressImage(file, { maxDim = 1200, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        // Grobe Sicherung: Firestore-Feldlimit ist 1 MiB. Base64 ist ~33% größer
        // als die Rohdaten, wir bleiben also mit Marge deutlich darunter.
        if (dataUrl.length > 700_000) {
          resolve(canvas.toDataURL("image/jpeg", 0.5));
        } else {
          resolve(dataUrl);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
