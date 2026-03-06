import * as React from "react";
import { addPropertyControls, ControlType } from "framer";

const FALLBACK_QUESTIONS = [
{ id:"q1",topic:"Uddannelse",text:"Reformer, der forkorter uddannelser, lægger et for stort pres på studerende og går ud over unges trivsel.",defaultWeight:1},
{ id:"q2",topic:"Uddannelse",text:"Det 6. SU-år bør genindføres.",defaultWeight:1},
{ id:"q3",topic:"Uddannelse",text:"SU’en bør hæves for at følge de stigende leveomkostninger for studerende.",defaultWeight:1},

{ id:"q4",topic:"Klima miljø og grøn omstilling",text:"Beskyttelsen af rent drikkevand bør prioriteres højere end landbrugets interesser.",defaultWeight:1},
{ id:"q5",topic:"Klima miljø og grøn omstilling",text:"Den grønne omstilling bør gennemføres, også hvis det kan svække dansk konkurrenceevne.",defaultWeight:1},
{ id:"q6",topic:"Klima miljø og grøn omstilling",text:"Kravene til svineproduktionen bør skærpes – også hvis det gør dansk landbrug mindre konkurrencedygtigt.",defaultWeight:1},
{ id:"q7",topic:"Klima miljø og grøn omstilling",text:"Danmark bør fremrykke målet om klimaneutralitet fra 2045 til 2035.",defaultWeight:1},

{ id:"q8",topic:"EU international politik og solidaritet",text:"Danmark bør anerkende Palæstina som stat.",defaultWeight:1},
{ id:"q9",topic:"EU international politik og solidaritet",text:"Danmark bør øge den humanitære hjælp til mennesker ramt af krig og konflikter – også hvis det kræver omprioriteringer i de offentlige udgifter.",defaultWeight:1},
{ id:"q10",topic:"EU international politik og solidaritet",text:"Danmark bør styrke samarbejdet i EU – også hvis det betyder mindre national selvbestemmelse.",defaultWeight:1},

{ id:"q11",topic:"Demokrati",text:"Stemmeretsalderen bør sænkes til 16 år.",defaultWeight:1},
{ id:"q12",topic:"Demokrati",text:"Der bør indføres strengere regler for lobbyisme i dansk politik.",defaultWeight:1},

{ id:"q13",topic:"Sundhed og trivsel",text:"Ordningen med gratis psykologhjælp til 18–24-årige med mild til moderat angst eller depression bør udvides til at omfatte flere aldersgrupper.",defaultWeight:1},
{ id:"q14",topic:"Sundhed og trivsel",text:"Ventetiden på udredning af børn og unge i psykiatrien bør nedbringes – også hvis det kræver øget brug af private behandlere.",defaultWeight:1},

{ id:"q15",topic:"Bolig",text:"Staten bør regulere boligmarkedet for at gøre det lettere for unge og førstegangskøbere at komme ind på boligmarkedet.",defaultWeight:1},
{ id:"q16",topic:"Bolig",text:"Huslejestigninger bør i højere grad reguleres ved lov.",defaultWeight:1},
{ id:"q17",topic:"Bolig",text:"Der bør bygges flere billige studieboliger i de større byer.",defaultWeight:1},

{ id:"q18",topic:"Værdipolitik ligestilling og repræsentation",text:"Der bør gennemføres politiske tiltag for at mindske polarisering og had i den offentlige debat.",defaultWeight:1},
{ id:"q19",topic:"Værdipolitik ligestilling og repræsentation",text:"Der bør iværksættes tiltag for at øge repræsentationen af køn og minoriteter i politik.",defaultWeight:1},
{ id:"q20",topic:"Værdipolitik ligestilling og repræsentation",text:"Skoler og uddannelsesinstitutioner bør gøre mere for at sikre trivsel for LGBT+-elever.",defaultWeight:1},

{ id:"q21",topic:"Forsvar og sikkerhed",text:"Staten bør have mulighed for at indføre overvågning af borgernes private kommunikation for at forebygge kriminalitet og terror.",defaultWeight:1},
{ id:"q22",topic:"Forsvar og sikkerhed",text:"Danmark bør øge forsvarsbudgettet – også hvis det betyder færre penge til andre områder.",defaultWeight:1},

{ id:"q23",topic:"Fremtidens arbejdsmarked",text:"AI bør reguleres politisk for at beskytte unges jobsikkerhed.",defaultWeight:1},

{ id:"q24",topic:"Udlændinge og integration",text:"Danmarks udlændingepolitik bør strammes.",defaultWeight:1},
{ id:"q25",topic:"Udlændinge og integration",text:"Danmark bør gennemføre udvisninger af kriminelle udlændinge – også selvom det strider mod Den Europæiske Menneskerettighedskonvention.",defaultWeight:1},

{ id:"q26",topic:"Skat afgifter økonomi og arbejdsmarked",text:"Investeringer i uddannelse bør prioriteres højere end skattelettelser.",defaultWeight:1},
{ id:"q27",topic:"Skat afgifter økonomi og arbejdsmarked",text:"For at styrke Danmarks konkurrenceevne bør økonomisk vækst prioriteres højere end at reducere økonomisk ulighed.",defaultWeight:1},
{ id:"q28",topic:"Skat afgifter økonomi og arbejdsmarked",text:"Der bør indføres formueskat for at reducere økonomisk ulighed.",defaultWeight:1},

{ id:"q29",topic:"Retspolitik og tryghed",text:"Straffen for personfarlig kriminalitet (fx voldtægt og grov vold) bør skærpes.",defaultWeight:1},
{ id:"q30",topic:"Retspolitik og tryghed",text:"Sociale medier bør reguleres strengere for at beskytte børn og unge mod skadeligt indhold.",defaultWeight:1},
];

