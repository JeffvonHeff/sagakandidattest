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

  var MUNICIPALITIES = [
    "København",
    "Københavns Omegn",
    "Nordsjælland",
    "Bornholm",
    "Sjælland",
    "Fyn",
    "Sydjylland",
    "Østjylland",
    "Vestjylland",
    "Nordjylland",
  ];

  var answers = {};
  var questions = [];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch];
    });
  }

  function render() {
    var app = document.getElementById("app");

    if (!questions.length) {
      app.innerHTML =
        '<div class="card"><p class="muted">Ingen spørgsmål i databasen endnu. ' +
        "Kør <code>npm run seed</code> først.</p></div>";
      return;
    }

    var html = '<form id="politikerForm">';

    html +=
      '<section class="card">' +
      "<h2>Dine oplysninger</h2>" +
      '<div class="grid">' +
      '<label class="field"><span>Fulde navn *</span>' +
      '<input id="pName" type="text" required placeholder="Fornavn Efternavn" /></label>' +
      '<label class="field"><span>Parti *</span>' +
      '<input id="pParty" type="text" required placeholder="Partinavn" /></label>' +
      '<label class="field"><span>Storkreds *</span>' +
      '<input id="pArea" type="text" list="munList" required placeholder="Vælg storkreds" />' +
      '<datalist id="munList">' +
      MUNICIPALITIES.map(function (m) {
        return '<option value="' + m + '">';
      }).join("") +
      "</datalist></label>" +
      "</div></section>";

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
      html +=
        '<div class="q-block">' +
        '<div class="row space"><strong>' +
        (i + 1) +
        ". " +
        escapeHtml(q.text) +
        "</strong>" +
        '<span class="muted small">' +
        escapeHtml(q.topic) +
        "</span></div>";

      if (q.explain) {
        html +=
          '<p class="muted small" style="margin:4px 0 0">' +
          escapeHtml(q.explain) +
          "</p>";
      }

      html += '<div class="answers" style="margin-top:8px">';
      opts.forEach(function (o) {
        html +=
          '<button type="button" class="btn ans" data-qid="' +
          q.id +
          '" data-value="' +
          o.value +
          '">' +
          o.label +
          "</button>";
      });
      html += "</div>";

      html +=
        '<div style="margin-top:8px">' +
        '<textarea id="stance-' +
        q.id +
        '" placeholder="Begrundelse (valgfrit)" rows="1"></textarea>' +
        "</div></div>";
    });

    html += "</section>";

    html +=
      '<div style="margin:18px 0">' +
      '<button type="submit" id="btnSubmit" class="btn primary" style="width:100%;padding:14px">' +
      "Indsend svar</button></div>" +
      '<div id="status"></div></form>';

    app.innerHTML = html;
    bindEvents();
  }

  function selectAnswer(qid, value) {
    answers[qid] = value;
    document
      .querySelectorAll('[data-qid="' + qid + '"]')
      .forEach(function (btn) {
        btn.classList.toggle("selected", Number(btn.dataset.value) === value);
      });
  }

  function bindEvents() {
    document.querySelectorAll(".btn.ans[data-qid]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectAnswer(btn.dataset.qid, Number(btn.dataset.value));
      });
    });

    document
      .getElementById("politikerForm")
      .addEventListener("submit", function (e) {
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

  async function submitForm() {
    var name = document.getElementById("pName").value.trim();
    var party = document.getElementById("pParty").value.trim();
    var area = document.getElementById("pArea").value.trim();
    var statusEl = document.getElementById("status");

    if (!name || !party || !area) {
      statusEl.innerHTML =
        '<div class="status err">Udfyld venligst navn, parti og storkreds.</div>';
      return;
    }

    var unanswered = questions.filter(function (q) {
      return answers[q.id] === undefined;
    });
    if (unanswered.length) {
      statusEl.innerHTML =
        '<div class="status err">Du mangler at besvare ' +
        unanswered.length +
        " udsagn.</div>";
      return;
    }

    setSubmitting(true);
    statusEl.innerHTML = '<div class="status">Gemmer&hellip;</div>';

    try {
      var candRes = await fetch(API + "/candidates", {
        method: "POST",
        headers: Object.assign({}, HEADERS, {
          Prefer: "resolution=merge-duplicates,return=representation",
        }),
        body: JSON.stringify({ name: name, party: party, area: area }),
      });

      if (!candRes.ok) {
        throw new Error("Kandidat-fejl: " + (await candRes.text()));
      }

      var rows = await candRes.json();
      var candidateId = rows[0].id;

      var answerRows = questions.map(function (q) {
        return {
          candidate_id: candidateId,
          question_id: q.id,
          value: answers[q.id],
          stance: (document.getElementById("stance-" + q.id) || {}).value || "",
        };
      });

      var ansRes = await fetch(API + "/candidate_answers", {
        method: "POST",
        headers: Object.assign({}, HEADERS, {
          Prefer: "resolution=merge-duplicates",
        }),
        body: JSON.stringify(answerRows),
      });

      if (!ansRes.ok) {
        throw new Error("Svar-fejl: " + (await ansRes.text()));
      }

      statusEl.innerHTML =
        '<div class="status ok"><strong>Tak!</strong> Dine svar er gemt. ' +
        "Du kan lukke denne side.</div>";
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      statusEl.innerHTML =
        '<div class="status err">Noget gik galt: ' +
        escapeHtml(err.message) +
        "</div>";
      setSubmitting(false);
    }
  }

  async function init() {
    try {
      var res = await fetch(API + "/questions?order=sort_order", {
        headers: HEADERS,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      questions = await res.json();
    } catch (err) {
      console.error("Kunne ikke hente spørgsmål:", err);
    }
    render();
  }

  init();
})();
