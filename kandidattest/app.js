(function () {
  "use strict";

  const data = window.QUIZ_DATA;
  if (!data) {
    throw new Error("QUIZ_DATA mangler. Tjek questions.js");
  }
  if (!Array.isArray(data.questions)) data.questions = [];

  // --- Supabase REST helpers ---------------------------------------------------

  function supabaseHeaders() {
    var c = window.__SUPABASE_CONFIG;
    if (!c || !c.url || !c.key) return null;
    return {
      apikey: c.key,
      Authorization: "Bearer " + c.key,
      "Content-Type": "application/json",
    };
  }

  function supabaseUrl(table) {
    return window.__SUPABASE_CONFIG.url + "/rest/v1/" + table;
  }

  async function loadQuestionsFromSupabase() {
    var hdrs = supabaseHeaders();
    if (!hdrs) throw new Error("Ingen Supabase-config");
    var res = await fetch(supabaseUrl("questions?order=sort_order"), {
      headers: hdrs,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    var rows = await res.json();
    return rows.map(function (q) {
      return {
        id: q.id,
        topic: q.topic || "",
        text: q.text,
        explain: q.explain || "",
        defaultWeight: q.default_weight || 2,
      };
    });
  }

  async function loadCandidatesFromSupabase() {
    var hdrs = supabaseHeaders();
    if (!hdrs) throw new Error("Ingen Supabase-config");
    var res = await fetch(
      supabaseUrl("candidates?select=*,candidate_answers(question_id,value)"),
      { headers: hdrs },
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    var rows = await res.json();
    return rows.map(function (c) {
      var answers = {};
      (c.candidate_answers || []).forEach(function (a) {
        answers[a.question_id] = a.value;
      });
      return {
        id: c.id,
        name: c.name || "Ukendt",
        party: c.party || "",
        area: c.area || "",
        answers: answers,
      };
    });
  }

  async function saveUserAnswersToSupabase() {
    var hdrs = supabaseHeaders();
    if (!hdrs) throw new Error("Ingen Supabase-config");
    var sessionId = crypto.randomUUID();
    var rows = [];
    for (var i = 0; i < data.questions.length; i++) {
      var q = data.questions[i];
      var r = state.responses[q.id];
      if (!r || r.value === null) continue;
      rows.push({
        session_id: sessionId,
        question_id: q.id,
        value: r.value,
        importance_weight: clampInt(r.weight, 1, 3),
        area: state.area,
      });
    }
    if (!rows.length) return;
    var res = await fetch(supabaseUrl("user_answers"), {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  }

  const STORKREDS_DATA = window.STORKREDS_DATA || {};
  const MUNICIPALITIES = STORKREDS_DATA.KOMMUNER || [];
  const KOMMUNE_TO_STORKREDS = STORKREDS_DATA.KOMMUNE_TO_STORKREDS || {};

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
    btnRestartToStart: document.getElementById("btnRestartToStart"),
  };

  const MAX_SKIPS = 10;

  const state = {
    step: 0,
    municipality: "",
    area: "",
    showExplain: false,
    responses: {}, // { qid: { value: number|null, weight: number } }
    hasSavedSubmission: false,
    isSharedResultView: false,
  };

  function countSkips() {
    return Object.values(state.responses).filter(
      (r) => r && r.value === null,
    ).length;
  }

  const STORAGE_KEY = `kandidattest:${data.quizId}`;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;

      state.step = clampInt(saved.step, 0, data.questions.length);
      state.municipality =
        typeof saved.municipality === "string" ? saved.municipality : "";
      state.area = typeof saved.area === "string" ? saved.area : "";
      state.showExplain = !!saved.showExplain;
      state.responses =
        saved.responses && typeof saved.responses === "object"
          ? saved.responses
          : {};
      state.hasSavedSubmission = !!saved.hasSavedSubmission;
    } catch {
      // Ignorer corrupt storage
    }
  }

  function save() {
    const payload = {
      step: state.step,
      municipality: state.municipality,
      area: state.area,
      showExplain: state.showExplain,
      responses: state.responses,
      hasSavedSubmission: state.hasSavedSubmission,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    state.step = 0;
    state.municipality = "";
    state.area = "";
    state.showExplain = false;
    state.responses = {};
    state.hasSavedSubmission = false;
    state.isSharedResultView = false;
    renderStart();
  }

  function queueSubmissionSave() {
    if (
      state.hasSavedSubmission ||
      state.isSharedResultView ||
      state.step < data.questions.length
    )
      return;

    saveUserAnswersToSupabase()
      .then(() => {
        state.hasSavedSubmission = true;
        save();
      })
      .catch((err) => {
        console.error("Kunne ikke gemme testsvar:", err);
      });
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
      state.responses[q.id] = { value: null, weight: q.defaultWeight || 2 };
    }
    const r = state.responses[q.id];
    if (typeof r.weight !== "number") r.weight = 2;
    if (r.value !== null && typeof r.value !== "number") r.value = null;
    return r;
  }

  function renderStart() {
    showScreen("start");
    els.areaInput.value = state.municipality;
    els.toggleExplain.checked = state.showExplain;
    validateArea(false);
  }

  function normalizeMunicipalityName(s) {
    return (s || "").trim().toLocaleLowerCase("da-DK");
  }

  function findMunicipality(value) {
    const normalized = normalizeMunicipalityName(value);
    return (
      MUNICIPALITIES.find(
        (item) => normalizeMunicipalityName(item) === normalized,
      ) || ""
    );
  }

  function getStorkredsForMunicipality(municipality) {
    const storkreds = KOMMUNE_TO_STORKREDS[municipality];
    const normalize =
      typeof STORKREDS_DATA.normalizeStorkreds === "function"
        ? STORKREDS_DATA.normalizeStorkreds
        : (x) => (x || "").trim();
    return normalize(storkreds || "");
  }

  function isValidMunicipality(value) {
    return !!findMunicipality(value);
  }

  function selectedMunicipalityToStorkreds() {
    const municipality = findMunicipality(els.areaInput.value);
    if (!municipality) return "";
    return getStorkredsForMunicipality(municipality);
  }

  function hasValidMunicipalityWithStorkreds(value) {
    const municipality = findMunicipality(value);
    if (!municipality) return false;
    return !!getStorkredsForMunicipality(municipality);
  }

  function normalizeArea(s) {
    return (s || "").trim().toLowerCase();
  }

  function filterCandidatesByArea(candidates, area) {
    const a = normalizeArea(area);
    if (!a) return candidates;
    return candidates.filter((c) => normalizeArea(c.area).includes(a));
  }

  function validateArea(showError = true) {
    const isValid = hasValidMunicipalityWithStorkreds(els.areaInput.value);

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
    MUNICIPALITIES.forEach((name) => {
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

    els.qTitle.textContent = `Udsagn ${state.step + 1}`;
    els.qMeta.textContent = q.topic ? `Emne: ${q.topic}` : "";
    els.qText.textContent = q.text;
    els.qExplain.textContent = q.explain || "";
    els.explainBox.classList.toggle(
      "hidden",
      !(state.showExplain && q.explain),
    );

    const pct = Math.round((state.step / data.questions.length) * 100);
    els.barFill.style.width = `${pct}%`;
    els.barText.textContent = `${state.step} af ${data.questions.length}`;

    const skipsUsed = countSkips();
    els.btnSkip.disabled = skipsUsed >= MAX_SKIPS;
    els.btnSkip.textContent =
      skipsUsed >= MAX_SKIPS
        ? `Spring over (${MAX_SKIPS}/${MAX_SKIPS})`
        : `Spring over (${skipsUsed}/${MAX_SKIPS})`;

    // "Se resultat" should not appear as an option on the last question.
    els.btnFinish.classList.add("hidden");
  }

  function renderResult() {
    showScreen("result");
    queueSubmissionSave();
    const answered = Object.values(state.responses).filter(
      (x) => x && x.value !== null,
    ).length;

    els.resultMeta.textContent = `Du har svaret på ${answered} af ${data.questions.length} udsagn.`;

    const filteredCandidates = filterCandidatesByArea(
      data.candidates,
      state.area,
    );
    const results = scoreAllCandidates(filteredCandidates);

    els.resultList.innerHTML = "";
    results.slice(0, 4).forEach((row, idx) => {
      els.resultList.appendChild(renderResultItem(row, idx));
    });
  }

  // Scoring: Manhattan-distance som i KandidattestFramerManhattan.jsx
  // pct = round(((maxDistance - distance) / maxDistance) * 100), hvor
  // distance = sum(abs(user - candidate)) og maxDistance = antal * 4.
  function scoreCandidate(candidate) {
    const comparableAnswers = [];
    const topicTotals = {};

    for (const q of data.questions) {
      const user = state.responses[q.id];
      if (!user || user.value === null) continue;

      const candVal = candidate.answers ? candidate.answers[q.id] : null;
      if (candVal === null || candVal === undefined) continue;

      const topic = (q.topic || "Øvrigt").trim() || "Øvrigt";

      const comparable = {
        topic,
        userValue: Number(user.value),
        candidateValue: Number(candVal),
      };

      comparableAnswers.push(comparable);

      if (!topicTotals[topic]) topicTotals[topic] = [];
      topicTotals[topic].push(comparable);
    }

    const totalScore = manhattanScore(comparableAnswers);
    const compared = comparableAnswers.length;

    const topicScores = Object.entries(topicTotals)
      .map(([topic, values]) => ({
        topic,
        compared: values.length,
        pct: manhattanScore(values).pct,
      }))
      .sort((a, b) => {
        if (b.pct !== a.pct) return b.pct - a.pct;
        return a.topic.localeCompare(b.topic, "da");
      });

    return {
      pct: totalScore.pct,
      compared,
      distance: totalScore.distance,
      topicScores,
    };
  }

  function manhattanScore(rows) {
    const comparable = Array.isArray(rows) ? rows : [];
    const distance = comparable.reduce(
      (sum, row) => sum + Math.abs(row.userValue - row.candidateValue),
      0,
    );
    const maxDistance = comparable.length * 4;
    const pct = maxDistance
      ? Math.round(((maxDistance - distance) / maxDistance) * 100)
      : 0;
    return { distance, pct };
  }

  function scoreAllCandidates(candidates) {
    return candidates
      .map((c) => {
        const s = scoreCandidate(c);
        return {
          candidate: c,
          pct: s.pct,
          compared: s.compared,
          distance: s.distance,
          topicScores: s.topicScores,
        };
      })
      .sort((a, b) => b.pct - a.pct || a.distance - b.distance);
  }

  function renderResultItem(row, idx) {
    const div = document.createElement("div");
    div.className = "border border-border rounded-2xl p-3.5 bg-surface shadow-lg";

    const top = document.createElement("div");
    top.className = "flex items-baseline justify-between gap-2.5 flex-wrap";

    const name = document.createElement("div");
    name.innerHTML = `<strong>${escapeHtml(row.candidate.name)}</strong> <span class="text-muted">(${escapeHtml(row.candidate.party || "Uafh")})</span>`;

    const pill = document.createElement("div");
    pill.className = "border border-border rounded-full py-1.5 px-2.5 bg-accent/20 text-sm text-text";
    pill.textContent = `${row.pct}% match, ${row.compared} udsagn sammenlignet`;

    top.appendChild(name);
    top.appendChild(pill);

    const meta = document.createElement("div");
    meta.className = "text-muted text-sm";
    meta.textContent = row.candidate.area ? `Område: ${row.candidate.area}` : "";
    meta.className = "muted small";
    meta.textContent = row.candidate.area
      ? `Område: ${row.candidate.area}`
      : "";

    const details = document.createElement("details");
    details.className = "mt-3";
    const summary = document.createElement("summary");
    summary.textContent = "Se forskelle pr udsagn";
    details.appendChild(summary);

    const list = document.createElement("div");
    list.className = "text-muted text-sm mt-2.5";
    list.appendChild(buildDiffList(row.candidate));
    details.appendChild(list);

    const topicBox = document.createElement("div");
    topicBox.className = "mt-2.5";
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
    heading.className = "text-sm text-muted";
    heading.textContent = "Match fordelt på emner";
    wrap.appendChild(heading);

    if (!Array.isArray(topicScores) || !topicScores.length) {
      const none = document.createElement("div");
      none.className = "text-muted text-sm mt-1.5";
      none.textContent = "Ingen emner med sammenlignelige svar.";
      wrap.appendChild(none);
      return wrap;
    }

    const list = document.createElement("div");
    list.className = "flex flex-wrap gap-2 mt-2";

    topicScores.forEach((item) => {
      const chip = document.createElement("div");
      chip.className = "border border-border rounded-full py-1 px-2 bg-black/5 text-xs";
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
    return String(s).replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  }

  function startQuiz() {
    if (!validateArea(true)) {
      return;
    }

    state.municipality = findMunicipality(els.areaInput.value);
    state.area = getStorkredsForMunicipality(state.municipality);
    state.showExplain = els.toggleExplain.checked;
    save();
    renderQuiz();
  }

  function answerCurrent(value) {
    const q = currentQuestion();
    if (!q) return;

    const r = ensureResponse(q);
    r.value = Number(value);
    r.weight = clampInt(r.weight || q.defaultWeight || 2, 1, 3);
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
    const existing = state.responses[q.id];
    const alreadySkipped = existing && existing.value === null;
    if (!alreadySkipped && countSkips() >= MAX_SKIPS) return;

    const r = ensureResponse(q);
    r.value = null;
    r.weight = clampInt(r.weight || q.defaultWeight || 2, 1, 3);
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

  function goBack() {
    state.step = clampInt(state.step - 1, 0, data.questions.length - 1);
    save();
    renderQuiz();
  }

  function restart() {
    state.step = 0;
    state.hasSavedSubmission = false;
    state.isSharedResultView = false;
    save();
    renderQuiz();
  }

  function startOverToStart() {
    // Ryd alt der påvirker kommune/storkreds og svar
    state.step = 0;
    state.municipality = "";
    state.area = "";
    state.responses = {};
    state.hasSavedSubmission = false;
    state.isSharedResultView = false;

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
      r: compactResponses(state.responses),
    };
    const encoded = encodeURIComponent(
      btoa(unescape(encodeURIComponent(JSON.stringify(payload)))),
    );
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
      state.hasSavedSubmission = true;
      state.isSharedResultView = true;
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

    document.querySelectorAll(".ans").forEach((btn) => {
      btn.addEventListener("click", () => answerCurrent(btn.dataset.value));
    });

    els.btnSkip.addEventListener("click", skipCurrent);
    els.btnBack.addEventListener("click", goBack);
    els.btnFinish.addEventListener("click", renderResult);

    els.btnRestart.addEventListener("click", restart);
    els.btnShare.addEventListener("click", copyShareLink);

    if (els.btnStartOver)
      els.btnStartOver.addEventListener("click", startOverToStart);
    if (els.btnRestartToStart)
      els.btnRestartToStart.addEventListener("click", startOverToStart);

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

  }

  async function init() {
    // Load questions from Supabase; keep local fallback from questions.js
    try {
      var sbQuestions = await loadQuestionsFromSupabase();
      if (sbQuestions.length) data.questions = sbQuestions;
    } catch (err) {
      console.warn("Bruger lokale spørgsmål:", err.message);
    }

    try {
      data.candidates = await loadCandidatesFromSupabase();
    } catch (err) {
      console.warn("Kunne ikke hente kandidater:", err.message);
      data.candidates = [];
    }

    populateMunicipalityList();
    load();

    if (!isValidMunicipality(state.municipality)) {
      state.municipality = "";
    }

    if (!state.area && state.municipality) {
      state.area = getStorkredsForMunicipality(state.municipality);
    }

    if (!state.area) {
      state.area = "";
    }

    bind();

    if (!tryLoadShare()) {
      renderStart();
    }
  }

  init().catch((err) => {
    console.error(err);
    alert("Kunne ikke starte kandidattesten.");
  });
})();
