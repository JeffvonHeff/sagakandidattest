// Skala: -2 helt uenig, -1 delvist uenig, 0 neutral, 1 delvist enig, 2 helt enig
// weight: brugers vægt per spørgsmål gemmes separat. Her er kun defaultWeight.

window.QUIZ_DATA = {
  quizId: "saga-template-001",
  title: "Kandidattest",
  questions: [
    { id: "q1", topic: "Klima", text: "Kommunen skal plante flere træer i byen.", explain: "Kort udsagn om grønne områder.", defaultWeight: 1 },
    { id: "q2", topic: "Klima", text: "Nye kommunale bygninger skal være mere energieffektive.", explain: "Handler om energikrav til offentlige bygninger.", defaultWeight: 1 },
    { id: "q3", topic: "Miljø", text: "Der skal være flere affaldssorteringspunkter i boligområder.", explain: "Lettere adgang til sortering.", defaultWeight: 1 },
    { id: "q4", topic: "Skole", text: "Der skal være færre elever i hver skoleklasse.", explain: "Fokus på klassestørrelse.", defaultWeight: 1 },
    { id: "q5", topic: "Skole", text: "Skoler skal have flere penge til specialundervisning.", explain: "Støtte til elever med særlige behov.", defaultWeight: 1 },
    { id: "q6", topic: "Dagtilbud", text: "Der skal ansættes flere pædagoger i daginstitutioner.", explain: "Voksne pr. barn i institutioner.", defaultWeight: 1 },
    { id: "q7", topic: "Sundhed", text: "Kommunen skal bruge flere penge på ældrepleje.", explain: "Bedre hjælp til ældre borgere.", defaultWeight: 1 },
    { id: "q8", topic: "Sundhed", text: "Det skal være nemmere at få hjemmehjælp.", explain: "Adgang til støtte i hjemmet.", defaultWeight: 1 },
    { id: "q9", topic: "Transport", text: "Der skal være flere cykelstier i kommunen.", explain: "Udbygning af cykelinfrastruktur.", defaultWeight: 1 },
    { id: "q10", topic: "Transport", text: "Busser og tog skal have højere prioritet end biltrafik.", explain: "Fokus på kollektiv trafik.", defaultWeight: 1 },
    { id: "q11", topic: "Transport", text: "Der skal indføres lavere hastighed i boligområder.", explain: "Trafiksikkerhed tæt på boliger.", defaultWeight: 1 },
    { id: "q12", topic: "Bolig", text: "Kommunen skal bygge flere billige boliger.", explain: "Flere boliger med lav husleje.", defaultWeight: 1 },
    { id: "q13", topic: "Bolig", text: "Nye boligområder skal have grønne fællesarealer.", explain: "Parker og opholdsrum i nye kvarterer.", defaultWeight: 1 },
    { id: "q14", topic: "Tryghed", text: "Der skal være mere synlig lokal tryghedsskabende indsats.", explain: "Fx gadeplansindsatser og nærvær i byrum.", defaultWeight: 1 },
    { id: "q15", topic: "Tryghed", text: "Kommunen skal investere mere i forebyggelse for unge i risiko.", explain: "Tidlige indsatser frem for senere reparation.", defaultWeight: 1 },
    { id: "q16", topic: "Kultur", text: "Der skal bruges flere penge på kultur- og fritidstilbud.", explain: "Biblioteker, kulturhuse og aktiviteter.", defaultWeight: 1 },
    { id: "q17", topic: "Kultur", text: "Kommunen skal støtte flere lokale idrætsforeninger.", explain: "Tilskud og faciliteter til foreninger.", defaultWeight: 1 },
    { id: "q18", topic: "Erhverv", text: "Det skal være lettere for små virksomheder at få tilladelser.", explain: "Mindre bureaukrati for iværksættere.", defaultWeight: 1 },
    { id: "q19", topic: "Erhverv", text: "Kommunen skal prioritere lokale indkøb hos små leverandører.", explain: "Støtte til lokalt erhvervsliv.", defaultWeight: 1 },
    { id: "q20", topic: "Digitalisering", text: "Flere kommunale services skal kunne klares digitalt.", explain: "Nem selvbetjening online.", defaultWeight: 1 },
    { id: "q21", topic: "Digitalisering", text: "Kommunen skal tilbyde bedre hjælp til borgere, der ikke er digitale.", explain: "Support til borgere med lav digital erfaring.", defaultWeight: 1 },
    { id: "q22", topic: "Økonomi", text: "Kommunen må gerne hæve skatten lidt for at forbedre velfærden.", explain: "Skat mod bedre service.", defaultWeight: 1 },
    { id: "q23", topic: "Økonomi", text: "Kommunen skal spare på administration før den sparer på velfærd.", explain: "Prioritering af kernevelfærd.", defaultWeight: 1 },
    { id: "q24", topic: "Demokrati", text: "Borgerne skal inddrages mere i lokale beslutninger.", explain: "Mere borgerdialog og høringer.", defaultWeight: 1 },
    { id: "q25", topic: "Demokrati", text: "Kommunen skal gøre det nemmere at forstå politiske beslutninger.", explain: "Klar og enkel kommunikation.", defaultWeight: 1 }
  ],

  // Kandidaters positionsdata på samme spørgsmål
  // Hvis en kandidat ikke har svaret, brug null og håndter det i scoring
  candidates: [
    {
      id: "c1",
      name: "Kandidat A",
      party: "Parti X",
      area: "København",
      answers: {
        q1: 2, q2: 2, q3: 1, q4: 1, q5: 2,
        q6: 2, q7: 2, q8: 1, q9: 2, q10: 1,
        q11: 1, q12: 2, q13: 2, q14: 1, q15: 2,
        q16: 1, q17: 2, q18: 0, q19: 1, q20: 1,
        q21: 2, q22: 1, q23: 2, q24: 2, q25: 2
      }
    },
    {
      id: "c2",
      name: "Kandidat B",
      party: "Parti Y",
      area: "København",
      answers: {
        q1: 0, q2: 1, q3: 0, q4: -1, q5: 1,
        q6: 0, q7: 1, q8: 0, q9: 1, q10: 2,
        q11: 0, q12: 0, q13: 1, q14: 1, q15: 0,
        q16: 0, q17: 1, q18: 2, q19: 0, q20: 2,
        q21: 0, q22: -1, q23: 1, q24: 1, q25: 1
      }
    },
    {
      id: "c3",
      name: "Kandidat C",
      party: "Parti Z",
      area: "Aarhus",
      answers: {
        q1: -1, q2: 0, q3: 1, q4: 2, q5: 1,
        q6: 1, q7: 1, q8: 2, q9: 0, q10: -1,
        q11: 2, q12: 2, q13: 1, q14: 0, q15: 1,
        q16: 2, q17: 1, q18: -1, q19: 1, q20: 0,
        q21: 2, q22: 1, q23: 2, q24: 2, q25: 1
      }
    }
  ]
};
