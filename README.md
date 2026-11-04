# Zwei Tage

Deutschsprachiges Nachrichtenmagazin, das alle zwei Tage erscheint: Österreich, Wirtschaft & Börse, USA, EU, Technologie & KI, Sport.

Statische Web-App ohne Build-Schritt, gedacht für Vercel.

## Aufbau

- `index.html` – Seitengerüst
- `styles.css` – Design
- `app.js` – Ansichten (Startseite, Rubriken, Artikel, Archiv) mit Hash-Routing
- `data/zwei-tage.json` – alle Inhalte; neue Ausgaben werden vorne in `issues` eingefügt
- `icon.svg`, `manifest.webmanifest` – App-Icon, „Zum Home-Bildschirm hinzufügen“

## Fotos

Symbolfotos kommen von Unsplash und werden direkt von `images.unsplash.com` eingebunden, wie es die Unsplash-Richtlinien vorsehen. Pro Artikel steht im Feld `img`: `id`, `ph` (Foto-Pfad), `by` (Fotograf), `user` (Unsplash-Benutzername), `alt`. Ohne `img` zeigt die Seite eine generierte Grafik.

## Lokal ansehen

```
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen.
