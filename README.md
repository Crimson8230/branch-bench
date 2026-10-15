# BranchBench

Ein prozeduraler Baum als Benchmark für JavaScript und WebAssembly. Beide Versionen berechnen mit demselben Algorithmus die Astkoordinaten; danach zeichnet ein Canvas den Baum. Die WebAssembly-Datei wird aus AssemblyScript kompiliert.

## Lokal starten

Voraussetzung: Node.js 20 oder neuer.

```bash
npm install
npm run dev
```

Die angezeigte lokale Adresse im Browser öffnen (normalerweise `http://127.0.0.1:5173/`). Mit `npm test` lässt sich die Gleichwertigkeit der Ergebnisse prüfen; `npm run build` erstellt den Produktionsbuild.

## Benchmark

Beide Versionen verwenden denselben Seed und dieselben Parameter. Nach fünf Aufwärmrunden misst `performance.now()` mehrere Berechnungen und zeigt die durchschnittliche Zeit pro Baum sowie den Speedup an. Laden der WebAssembly-Datei und Canvas-Zeichnen sind nicht Teil der Messung. Die Koordinaten werden anschließend verglichen.

Beispielmessung mit `npm run measure` unter Windows und Node.js 20.20.0, Seed 48271, Winkel 28°, Zufall 9°:

| Tiefe | Äste | JavaScript | WebAssembly | Speedup |
|---:|---:|---:|---:|---:|
| 8 | 255 | 0,0120 ms | 0,0049 ms | 2,48× |
| 11 | 2.047 | 0,0814 ms | 0,0351 ms | 2,32× |
| 14 | 16.383 | 0,7686 ms | 0,2831 ms | 2,72× |

Die Ergebnisse hängen von Gerät und Laufzeitumgebung ab. Die Anwendung misst direkt im Browser; `npm run measure` wiederholt die Messung in Node.js.
