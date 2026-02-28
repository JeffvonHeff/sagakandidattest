(function () {
  "use strict";

  const data = window.QUIZ_DATA;
  if (!data || !Array.isArray(data.questions) || !Array.isArray(data.candidates)) {
    throw new Error("QUIZ_DATA mangler eller er ugyldigt. Tjek questions.js");
  }

  const els = {
    start: document.getElementById("screen-start"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),

    areaInput: document.getElementById("areaInput"),
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

    weightSelect: document.getElementById("weightSelect"),
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

    els.qExplain.textContent = q.explain || "";
    els.explainBox.classList.toggle("hidden", !(state.showExplain && q.explain));

    els.weightSelect.value = String(clampInt(r.weight, 1, 3));

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

  // Scoring: for hvert spørgsmål med bruger svar og kandidat svar beregnes afstand.
  // Maks afstand pr spørgsmål er 4 (fra -2 til 2).
  // Match pr spørgsmål = 1 - (absDiff / 4)
  // Vægtning multiplicerer bidraget.
  function scoreCandidate(candidate) {
    let totalWeight = 0;
    let totalScore = 0;
    let compared = 0;

    for (const q of data.questions) {
      const user = state.responses[q.id];
      if (!user || user.value === null) continue;

      const candVal = candidate.answers ? candidate.answers[q.id] : null;
      if (candVal === null || candVal === undefined) continue;

      const w = clampInt(user.weight, 1, 3);
      const diff = Math.abs(Number(user.value) - Number(candVal));
      const match = 1 - (diff / 4);

      totalWeight += w;
      totalScore += match * w;
      compared += 1;
    }

    const pct = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    return { pct, compared };
  }

  function scoreAllCandidates(candidates) {
    return candidates
      .map(c => {
        const s = scoreCandidate(c);
        return {
          candidate: c,
          pct: s.pct,
          compared: s.compared
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

    div.appendChild(top);
    div.appendChild(meta);
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
    state.area = els.areaInput.value.trim();
    state.showExplain = els.toggleExplain.checked;
    save();
    renderQuiz();
  }

  function answerCurrent(value) {
    const q = currentQuestion();
    if (!q) return;

    const r = ensureResponse(q);
    r.value = Number(value);
    r.weight = clampInt(els.weightSelect.value, 1, 3);
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
    r.weight = clampInt(els.weightSelect.value, 1, 3);
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
  }

  load();
  bind();

  if (!tryLoadShare()) {
    renderStart();
  }
})();