// Canonical storkredse -- keep in sync with storkredse.js
const MUNICIPALITIES = [
  "Bornholm", "Fyn", "København", "Københavns Omegn",
  "Nordjylland", "Nordsjælland", "Sjælland",
  "Sydjylland", "Vestjylland", "Østjylland",
];

const DEFAULT_CSV = `id,name,party,area,q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12,q13,q14,q15,q16,q17,q18,q19,q20,q21,q22,q23,q24,q25,q26,q27,q28,q29,q30
c1,Kandidat A,Parti X,København,2,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,2,0,1,1,2,1,2,2,2,1,1,2,1
c2,Kandidat B,Parti Y,København,0,1,0,-1,1,0,1,0,1,2,0,0,1,1,0,0,1,2,0,2,0,-1,1,1,1,0,1,-1,0
c3,Kandidat C,Parti Z,Østjylland,-1,0,1,2,1,1,1,2,0,-1,2,2,1,0,1,2,1,-1,1,0,2,1,2,2,1,1,0,1,2`;

export default function KandidattestFramerCosineSimilarity({
  title,
  supabaseUrl,
  supabaseAnonKey,
  csvData,
  showExplanationsByDefault,
}) {
  const [screen, setScreen] = React.useState("start");
  const [step, setStep] = React.useState(0);
  const [area, setArea] = React.useState("");
  const [showExplain, setShowExplain] = React.useState(
    showExplanationsByDefault,
  );
  const [responses, setResponses] = React.useState({});
  const [questions, setQuestions] = React.useState(FALLBACK_QUESTIONS);
  const [candidates, setCandidates] = React.useState(() =>
    parseCandidates(csvData, FALLBACK_QUESTIONS),
  );

  React.useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    const headers = {
      apikey: supabaseAnonKey,
      Authorization: "Bearer " + supabaseAnonKey,
    };

    fetch(supabaseUrl + "/rest/v1/questions?order=sort_order", { headers })
      .then((r) => r.json())
      .then((rows) => {
        if (!Array.isArray(rows) || !rows.length) return;
        const mapped = rows.map((q) => ({
          id: q.id,
          topic: q.topic || "",
          text: q.text,
          explain: q.explain || "",
          defaultWeight: q.default_weight || 1,
        }));
        setQuestions(mapped);
      })
      .catch(() => {});

    fetch(
      supabaseUrl +
        "/rest/v1/candidates?select=*,candidate_answers(question_id,value)",
      { headers },
    )
      .then((r) => r.json())
      .then((rows) => {
        if (!Array.isArray(rows) || !rows.length) return;
        setCandidates(
          rows.map((c) => {
            const answers = {};
            (c.candidate_answers || []).forEach((a) => {
              answers[a.question_id] = a.value;
            });
            return {
              id: c.id,
              name: c.name || "Ukendt",
              party: c.party || "",
              area: c.area || "",
              answers,
            };
          }),
        );
      })
      .catch(() => {});
  }, [supabaseUrl, supabaseAnonKey]);

  const question = questions[step];

  const municipalityOptions = React.useMemo(() => {
    return [...new Set(MUNICIPALITIES)].sort((a, b) =>
      a.localeCompare(b, "da"),
    );
  }, []);

  const isAreaValid = municipalityOptions.includes(area.trim());

  const startQuiz = () => {
    if (!isAreaValid) return;
    setStep(0);
    setScreen("quiz");
  };

  const answerCurrent = (value) => {
    if (!question) return;

    const nextResponses = {
      ...responses,
      [question.id]: value,
    };
    setResponses(nextResponses);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setScreen("result");
    }
  };

  const skipCurrent = () => answerCurrent(null);

  const results = React.useMemo(() => {
    const filtered = filterCandidatesByArea(candidates, area);
    return scoreAllCandidates(filtered, responses, questions);
  }, [candidates, area, responses, questions]);

  const resetAll = () => {
    setScreen("start");
    setStep(0);
    setArea("");
    setResponses({});
    setShowExplain(showExplanationsByDefault);
  };

  return (
    <div style={s.root}>
      <h2 style={s.title}>{title}</h2>

      {screen === "start" && (
        <section style={s.card}>
          <label style={s.label}>Storkreds (påkrævet)</label>
          <input
            list="municipality-list"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Vælg storkreds"
            style={s.input}
          />
          <datalist id="municipality-list">
            {municipalityOptions.map((municipality) => (
              <option key={municipality} value={municipality} />
            ))}
          </datalist>
          {!isAreaValid && area.trim() !== "" && (
            <div style={s.error}>
              Vælg en storkreds fra listen for at starte testen.
            </div>
          )}
          <label style={s.checkRow}>
            <input
              type="checkbox"
              checked={showExplain}
              onChange={(e) => setShowExplain(e.target.checked)}
            />
            Vis forklaringer til udsagn
          </label>
          <div style={s.row}>
            {isAreaValid && (
              <button style={s.primary} onClick={startQuiz}>
                Start test
              </button>
            )}
            <button style={s.secondary} onClick={resetAll}>
              Nulstil
            </button>
          </div>
        </section>
      )}

      {screen === "quiz" && question && (
        <section style={s.card}>
          <div style={s.meta}>
            Udsagn {step + 1} / {questions.length} · {question.topic}
          </div>
          <h3 style={s.statement}>{question.text}</h3>
          {showExplain && !!question.explain && (
            <p style={s.explain}>{question.explain}</p>
          )}


          <div style={s.grid}>
            {[
              { label: "Helt uenig", value: -2 },
              { label: "Delvist uenig", value: -1 },
              { label: "Neutral", value: 0 },
              { label: "Delvist enig", value: 1 },
              { label: "Helt enig", value: 2 },
            ].map((item) => (
              <button
                key={item.value}
                style={s.answer}
                onClick={() => answerCurrent(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={s.quizActions}>
            <button
              style={s.secondary}
              onClick={() => setStep(Math.max(0, step - 1))}
            >
              Tilbage
            </button>
            <button
              style={{ ...s.secondary, marginLeft: "auto" }}
              onClick={skipCurrent}
            >
              Spring over
            </button>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section style={{ ...s.card, ...s.resultCard }}>
          <div style={s.meta}>
            Match-resultater ({results.length} kandidater)
          </div>
          <div style={s.results}>
            {results.slice(0, 12).map((row) => (
              <div
                key={row.candidate.id || row.candidate.name}
                style={s.resultItem}
              >
                <strong>
                  {row.candidate.name} ({row.candidate.party || "Uafh"})
                </strong>
                <div style={s.meta}>
                  {row.pct}% match · {row.compared} sammenlignede udsagn ·{" "}
                  {row.candidate.area}
                </div>
              </div>
            ))}
          </div>
          <div style={s.row}>
            <button
              style={s.primary}
              onClick={() => {
                setStep(0);
                setScreen("quiz");
              }}
            >
              Tag testen igen
            </button>
            <button style={s.secondary} onClick={resetAll}>
              Til start
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function parseCandidates(csvText, questions) {
  const rows = parseCsv(csvText);
  return rows.map((row) => {
    const answers = {};
    for (const q of questions) {
      const n = Number(row[q.id]);
      answers[q.id] = Number.isFinite(n) ? n : null;
    }

    return {
      id: row.id || "",
      name: row.name || "Ukendt kandidat",
      party: row.party || "",
      area: row.area || "",
      answers,
    };
  });
}

function parseCsv(text) {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx] !== undefined ? cells[idx] : "";
    });
    return row;
  });
}

function splitCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      cells.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  cells.push(cur);
  return cells.map((x) => x.trim());
}
function filterCandidatesByArea(candidates, area) {
  const normalized = (area || "").trim().toLowerCase();
  if (!normalized) return candidates;
  return candidates.filter(
    (c) => (c.area || "").trim().toLowerCase() === normalized,
  );
}

function scoreAllCandidates(candidates, responses, questions) {
  return candidates
    .map((candidate) => {
      const comparable = [];
      for (const q of questions) {
        const userValue = responses[q.id];
        if (userValue === null || userValue === undefined) continue;
        const candidateValue = candidate.answers[q.id];
        if (candidateValue === null || candidateValue === undefined) continue;

        comparable.push({
          userValue: Number(userValue),
          candidateValue: Number(candidateValue),
        });
      }

      const similarity = cosineSimilarity(comparable);
      return {
        candidate,
        compared: comparable.length,
        pct: Math.round(50 * (Math.max(-1, Math.min(1, similarity)) + 1)),
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

function cosineSimilarity(rows) {
  if (!rows.length) return 0;

  let numerator = 0;
  let userNormSq = 0;
  let candidateNormSq = 0;

  for (const row of rows) {
    numerator += row.userValue * row.candidateValue;
    userNormSq += row.userValue * row.userValue;
    candidateNormSq += row.candidateValue * row.candidateValue;
  }

  const denominator = Math.sqrt(userNormSq) * Math.sqrt(candidateNormSq);
  return denominator ? numerator / denominator : 0;
}


const s = {
  root: {
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#111",
    background: "#f2d200",
    minHeight: "100%",
    padding: 16,
    width: "100%",
    maxWidth: 560,
  },
  title: { marginTop: 0 },
  card: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    display: "grid",
    gap: 12,
    width: "100%",
  },
  resultCard: {},
  label: { fontSize: 14, color: "#555" },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" },
  checkRow: { display: "flex", gap: 8, alignItems: "center", fontSize: 14 },
  row: { display: "flex", gap: 8, flexWrap: "wrap" },
  primary: {
    background: "#111",
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
  },
  error: { color: "#9f1d1d", fontSize: 13 },
  secondary: {
    background: "#f3f3f3",
    color: "#111",
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
  },
  meta: { color: "#666", fontSize: 14 },
  statement: { margin: 0 },
  explain: {
    margin: 0,
    background: "#fff7bf",
    border: "1px solid #f1e07a",
    borderRadius: 10,
    padding: 10,
  },
  grid: {
    display: "grid",
    gap: 8,
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  },
  quizActions: { display: "flex", gap: 8, marginTop: 18 },
  answer: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: "10px 12px",
    background: "white",
    cursor: "pointer",
  },
  results: { display: "grid", gap: 8 },
  resultItem: { border: "1px solid #e7e7e7", borderRadius: 12, padding: 12 },
};

KandidattestFramerCosineSimilarity.defaultProps = {
  title: "Kandidattest",
  supabaseUrl: "",
  supabaseAnonKey: "",
  csvData: DEFAULT_CSV,
  showExplanationsByDefault: false,
};

addPropertyControls(KandidattestFramerCosineSimilarity, {
  title: { type: ControlType.String, title: "Titel" },
  supabaseUrl: {
    type: ControlType.String,
    title: "Supabase URL",
    description: "Project URL from Supabase dashboard",
  },
  supabaseAnonKey: {
    type: ControlType.String,
    title: "Supabase Anon Key",
    description: "Public anon key",
  },
  showExplanationsByDefault: {
    type: ControlType.Boolean,
    title: "Vis forklaring",
    enabledTitle: "Ja",
    disabledTitle: "Nej",
  },
  csvData: {
    type: ControlType.String,
    title: "CSV (fallback)",
    displayTextArea: true,
  },
});



