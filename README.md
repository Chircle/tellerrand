# Tellerrand 🍽️

Eure monatliche Kochchallenge, fürs Handy. Rotierend kocht jeder Monat eine
Person das Gericht ihrer Wahl vor, alle anderen kochen es nach, laden ein
Foto hoch und bewerten in 0,5-Schritten.

## Setup

### 1. Firebase-Projekt anlegen

1. Auf [console.firebase.google.com](https://console.firebase.google.com) ein neues Projekt erstellen.
2. **Authentication** → Sign-in method → **Google** aktivieren, und zusätzlich **E-Mail/Passwort** aktivieren (für Leute ohne Google-Konto).
3. **Firestore Database** → Datenbank im **produktiven Modus** erstellen (Region z. B. `eur3`).
4. Unter Projekteinstellungen → "Meine Apps" → Web-App (`</>`) hinzufügen. Firebase zeigt dir danach die Config-Werte (`apiKey`, `authDomain`, usw.) — die brauchst du gleich.

Cloud Storage brauchst du **nicht** einzurichten — Fotos werden komprimiert
direkt in Firestore gespeichert, damit ihr im kostenlosen Spark-Tarif bleibt
(Details siehe unten).

### 2. Security Rules deployen

Am einfachsten mit der Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # dein Projekt auswählen
firebase deploy --only firestore:rules
```

Alternativ: Inhalt von `firestore.rules` im Firebase-Konsolen-Editor (Firestore → Regeln) einfügen und veröffentlichen.

## Sicherheit bei der Registrierung

Bei E-Mail/Passwort-Registrierung ist der Zugriff auf die App erst nach
Bestätigung des Verifizierungslinks möglich (`VerifyEmail.jsx`). Das ist
nicht nur eine Frontend-Prüfung: `firestore.rules` verlangt für **jeden
Schreibzugriff** `request.auth.token.email_verified == true`. Selbst wenn
jemand den Frontend-Check umgeht, blockt die Datenbank selbst. Google-Konten
sind automatisch verifiziert und daher nie betroffen.

Zusätzlich sinnvoll, aber nicht eingebaut (optionaler Ausbau bei Bedarf):

- **Firebase App Check** (reCAPTCHA v3) gegen automatisierte Registrierungs-Bots.
- Die Firebase-Konsole limitiert Login-Versuche bei Passwort-Angriffen bereits automatisch (kein eigener Code nötig).

### 3. Lokale Entwicklung

```bash
npm install
cp .env.example .env
# .env mit deinen Firebase-Werten aus Schritt 1 befüllen
npm run dev
```

Die `.env` wird **nie** committet (steht in `.gitignore`).

### 4. GitHub Secrets für den Deploy setzen

Im Repo: **Settings → Secrets and variables → Actions → New repository secret**, für jeden dieser Namen:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Diese Werte stehen nirgendwo im Code — der Workflow (`.github/workflows/deploy.yml`) reicht sie beim Build als Umgebungsvariablen rein. Im ausgelieferten JavaScript-Bundle taucht die Firebase-Config danach zwangsläufig auf (das ist bei Firebase normal und kein Geheimnis), der eigentliche Schutz kommt aus den Security Rules.

### 5. GitHub Pages aktivieren

**Settings → Pages → Build and deployment → Source: "GitHub Actions"**.

Danach bei jedem Push auf `main` automatisch deployed. In der Google Cloud
Console kannst du den API-Key zusätzlich auf eure Domain
`https://<username>.github.io` einschränken (Credentials → API-Key bearbeiten
→ Application restrictions).

Falls das Repo **nicht** `tellerrand` heißt, den `base`-Wert in
`vite.config.js` an euren Repo-Namen anpassen.

### 6. App-Icons ergänzen (optional)

`public/manifest.webmanifest` erwartet `icon-192.png` und `icon-512.png`.
Bis die existieren, funktioniert die App trotzdem — nur das
"Zum Homescreen hinzufügen"-Icon ist dann das Standard-Symbol. Am
schnellsten: `public/favicon.svg` in ein PNG-Tool (z. B. favicon.io)
exportieren.

## Warum Fotos in Firestore statt Firebase Storage?

Seit Februar 2026 braucht Firebase Storage zwingend den kostenpflichtigen
Blaze-Tarif (auch wenn die Nutzung im Gratis-Kontingent bleibt). Um euch eine
Kreditkarte zu ersparen, werden Fotos im Browser auf ~1200px komprimiert und
als Base64-String direkt im jeweiligen Firestore-Dokument gespeichert. Bei
drei bis fünf Leuten über mehrere Jahre bleibt ihr damit weit unter dem
kostenlosen 1-GiB-Kontingent. Wer später doch auf volle Auflösung wechseln
will: nur `src/utils/imageCompress.js` und die Upload-Stellen in
`SetDish.jsx` / `Submit.jsx` gegen einen `firebase/storage`-Upload
austauschen, der Rest bleibt gleich.

## Datenmodell

```
users/{uid}                          displayName, avatar{bodyColor,face,headpiece}, groupId
groups/{groupId}                     name, inviteCode, memberIds[], rotationOrder[], seasonStart, skippedMonths[]
groups/{groupId}/months/{YYYY-MM}    hostUid, dishName, introText, recipeText?, recipeUrl?, referenceImageUrl?
  /entries/{uid}                     photoUrl, rating (0.5-Schritte), comment?
inviteCodes/{CODE}                   groupId   (Lookup für den Beitritt per Code)
```

Die Rotation wird **nicht** fest gespeichert, sondern aus `seasonStart`,
`rotationOrder` und `skippedMonths` berechnet (`src/utils/rotation.js`).
Ausgesetzte Monate verbrauchen keinen "Zug" in der Rotation.

## Struktur

```
src/
  firebase.js           Firebase-Init, liest Keys nur aus import.meta.env
  context/AppContext.jsx Auth + Profil + Gruppe reaktiv per onSnapshot
  pages/                 Login, Onboarding, Dashboard, SetDish, Submit, Book, Settings, AvatarEditor
  components/            Avatar (SVG-Ebenen), Stars (Halbschritt-Rating)
  utils/                 rotation.js, imageCompress.js
firestore.rules          Security Rules
.github/workflows/deploy.yml  Build + Deploy auf GitHub Pages
```
