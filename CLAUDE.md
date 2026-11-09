# REFRAKTION – Semesterarbeit Interaktionsdesign (HFU)

## Konzept

Ein Reels-Feed, in dem mit jedem gesehenen Reel eine **Brechungstiefe** (0 bis 1) steigt.

- **Ton wird gebrochen:** dumpfer, mit Hall, wandert im Raum, mit Zeitversatz. Der Ton des vorherigen Reels liegt über dem aktuellen.
- **Bild bricht in die Realität:** Die Videos verblassen, das Kamerabild der Nutzerin (gespiegelt, in Graustufen) blendet ein, bis der Feed ein Spiegel ist.

Alle Effekte hängen an der Brechungstiefe: Bei 0 ist der Feed normal, bei 1 ist er ganz Spiegel.

## Constraints (verbindlich)

- **Farben:** nur Schwarz, Weiß, Grau und die eine Akzentfarbe `#ff5369`.
- **Formen:** nur Grundformen: Punkt, Kreis, Quadrat, Rechteck.
- **Technik:** Vanilla HTML/CSS/JS, keine Frameworks, keine Bibliotheken.
- **Ausführung:** läuft über localhost (z. B. `python3 -m http.server`), nötig für Kamerazugriff und Video/Audio.

## Dateien

- `index.html`: Struktur
- `styles.css`: Gestaltung
- `script.js`: Feed-Logik, Brechungstiefe, Audio- und Kamera-Effekte
- `Videos/`: Reel-Videos
