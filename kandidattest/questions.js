// Skala: -2 helt uenig, -1 delvist uenig, 0 neutral, 1 delvist enig, 2 helt enig
// weight: brugers vægt per spørgsmål gemmes separat. Her er kun defaultWeight.

window.QUIZ_DATA = {
  quizId: "saga-template-001",
  title: "Kandidattest",
  questions: [
    {
      id: "q1",
      topic: "Klima",
      text: "Kommunen skal stille strengere klimakrav til nye byggeprojekter.",
      explain: "Forklar hvad der menes med krav, fx energiklasse, materialer, CO2 grænser.",
      defaultWeight: 1
    },
    {
      id: "q2",
      topic: "Skole",
      text: "Der skal bruges flere penge på folkeskolen, selv hvis det kræver besparelser andre steder.",
      explain: "Du kan definere hvilke områder det kunne være, eller lade det stå åbent.",
      defaultWeight: 1
    },
    {
      id: "q3",
      topic: "Transport",
      text: "Biltrafik i bymidten skal begrænses gennem færre p pladser og højere afgifter.",
      explain: "Præciser om det er en generel retning eller konkrete virkemidler.",
      defaultWeight: 1
    }
  ],

  // Kandidaters positionsdata på samme spørgsmål
  // Hvis en kandidat ikke har svaret, brug null og håndter det i scoring
  candidates: [
    {
      id: "c1",
      name: "Kandidat A",
      party: "Parti X",
      area: "København",
      answers: { q1: 2, q2: 1, q3: -1 }
    },
    {
      id: "c2",
      name: "Kandidat B",
      party: "Parti Y",
      area: "København",
      answers: { q1: 0, q2: 2, q3: 2 }
    },
    {
      id: "c3",
      name: "Kandidat C",
      party: "Parti Z",
      area: "Aarhus",
      answers: { q1: -2, q2: -1, q3: 0 }
    }
  ]
};