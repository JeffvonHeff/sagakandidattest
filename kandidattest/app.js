(function () {
  "use strict";

  const data = window.QUIZ_DATA;
  if (!data || !Array.isArray(data.questions)) {
    throw new Error("QUIZ_DATA mangler eller er ugyldigt. Tjek questions.js");
  }

  const MUNICIPALITIES = [
    "Albertslund", "Allerød", "Assens", "Ballerup", "Billund", "Bornholm", "Brøndby", "Brønderslev", "Dragør", "Egedal", "Esbjerg", "Fanø", "Favrskov", "Faxe", "Fredensborg", "Fredericia", "Frederiksberg", "Frederikshavn", "Frederikssund", "Furesø", "Faaborg-Midtfyn", "Gentofte", "Gladsaxe", "Glostrup", "Greve", "Gribskov", "Guldborgsund", "Haderslev", "Halsnæs", "Hedensted", "Helsingør", "Herlev", "Herning", "Hillerød", "Hjørring", "Holbæk", "Holstebro", "Horsens", "Hvidovre", "Høje-Taastrup", "Hørsholm", "Ikast-Brande", "Ishøj", "Jammerbugt", "Kalundborg", "Kerteminde", "Kolding", "København", "Køge", "Langeland", "Lejre", "Lemvig", "Lolland", "Lyngby-Taarbæk", "Læsø", "Mariagerfjord", "Middelfart", "Morsø", "Norddjurs", "Nordfyns", "Nyborg", "Næstved", "Odder", "Odense", "Odsherred", "Randers", "Rebild", "Ringkøbing-Skjern", "Ringsted", "Roskilde", "Rudersdal", "Rødovre", "Samsø", "Silkeborg", "Skanderborg", "Skive", "Slagelse", "Solrød", "Sorø", "Stevns", "Struer", "Svendborg", "Syddjurs", "Sønderborg", "Thisted", "Tårnby", "Tønder", "Vallensbæk", "Varde", "Vejen", "Vejle", "Vesthimmerlands", "Viborg", "Vordingborg", "Ærø", "Aabenraa", "Aalborg", "Aarhus"
  ];

  const els = {
    start: document.getElementById("screen-start"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),

    areaInput: document.getElementById("areaInput"),
    areaError: document.getElementById("areaError"),
    municipalityList: document.getElementById("municipalityList"),
    toggleExplain: document.getElementById("toggleExplain"),
    btnStart: document.getElementById("btnStart"),
    btnReset: document.getElementById("btnReset"),

    qTitle: document.getElementById("qTitle"),
    qMeta: document.getElementById("qMeta"),
    qText: document.getElementById("qText"),
    qWeight: document.getElementById("qWeight"),
    qExplain: document.getElementById("qExplain"),
    explainBox: document.getElementById("explainBox"),

    barFill: document.getElementById("barFill"),
    barText: document.getElementById("barText"),

    btnSkip: document.getElementById("btnSkip"),
    btnBack: document.getElementById("btnBack"),
    btnFinish: document.getElementById("btnFinish"),

    resultMeta: document.getElementById("resultMeta"),
    resultList: document.getElementById("resultList"),
    btnRestart: document.getElementById("btnRestart"),
    btnShare: document.getElementById("btnShare"),

    btnStartOver: document.getElementById("btnStartOver"),
    btnRestartToStart: document.getElementById("btnRestartToStart")
  };

  const state = {
    step: 0,
    area: "",
    showExplain: false,
    responses: {},  // { qid: { value: number|null, weight: number } }
  };

  const STORAGE_KEY = `kandidattest:${data.quizId}`;

  async function loadCandidatesFromSpreadsheet() {
    const response = await fetch("./data/kandidat_svar.csv", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Kunne ikke hente spreadsheet: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);
    if (!rows.length) return [];

    return rows.map(row => {
      const candidate = {
        id: row.id || "",
        name: row.name || "Ukendt kandidat",
        party: row.party || "",
        area: row.area || "",
        answers: {}
      };

      for (const q of data.questions) {
        const raw = row[q.id];
        if (raw === undefined || raw === null || raw === "") {
          candidate.answers[q.id] = null;
          continue;
        }

        const n = Number(raw);
        candidate.answers[q.id] = Number.isFinite(n) ? n : null;
      }

      return candidate;
    });
  }

  function parseCsv(text) {
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (!lines.length) return [];

    const headers = splitCsvLine(lines[0]);
    const out = [];

    for (let i = 1; i < lines.length; i += 1) {
      const cells = splitCsvLine(lines[i]);
      const row = {};

      headers.forEach((h, idx) => {
        row[h] = cells[idx] !== undefined ? cells[idx] : "";
      });

      out.push(row);
    }

    return out;
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
    return cells.map(x => x.trim());
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;

      state.step = clampInt(saved.step, 0, data.questions.length);
      state.area = typeof saved.area === "string" ? saved.area : "";
      state.showExplain = !!saved.showExplain;
      state.responses = saved.responses && typeof saved.responses === "object" ? saved.responses : {};
    } catch {
      // Ignorer corrupt storage
    }
  }

  function save() {
    const payload = {
      step: state.step,
      area: state.area,
      showExplain: state.showExplain,
      responses: state.responses
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    state.step = 0;
    state.area = "";
    state.showExplain = false;
    state.responses = {};
    renderStart();
  }

  function clampInt(v, min, max) {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  function showScreen(name) {
    els.start.classList.toggle("hidden", name !== "start");
    els.quiz.classList.toggle("hidden", name !== "quiz");
    els.result.classList.toggle("hidden", name !== "result");
  }

  function currentQuestion() {
    return data.questions[state.step] || null;
  }

  function ensureResponse(q) {
    if (!state.responses[q.id]) {
      state.responses[q.id] = { value: null, weight: q.defaultWeight || 1 };
    }
    const r = state.responses[q.id];
    if (typeof r.weight !== "number") r.weight = 1;
    if (r.value !== null && typeof r.value !== "number") r.value = null;
    return r;
  }

  function renderStart() {
    showScreen("start");
    els.areaInput.value = state.area;
    els.toggleExplain.checked = state.showExplain;
    validateArea(false);
  }

  function normalizeMunicipalityName(s) {
    return (s || "").trim().toLocaleLowerCase("da-DK");
  }

  function isValidMunicipality(value) {
    const normalized = normalizeMunicipalityName(value);
    return MUNICIPALITIES.some(item => normalizeMunicipalityName(item) === normalized);
  }

  function validateArea(showError = true) {
    const isValid = isValidMunicipality(els.areaInput.value);

    els.btnStart.disabled = !isValid;
    if (!isValid && showError) {
      els.areaError.classList.remove("hidden");
    } else {
      els.areaError.classList.add("hidden");
    }

    return isValid;
  }

  function populateMunicipalityList() {
    els.municipalityList.innerHTML = "";
    MUNICIPALITIES.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      els.municipalityList.appendChild(option);
    });
  }

  function renderQuiz() {
    showScreen("quiz");

    const q = currentQuestion();
    if (!q) {
      renderResult();
      return;
    }

    const r = ensureResponse(q);

    els.qTitle.textContent = `Udsagn ${state.step + 1}`;
    els.qMeta.textContent = q.topic ? `Emne: ${q.topic}` : "";
    els.qText.textContent = q.text;
    els.qWeight.value = String(clampInt(r.weight, 1, 3));

    els.qExplain.textContent = q.explain || "";
    els.explainBox.classList.toggle("hidden", !(state.showExplain && q.explain));

    const pct = Math.round(((state.step) / data.questions.length) * 100);
    els.barFill.style.width = `${pct}%`;
    els.barText.textContent = `${state.step} af ${data.questions.length}`;

    els.btnFinish.classList.toggle("hidden", state.step !== data.questions.length - 1);
  }

  function renderResult() {
    showScreen("result");
    const answered = Object.values(state.responses).filter(x => x && x.value !== null).length;

    els.resultMeta.textContent = `Du har svaret på ${answered} af ${data.questions.length} udsagn.`;

    const filteredCandidates = filterCandidatesByArea(data.candidates, state.area);
    const results = scoreAllCandidates(filteredCandidates);

    els.resultList.innerHTML = "";
    results.slice(0, 12).forEach((row, idx) => {
      els.resultList.appendChild(renderResultItem(row, idx));
    });
  }

  function normalizeArea(s) {
    return (s || "").trim().toLowerCase();
  }

  function filterCandidatesByArea(candidates, area) {
    const a = normalizeArea(area);
    if (!a) return candidates;
    return candidates.filter(c => normalizeArea(c.area).includes(a));
  }

  // Scoring: vægtet cosine similarity på centrerede Likert-værdier.
  // 1) Svarskala er -2..2 omkring 0.
  // 2) Vi centrerer pr. person (trækker personens gennemsnit fra),
  //    så "altid enig/uenig" bias dæmpes.
  // 3) Vi bruger brugerens vægt (1..3) som wi i cosine-formlen.
  // 4) Similarity i [-1,1] mappes til procent: 50 * (sim + 1).
  function scoreCandidate(candidate) {
    const comparableAnswers = [];
    const topicTotals = {};

    for (const q of data.questions) {
      const user = state.responses[q.id];
      if (!user || user.value === null) continue;

      const candVal = candidate.answers ? candidate.answers[q.id] : null;
      if (candVal === null || candVal === undefined) continue;

      const w = clampInt(user.weight, 1, 3);
      const topic = (q.topic || "Øvrigt").trim() || "Øvrigt";

      const comparable = {
        topic,
        weight: w,
        userValue: Number(user.value),
        candidateValue: Number(candVal)
      };

      comparableAnswers.push(comparable);

      if (!topicTotals[topic]) topicTotals[topic] = [];
      topicTotals[topic].push(comparable);
    }

    const totalSim = weightedCenteredCosine(comparableAnswers);
    const compared = comparableAnswers.length;

    const topicScores = Object.entries(topicTotals)
      .map(([topic, values]) => ({
        topic,
        compared: values.length,
        pct: similarityToPercent(weightedCenteredCosine(values))
      }))
      .sort((a, b) => {
        if (b.pct !== a.pct) return b.pct - a.pct;
        return a.topic.localeCompare(b.topic, "da");
      });

    const pct = similarityToPercent(totalSim);
    return { pct, compared, topicScores };
  }

  function weightedCenteredCosine(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return 0;

    let userMeanSum = 0;
    let candMeanSum = 0;
    for (const row of rows) {
      userMeanSum += row.userValue;
      candMeanSum += row.candidateValue;
    }

    const userMean = userMeanSum / rows.length;
    const candMean = candMeanSum / rows.length;

    let numerator = 0;
    let userNormSq = 0;
    let candNormSq = 0;

    for (const row of rows) {
      const w = row.weight;
      const uPrime = row.userValue - userMean;
      const cPrime = row.candidateValue - candMean;
      numerator += w * uPrime * cPrime;
      userNormSq += w * uPrime * uPrime;
      candNormSq += w * cPrime * cPrime;
    }

    const denominator = Math.sqrt(userNormSq) * Math.sqrt(candNormSq);
    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  function similarityToPercent(similarity) {
    const bounded = Math.max(-1, Math.min(1, similarity));
    return Math.round(50 * (bounded + 1));
  }

  function scoreAllCandidates(candidates) {
    return candidates
      .map(c => {
        const s = scoreCandidate(c);
        return {
          candidate: c,
          pct: s.pct,
          compared: s.compared,
          topicScores: s.topicScores
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }

  function renderResultItem(row, idx) {
    const div = document.createElement("div");
    div.className = "result-item";

    const top = document.createElement("div");
    top.className = "result-top";

    const name = document.createElement("div");
    name.innerHTML = `<strong>${escapeHtml(row.candidate.name)}</strong> <span class="muted">(${escapeHtml(row.candidate.party || "Uafh")})</span>`;

    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = `${row.pct}% match, ${row.compared} udsagn sammenlignet`;

    top.appendChild(name);
    top.appendChild(pill);

    const meta = document.createElement("div");
    meta.className = "muted small";
    meta.textContent = row.candidate.area ? `Område: ${row.candidate.area}` : "";

    const details = document.createElement("details");
    details.className = "details";
    const summary = document.createElement("summary");
    summary.textContent = "Se forskelle pr udsagn";
    details.appendChild(summary);

    const list = document.createElement("div");
    list.className = "muted small";
    list.style.marginTop = "10px";
    list.appendChild(buildDiffList(row.candidate));
    details.appendChild(list);

    const topicBox = document.createElement("div");
    topicBox.className = "topic-scores";
    topicBox.appendChild(buildTopicScoreList(row.topicScores));

    div.appendChild(top);
    div.appendChild(meta);
    div.appendChild(topicBox);
    div.appendChild(details);

    if (idx === 0) div.style.outline = "2px solid rgba(255,255,255,.22)";
    return div;
  }

  function buildDiffList(candidate) {
    const wrap = document.createElement("div");

    for (const q of data.questions) {
      const user = state.responses[q.id];
      if (!user || user.value === null) continue;

      const candVal = candidate.answers ? candidate.answers[q.id] : null;
      if (candVal === null || candVal === undefined) continue;

      const line = document.createElement("div");
      const diff = Math.abs(Number(user.value) - Number(candVal));
      const label = `${q.text}  Du: ${formatScale(user.value)}  Kandidat: ${formatScale(candVal)}  Afvigelse: ${diff}`;
      line.textContent = label;
      line.style.padding = "6px 0";
      wrap.appendChild(line);
    }

    if (!wrap.childNodes.length) {
      const none = document.createElement("div");
      none.textContent = "Ingen sammenlignelige udsagn for denne kandidat.";
      wrap.appendChild(none);
    }
    return wrap;
  }

  function buildTopicScoreList(topicScores) {
    const wrap = document.createElement("div");

    const heading = document.createElement("div");
    heading.className = "small muted";
    heading.textContent = "Match fordelt på emner";
    wrap.appendChild(heading);

    if (!Array.isArray(topicScores) || !topicScores.length) {
      const none = document.createElement("div");
      none.className = "muted small";
      none.style.marginTop = "6px";
      none.textContent = "Ingen emner med sammenlignelige svar.";
      wrap.appendChild(none);
      return wrap;
    }

    const list = document.createElement("div");
    list.className = "topic-score-list";

    topicScores.forEach(item => {
      const chip = document.createElement("div");
      chip.className = "topic-score-chip";
      chip.textContent = `${item.topic}: ${item.pct}% (${item.compared})`;
      list.appendChild(chip);
    });

    wrap.appendChild(list);
    return wrap;
  }

  function formatScale(v) {
    const n = Number(v);
    if (n === 2) return "Helt enig";
    if (n === 1) return "Delvist enig";
    if (n === 0) return "Neutral";
    if (n === -1) return "Delvist uenig";
    if (n === -2) return "Helt uenig";
    return String(v);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function startQuiz() {
    if (!validateArea(true)) {
      return;
    }

    state.area = MUNICIPALITIES.find(
      item => normalizeMunicipalityName(item) === normalizeMunicipalityName(els.areaInput.value)
    ) || "";
    state.showExplain = els.toggleExplain.checked;
    save();
    renderQuiz();
  }

  function answerCurrent(value) {
    const q = currentQuestion();
    if (!q) return;

    const r = ensureResponse(q);
    r.value = Number(value);
    r.weight = clampInt(r.weight || q.defaultWeight || 1, 1, 3);
    state.responses[q.id] = r;

    if (state.step < data.questions.length - 1) {
      state.step += 1;
      save();
      renderQuiz();
    } else {
      state.step = data.questions.length;
      save();
      renderResult();
    }
  }

  function skipCurrent() {
    const q = currentQuestion();
    if (!q) return;

    const r = ensureResponse(q);
    r.value = null;
    r.weight = clampInt(r.weight || q.defaultWeight || 1, 1, 3);
    state.responses[q.id] = r;

    if (state.step < data.questions.length - 1) {
      state.step += 1;
      save();
      renderQuiz();
    } else {
      state.step = data.questions.length;
      save();
      renderResult();
    }
  }


  function updateCurrentWeight(value) {
    const q = currentQuestion();
    if (!q) return;

    const r = ensureResponse(q);
    r.weight = clampInt(value, 1, 3);
    state.responses[q.id] = r;
    save();
  }

  function goBack() {
    state.step = clampInt(state.step - 1, 0, data.questions.length - 1);
    save();
    renderQuiz();
  }

  function restart() {
    state.step = 0;
    save();
    renderQuiz();
  }

  function startOverToStart() {
  // Ryd alt der påvirker kommune og svar
  state.step = 0;
  state.area = "";
  state.responses = {};

  // Du kan vælge at beholde showExplain eller nulstille den
  // Jeg nulstiller den, så startskærmen er ren
  state.showExplain = false;

  // Ryd persisted state så du ikke arver gamle valg
  localStorage.removeItem(STORAGE_KEY);

  // Opdater UI
  renderStart();
}

  function copyShareLink() {
    const payload = {
      a: state.area,
      r: compactResponses(state.responses)
    };
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    const url = `${location.origin}${location.pathname}?share=${encoded}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  function compactResponses(responses) {
    const out = {};
    for (const q of data.questions) {
      const r = responses[q.id];
      if (!r) continue;
      if (r.value === null) continue;
      out[q.id] = [r.value, clampInt(r.weight, 1, 3)];
    }
    return out;
  }

  function tryLoadShare() {
    const params = new URLSearchParams(location.search);
    const share = params.get("share");
    if (!share) return false;

    try {
      const raw = decodeURIComponent(escape(atob(decodeURIComponent(share))));
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return false;

      state.area = typeof parsed.a === "string" ? parsed.a : "";
      state.responses = {};
      if (parsed.r && typeof parsed.r === "object") {
        for (const [qid, arr] of Object.entries(parsed.r)) {
          const v = Array.isArray(arr) ? Number(arr[0]) : null;
          const w = Array.isArray(arr) ? clampInt(arr[1], 1, 3) : 1;
          state.responses[qid] = { value: v, weight: w };
        }
      }
      state.step = data.questions.length;
      save();
      renderResult();
      return true;
    } catch {
      return false;
    }
  }

  function bind() {
    els.btnStart.addEventListener("click", startQuiz);
    els.btnReset.addEventListener("click", resetAll);

    document.querySelectorAll(".ans").forEach(btn => {
      btn.addEventListener("click", () => answerCurrent(btn.dataset.value));
    });

    els.btnSkip.addEventListener("click", skipCurrent);
    els.btnBack.addEventListener("click", goBack);
    els.btnFinish.addEventListener("click", renderResult);

    els.btnRestart.addEventListener("click", restart);
    els.btnShare.addEventListener("click", copyShareLink);

    if (els.btnStartOver) els.btnStartOver.addEventListener("click", startOverToStart);
    if (els.btnRestartToStart) els.btnRestartToStart.addEventListener("click", startOverToStart);

    els.toggleExplain.addEventListener("change", () => {
      state.showExplain = els.toggleExplain.checked;
      save();
    });

    els.areaInput.addEventListener("input", () => {
      validateArea(false);
    });

    els.areaInput.addEventListener("blur", () => {
      validateArea(true);
    });

    els.qWeight.addEventListener("change", () => {
      updateCurrentWeight(els.qWeight.value);
    });
  }

  async function init() {
    data.candidates = await loadCandidatesFromSpreadsheet();
    populateMunicipalityList();
    load();

    if (!isValidMunicipality(state.area)) {
      state.area = "";
    }

    bind();

    if (!tryLoadShare()) {
      renderStart();
    }
  }

  init().catch(err => {
    console.error(err);
    alert("Kunne ikke indlæse kandidatsvar fra spreadsheet.");
  });
})();
