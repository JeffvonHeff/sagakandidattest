import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const QUESTIONS = [
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
  { id: "q25", topic: "Demokrati", text: "Kommunen skal gøre det nemmere at forstå politiske beslutninger.", explain: "Klar og enkel kommunikation.", defaultWeight: 1 },
]

const DEFAULT_CSV = `id,name,party,area,q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12,q13,q14,q15,q16,q17,q18,q19,q20,q21,q22,q23,q24,q25
c1,Kandidat A,Parti X,København,2,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,2,0,1,1,2,1,2,2,2
c2,Kandidat B,Parti Y,København,0,1,0,-1,1,0,1,0,1,2,0,0,1,1,0,0,1,2,0,2,0,-1,1,1,1
c3,Kandidat C,Parti Z,Aarhus,-1,0,1,2,1,1,1,2,0,-1,2,2,1,0,1,2,1,-1,1,0,2,1,2,2,1`

export default function KandidattestFramer({ title, csvData, showExplanationsByDefault }) {
  const [screen, setScreen] = React.useState("start")
  const [step, setStep] = React.useState(0)
  const [area, setArea] = React.useState("")
  const [showExplain, setShowExplain] = React.useState(showExplanationsByDefault)
  const [responses, setResponses] = React.useState({})

  const candidates = React.useMemo(() => parseCandidates(csvData), [csvData])
  const question = QUESTIONS[step]

  const startQuiz = () => {
    setStep(0)
    setScreen("quiz")
  }

  const answerCurrent = (value) => {
    if (!question) return

    const response = responses[question.id] || { value: null, weight: question.defaultWeight || 1 }
    const nextResponses = {
      ...responses,
      [question.id]: { ...response, value },
    }
    setResponses(nextResponses)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setScreen("result")
    }
  }


  const skipCurrent = () => answerCurrent(null)

  const results = React.useMemo(() => {
    const filtered = filterCandidatesByArea(candidates, area)
    return scoreAllCandidates(filtered, responses)
  }, [candidates, area, responses])

  const resetAll = () => {
    setScreen("start")
    setStep(0)
    setArea("")
    setResponses({})
    setShowExplain(showExplanationsByDefault)
  }

  return (
    <div style={s.root}>
      <h2 style={s.title}>{title}</h2>

      {screen === "start" && (
        <section style={s.card}>
          <label style={s.label}>Område (valgfrit)</label>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="fx København" style={s.input} />
          <label style={s.checkRow}>
            <input type="checkbox" checked={showExplain} onChange={(e) => setShowExplain(e.target.checked)} />
            Vis forklaringer til udsagn
          </label>
          <div style={s.row}>
            <button style={s.primary} onClick={startQuiz}>Start test</button>
            <button style={s.secondary} onClick={resetAll}>Nulstil</button>
          </div>
        </section>
      )}

      {screen === "quiz" && question && (
        <section style={s.card}>
          <div style={s.meta}>Udsagn {step + 1} / {QUESTIONS.length} · {question.topic}</div>
          <h3 style={s.statement}>{question.text}</h3>
          {showExplain && !!question.explain && <p style={s.explain}>{question.explain}</p>}


          <div style={s.grid}>
            {[
              { label: "Helt uenig", value: -2 },
              { label: "Delvist uenig", value: -1 },
              { label: "Neutral", value: 0 },
              { label: "Delvist enig", value: 1 },
              { label: "Helt enig", value: 2 },
            ].map((item) => (
              <button key={item.value} style={s.answer} onClick={() => answerCurrent(item.value)}>{item.label}</button>
            ))}
          </div>

          <div style={s.row}>
            <button style={s.secondary} onClick={skipCurrent}>Spring over</button>
            <button style={s.secondary} onClick={() => setStep(Math.max(0, step - 1))}>Tilbage</button>
            <button style={s.secondary} onClick={() => setScreen("result")}>Se resultat</button>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section style={s.card}>
          <div style={s.meta}>Match-resultater ({results.length} kandidater)</div>
          <div style={s.results}>
            {results.slice(0, 12).map((row) => (
              <div key={row.candidate.id || row.candidate.name} style={s.resultItem}>
                <strong>{row.candidate.name} ({row.candidate.party || "Uafh"})</strong>
                <div style={s.meta}>{row.pct}% match · {row.compared} sammenlignede udsagn · {row.candidate.area}</div>
              </div>
            ))}
          </div>
          <div style={s.row}>
            <button style={s.primary} onClick={() => { setStep(0); setScreen("quiz") }}>Tag testen igen</button>
            <button style={s.secondary} onClick={resetAll}>Til start</button>
          </div>
        </section>
      )}
    </div>
  )
}

