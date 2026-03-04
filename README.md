# SAGA Kandidattest

Kandidattest til kommunalvalg -- matcher vælgere med politikere baseret på holdninger til lokale udsagn.

## Hurtig start

```bash
npm install
npm start
```

Serveren kører på **http://localhost:3000**.
Politiker-formularen er på **http://localhost:3000/politiker**.

Du skal have en `.env` fil i roden med:

```
SUPABASE_URL="https://din-projekt.supabase.co"
SUPABASE_ANON_KEY="din-anon-key"
```

## Database

Databasen er sat op i Supabase med 4 tabeller og `question_id` som rygrad:

| Tabel | Formål |
|---|---|
| `questions` | De endelige udsagn |
| `candidates` | Politikerprofiler (navn, parti, storkreds) |
| `candidate_answers` | Én række per politiker per spørgsmål (`value` + `stance`) |
| `user_answers` | Vælgernes besvarelser (write-only -- kan ikke læses af anon) |

Skemaet ligger i `supabase/migration.sql` som reference.

## Sådan opdaterer I spørgsmålene

Når de endelige 20-30 spørgsmål er valgt:

1. Åbn `seed-questions.json` og erstat indholdet med de nye spørgsmål. Formatet er:

```json
[
  {
    "id": "q1",
    "topic": "Klima",
    "text": "Kommunen skal plante flere træer i byen.",
    "explain": "Kort udsagn om grønne områder.",
    "default_weight": 2,
    "sort_order": 1
  }
]
```

   - `id` skal være unik per spørgsmål (fx `q1`, `q2`, ...)
   - `sort_order` bestemmer rækkefølgen i testen
   - `explain` er den korte forklaring der vises hvis brugeren slår det til

2. Kør seed-scriptet:

```bash
npm run seed
```

Det upsert'er (indsætter eller opdaterer) alle spørgsmål i databasen. Eksisterende spørgsmål med samme `id` bliver opdateret.

## Politiker-formular

Send linket `<din-url>/politiker` til politikerne. De udfylder navn, parti og storkreds, besvarer alle udsagn, og deres svar gemmes direkte i databasen. Når de har svaret, dukker de automatisk op som match-kandidater i testen.

## Framer (React)

`kandidattest/KandidattestFramer.jsx` kan bruges som Code Component i Framer.
Sæt **Supabase URL** og **Supabase Anon Key** i property controls, og komponenten henter spørgsmål + kandidater fra databasen.
