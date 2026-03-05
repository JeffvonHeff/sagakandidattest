(function () {
  "use strict";

  var config = window.__SUPABASE_CONFIG;
  if (!config || !config.url || !config.key) {
    document.getElementById("app").innerHTML =
      '<div class="card"><p class="muted">Konfiguration mangler. Start serveren med <code>npm start</code>.</p></div>';
    return;
  }

  var API = config.url + "/rest/v1";
  var HEADERS = {
    apikey: config.key,
    Authorization: "Bearer " + config.key,
    "Content-Type": "application/json",
  };

  var STORKREDSE = (window.STORKREDS_DATA || {}).STORKREDSE || [];

  var candidate = null;
  var currentToken = "";
  var answers = {};
  var questions = [];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ── Token screen ─────────────────────────────────────── */

  function renderTokenScreen(error) {
    var html =
      '<section class="card">' +
      "<h2>Indtast dit token</h2>" +
      '<p class="muted">Du har modtaget et unikt token pr. e-mail. Indtast det herunder for at besvare kandidattesten.</p>' +
      '<div style="display:flex;gap:8px;align-items:start;margin-top:12px">' +
      '<input id="tokenInput" type="text" placeholder="F.eks. F26EOF" style="flex:1;text-transform:uppercase" autocomplete="off" />' +
      '<button type="button" id="btnVerify" class="btn primary">Bekræft</button>' +
      "</div>";

    if (error) {
      html += '<div class="status err" style="margin-top:12px">' + escapeHtml(error) + "</div>";
    }

    html += "</section>";
    document.getElementById("app").innerHTML = html;

    document.getElementById("btnVerify").addEventListener("click", verifyToken);
    document.getElementById("tokenInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") verifyToken();
    });
    document.getElementById("tokenInput").focus();
  }

  async function verifyToken() {
    var input = document.getElementById("tokenInput");
    var token = input.value.trim().toUpperCase();
    if (!token) return;

    var btn = document.getElementById("btnVerify");
    btn.disabled = true;
    btn.textContent = "Tjekker\u2026";

    try {
      var res = await fetch(API + "/rpc/verify_candidate_token", {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ p_token: token }),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      var data = await res.json();

      if (data.error === "invalid_token") {
        renderTokenScreen("Ugyldigt token. Tjek at du har indtastet det korrekt.");
        return;
      }

      candidate = data;
      currentToken = token;

      await loadQuestions();

      if (candidate.already_submitted) {
        await loadExistingAnswers(candidate.id);
      }

      renderForm();
    } catch (err) {
      console.error(err);
      renderTokenScreen("Noget gik galt: " + err.message);
    }
  }

  /* ── Data loading ─────────────────────────────────────── */

  async function loadQuestions() {
    var res = await fetch(API + "/questions?order=sort_order", { headers: HEADERS });
    if (!res.ok) throw new Error("HTTP " + res.status);
    questions = await res.json();
  }

  async function loadExistingAnswers(candidateId) {
    var res = await fetch(
      API + "/candidate_answers?candidate_id=eq." + candidateId,
      { headers: HEADERS }
    );
    if (!res.ok) return;
    var rows = await res.json();
    rows.forEach(function (r) {
      answers[r.question_id] = { value: r.value, stance: r.stance || "" };
    });
  }

  /* ── Questionnaire form ───────────────────────────────── */

  function renderForm() {
    var app = document.getElementById("app");

    if (!questions.length) {
      app.innerHTML =
        '<div class="card"><p class="muted">Ingen spørgsmål i databasen endnu. ' +
        "Kør <code>npm run seed</code> først.</p></div>";
      return;
    }

    var html = '<form id="politikerForm">';

    if (candidate.already_submitted) {
      html +=
        '<div class="status info">Du har allerede indsendt svar. Du kan opdatere dem herunder.</div>';
    }

    html += '<section class="card"><h2>Dine oplysninger</h2><div class="grid">';
    html += profileField("Navn", "pName", candidate.name);
    html += profileField("Parti", "pParty", candidate.party);
    html += areaField(candidate.area);
    html += "</div></section>";

    html +=
      '<section class="card"><h2>Udsagn</h2>' +
      '<p class="muted">Angiv din holdning fra Helt uenig til Helt enig. ' +
      "Du kan tilføje en valgfri begrundelse.</p>";

    var opts = [
      { label: "Helt uenig", value: -2 },
      { label: "Delvist uenig", value: -1 },
      { label: "Neutral", value: 0 },
      { label: "Delvist enig", value: 1 },
      { label: "Helt enig", value: 2 },
    ];

    questions.forEach(function (q, i) {
      var existing = answers[q.id];

      html +=
        '<div class="q-block">' +
        '<div class="row space"><strong>' +
        (i + 1) + ". " + escapeHtml(q.text) +
        "</strong>" +
        '<span class="muted small">' + escapeHtml(q.topic) + "</span></div>";

      if (q.explain) {
        html += '<p class="muted small" style="margin:4px 0 0">' + escapeHtml(q.explain) + "</p>";
      }

      html += '<div class="answers" style="margin-top:8px">';
      opts.forEach(function (o) {
        var sel = existing && existing.value === o.value ? " selected" : "";
        html +=
          '<button type="button" class="btn ans' + sel + '" data-qid="' +
          q.id + '" data-value="' + o.value + '">' + o.label + "</button>";
      });
      html += "</div>";

      html +=
        '<div style="margin-top:8px">' +
        '<textarea id="stance-' + q.id +
        '" placeholder="Begrundelse (valgfrit)" rows="1">' +
        escapeHtml(existing ? existing.stance : "") +
        "</textarea></div></div>";

      if (existing) {
        answers[q.id] = existing;
      }
    });

    html += "</section>";

    html +=
      '<section class="card">' +
      '<label class="consent-label">' +
      '<input type="checkbox" id="acceptPhoto" checked />' +
      '<span>Jeg accepterer, at I bruger billedet fra mit partis officielle hjemmeside til denne test</span>' +
      "</label></section>";

    html +=
      '<div style="margin:18px 0">' +
      '<button type="submit" id="btnSubmit" class="btn primary" style="width:100%;padding:14px">' +
      "Indsend svar</button></div>" +
      '<div id="status"></div></form>';

    app.innerHTML = html;
    bindFormEvents();
  }

  function profileField(label, id, value) {
    var readonly = value ? " readonly" : "";
    return (
      '<label class="field profile-field"><span>' + escapeHtml(label) + "</span>" +
      '<input id="' + id + '" type="text" value="' + escapeHtml(value || "") + '"' +
      readonly + " /></label>"
    );
  }

  function areaField(value) {
    if (value) {
      return (
        '<label class="field profile-field"><span>Storkreds</span>' +
        '<input id="pArea" type="text" value="' + escapeHtml(value) + '" readonly /></label>'
      );
    }
    return (
      '<label class="field profile-field"><span>Storkreds</span>' +
      '<input id="pArea" type="text" list="storkedsList" placeholder="Vælg storkreds" />' +
      '<datalist id="storkedsList">' +
      STORKREDSE.map(function (s) { return '<option value="' + s + '">'; }).join("") +
      "</datalist></label>"
    );
  }

  function selectAnswer(qid, value) {
    if (!answers[qid]) answers[qid] = { value: value, stance: "" };
    else answers[qid].value = value;

    document.querySelectorAll('[data-qid="' + qid + '"]').forEach(function (btn) {
      btn.classList.toggle("selected", Number(btn.dataset.value) === value);
    });
  }

  function bindFormEvents() {
    document.querySelectorAll(".btn.ans[data-qid]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectAnswer(btn.dataset.qid, Number(btn.dataset.value));
      });
    });

    document.getElementById("politikerForm").addEventListener("submit", function (e) {
      e.preventDefault();
      submitForm();
    });
  }

  function setSubmitting(busy) {
    var btn = document.getElementById("btnSubmit");
    if (btn) {
      btn.disabled = busy;
      btn.textContent = busy ? "Gemmer\u2026" : "Indsend svar";
    }
  }

  /* ── Submit ───────────────────────────────────────────── */

  async function submitForm() {
    var statusEl = document.getElementById("status");
    var name = document.getElementById("pName").value.trim();
    var party = document.getElementById("pParty").value.trim();
    var area = document.getElementById("pArea").value.trim();
    var photoConsent = document.getElementById("acceptPhoto").checked;

    if (!name || !party) {
      statusEl.innerHTML = '<div class="status err">Udfyld venligst alle påkrævede felter.</div>';
      return;
    }

    var unanswered = questions.filter(function (q) {
      return !answers[q.id] || answers[q.id].value === undefined;
    });
    if (unanswered.length) {
      statusEl.innerHTML =
        '<div class="status err">Du mangler at besvare ' + unanswered.length + " udsagn.</div>";
      return;
    }

    setSubmitting(true);
    statusEl.innerHTML = '<div class="status">Gemmer&hellip;</div>';

    try {
      var profRes = await fetch(API + "/rpc/update_candidate_profile", {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          p_token: currentToken,
          p_name: name,
          p_party: party,
          p_area: area,
          p_photo_consent: photoConsent,
        }),
      });
      if (!profRes.ok) throw new Error("Profil-fejl: " + (await profRes.text()));

      // Collect stance texts from textareas
      questions.forEach(function (q) {
        var ta = document.getElementById("stance-" + q.id);
        if (ta && answers[q.id]) {
          answers[q.id].stance = ta.value || "";
        }
      });

      var answerRows = questions.map(function (q) {
        return {
          candidate_id: candidate.id,
          question_id: q.id,
          value: answers[q.id].value,
          stance: answers[q.id].stance || "",
        };
      });

      var ansRes = await fetch(API + "/candidate_answers", {
        method: "POST",
        headers: Object.assign({}, HEADERS, {
          Prefer: "resolution=merge-duplicates",
        }),
        body: JSON.stringify(answerRows),
      });

      if (!ansRes.ok) throw new Error("Svar-fejl: " + (await ansRes.text()));

      await fetch(API + "/rpc/mark_token_used", {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ p_token: currentToken }),
      });

      statusEl.innerHTML =
        '<div class="status ok"><strong>Tak!</strong> Dine svar er gemt. ' +
        "Du kan lukke denne side eller opdatere dine svar.</div>";
      setSubmitting(false);
      candidate.already_submitted = true;
    } catch (err) {
      console.error(err);
      statusEl.innerHTML =
        '<div class="status err">Noget gik galt: ' + escapeHtml(err.message) + "</div>";
      setSubmitting(false);
    }
  }

  /* ── Init ─────────────────────────────────────────────── */

  renderTokenScreen();
})();