function parseCandidates(csvText) {
  const rows = parseCsv(csvText)
  return rows.map((row) => {
    const answers = {}
    for (const q of QUESTIONS) {
      const n = Number(row[q.id])
      answers[q.id] = Number.isFinite(n) ? n : null
    }

    return {
      id: row.id || "",
      name: row.name || "Ukendt kandidat",
      party: row.party || "",
      area: row.area || "",
      answers,
    }
  })
}

function parseCsv(text) {
  const lines = (text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return []

  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const row = {}
    headers.forEach((header, idx) => {
      row[header] = cells[idx] !== undefined ? cells[idx] : ""
    })
    return row
  })
}

function splitCsvLine(line) {
  const cells = []
  let cur = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      const next = line[i + 1]
      if (inQuotes && next === '"') {
        cur += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === "," && !inQuotes) {
      cells.push(cur)
      cur = ""
      continue
    }

    cur += ch
  }

  cells.push(cur)
  return cells.map((x) => x.trim())
}

function clampInt(v, min, max) {
  const n = Number(v)
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

function filterCandidatesByArea(candidates, area) {
  const normalized = (area || "").trim().toLowerCase()
  if (!normalized) return candidates
  return candidates.filter((c) => (c.area || "").toLowerCase().includes(normalized))
}

function scoreAllCandidates(candidates, responses) {
  return candidates
    .map((candidate) => {
      const comparable = []
      for (const q of QUESTIONS) {
        const user = responses[q.id]
        if (!user || user.value === null || user.value === undefined) continue
        const candidateValue = candidate.answers[q.id]
        if (candidateValue === null || candidateValue === undefined) continue

        comparable.push({
          weight: clampInt(user.weight || 1, 1, 3),
          userValue: Number(user.value),
          candidateValue: Number(candidateValue),
        })
      }

      const similarity = weightedCenteredCosine(comparable)
      return {
        candidate,
        compared: comparable.length,
        pct: Math.round(50 * (Math.max(-1, Math.min(1, similarity)) + 1)),
      }
    })
    .sort((a, b) => b.pct - a.pct)
}

function weightedCenteredCosine(rows) {
  if (!rows.length) return 0

  const userMean = rows.reduce((sum, row) => sum + row.userValue, 0) / rows.length
  const candidateMean = rows.reduce((sum, row) => sum + row.candidateValue, 0) / rows.length

  let numerator = 0
  let userNormSq = 0
  let candidateNormSq = 0

  for (const row of rows) {
    const user = row.userValue - userMean
    const candidate = row.candidateValue - candidateMean
    numerator += row.weight * user * candidate
    userNormSq += row.weight * user * user
    candidateNormSq += row.weight * candidate * candidate
  }

  const denominator = Math.sqrt(userNormSq) * Math.sqrt(candidateNormSq)
  return denominator ? numerator / denominator : 0
}

const s = {
  root: { fontFamily: "Inter, system-ui, sans-serif", color: "#111", background: "#f2d200", minHeight: "100%", padding: 16 },
  title: { marginTop: 0 },
  card: { background: "white", borderRadius: 16, padding: 16, display: "grid", gap: 12 },
  label: { fontSize: 14, color: "#555" },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" },
  checkRow: { display: "flex", gap: 8, alignItems: "center", fontSize: 14 },
  row: { display: "flex", gap: 8, flexWrap: "wrap" },
  primary: { background: "#111", color: "white", border: 0, borderRadius: 10, padding: "10px 12px", cursor: "pointer" },
  secondary: { background: "#f3f3f3", color: "#111", border: "1px solid #ddd", borderRadius: 10, padding: "10px 12px", cursor: "pointer" },
  meta: { color: "#666", fontSize: 14 },
  statement: { margin: 0 },
  explain: { margin: 0, background: "#fff7bf", border: "1px solid #f1e07a", borderRadius: 10, padding: 10 },
  grid: { display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" },
  answer: { border: "1px solid #ddd", borderRadius: 10, padding: "10px 12px", background: "white", cursor: "pointer" },
  results: { display: "grid", gap: 8 },
  resultItem: { border: "1px solid #e7e7e7", borderRadius: 12, padding: 12 },
}

KandidattestFramer.defaultProps = {
  title: "Kandidattest",
  csvData: DEFAULT_CSV,
  showExplanationsByDefault: false,
}

addPropertyControls(KandidattestFramer, {
  title: { type: ControlType.String, title: "Titel" },
  showExplanationsByDefault: { type: ControlType.Boolean, title: "Vis forklaring", enabledTitle: "Ja", disabledTitle: "Nej" },
  csvData: { type: ControlType.String, title: "CSV", displayTextArea: true },
})
