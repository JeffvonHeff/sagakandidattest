# sagakandidattest
Kandidattest

## Gemning af brugersvar i ekstern CSV

Når en kandidat har gennemført testen, bliver svarene sendt til backend-endpointet
`POST /api/submissions` og gemt i den eksterne CSV-fil
`kandidattest/data/test_besvarelser.csv`.

Start applikationen via Node-serveren for at aktivere gemning:

```bash
node server.js
```

Serveren hoster både frontend (`kandidattest/`) og API til CSV-gemning.

## Kandidatdata fra spreadsheet

Kandidaternes svar ligger i `kandidattest/data/kandidat_svar.csv`.
Applikationen indlæser filen ved opstart og bruger den som datakilde til matching.

## Framer (React)

Der er lavet en React-version, som kan indsættes direkte som Code Component i Framer:

- `kandidattest/KandidattestFramer.jsx`

Komponenten har:
- spørgsmål + matchinglogik i React state
- indbygget CSV-data som fallback
- `csvData` property control, så du kan erstatte kandidatdata direkte i Framer
