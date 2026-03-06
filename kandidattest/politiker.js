(function () {
  "use strict";

  var config = window.__SUPABASE_CONFIG;
  if (!config || !config.url || !config.key) {
    document.getElementById("app").innerHTML =
      '<div class="bg-white border border-black/20 rounded shadow-lg px-8 py-12 flex flex-col"><p class="text-muted">Konfiguration mangler. Start serveren med <code>npm start</code>.</p></div>';
    return;
  }

  var API = config.url + "/rest/v1";
  var HEADERS = {
    apikey: config.key,
    Authorization: "Bearer " + config.key,
    "Content-Type": "application/json",
  };

  var MUNICIPALITIES = [
    "Albertslund",
    "Allerød",
    "Assens",
    "Ballerup",
    "Billund",
    "Bornholm",
    "Brøndby",
    "Brønderslev",
    "Dragør",
    "Egedal",
    "Esbjerg",
    "Fanø",
    "Favrskov",
    "Faxe",
    "Fredensborg",
    "Fredericia",
    "Frederiksberg",
    "Frederikshavn",
    "Frederikssund",
    "Furesø",
    "Faaborg-Midtfyn",
    "Gentofte",
    "Gladsaxe",
    "Glostrup",
    "Greve",
    "Gribskov",
    "Guldborgsund",
    "Haderslev",
    "Halsnæs",
    "Hedensted",
    "Helsingør",
    "Herlev",
    "Herning",
    "Hillerød",
    "Hjørring",
    "Holbæk",
    "Holstebro",
    "Horsens",
    "Hvidovre",
    "Høje-Taastrup",
    "Hørsholm",
    "Ikast-Brande",
    "Ishøj",
    "Jammerbugt",
    "Kalundborg",
    "Kerteminde",
    "Kolding",
    "København",
    "Køge",
    "Langeland",
    "Lejre",
    "Lemvig",
    "Lolland",
    "Lyngby-Taarbæk",
    "Læsø",
    "Mariagerfjord",
    "Middelfart",
    "Morsø",
    "Norddjurs",
    "Nordfyns",
    "Nyborg",
    "Næstved",
    "Odder",
    "Odense",
    "Odsherred",
    "Randers",
    "Rebild",
    "Ringkøbing-Skjern",
    "Ringsted",
    "Roskilde",
    "Rudersdal",
    "Rødovre",
    "Samsø",
    "Silkeborg",
    "Skanderborg",
    "Skive",
    "Slagelse",
    "Solrød",
    "Sorø",
    "Stevns",
    "Struer",
    "Svendborg",
    "Syddjurs",
    "Sønderborg",
    "Thisted",
    "Tårnby",
    "Tønder",
    "Vallensbæk",
    "Varde",
    "Vejen",
    "Vejle",
    "Vesthimmerlands",
    "Viborg",
    "Vordingborg",
    "Ærø",
    "Aabenraa",
    "Aalborg",
    "Aarhus",
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
        '<div class="bg-surface border border-border rounded-2xl p-5 my-4 shadow-lg"><p class="text-muted">Ingen spørgsmål i databasen endnu. ' +
        "Kør <code>npm run seed</code> først.</p></div>";
      return;
    }

    var html = '<form id="politikerForm">';

    html +=
      '<section class="bg-surface border border-border rounded-2xl p-5 my-4 shadow-lg">' +
      "<h2>Dine oplysninger</h2>" +
      '<div class="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 my-4">' +
      '<label class="block"><span class="block mb-2 text-muted text-sm">Fulde navn *</span>' +
      '<input id="pName" type="text" required placeholder="Fornavn Efternavn" class="w-full p-3 rounded-2xl border border-border bg-white text-text outline-none focus:ring-[3px] focus:ring-accent/45" /></label>' +
      '<label class="block"><span class="block mb-2 text-muted text-sm">Parti *</span>' +
      '<input id="pParty" type="text" required placeholder="Partinavn" class="w-full p-3 rounded-2xl border border-border bg-white text-text outline-none focus:ring-[3px] focus:ring-accent/45" /></label>' +
      '<label class="block"><span class="block mb-2 text-muted text-sm">Kommune *</span>' +
      '<input id="pArea" type="text" list="munList" required placeholder="Vælg kommune" class="w-full p-3 rounded-2xl border border-border bg-white text-text outline-none focus:ring-[3px] focus:ring-accent/45" />' +
      '<datalist id="munList">' +
      MUNICIPALITIES.map(function (m) {
        return '<option value="' + m + '">';
      }).join("") +
      "</datalist></label>" +
      "</div></section>";

    html +=
      '<section class="bg-surface border border-border rounded-2xl p-5 my-4 shadow-lg"><h2>Udsagn</h2>' +
      '<p class="text-muted">Angiv din holdning fra Helt uenig til Helt enig. ' +
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
        '<div class="mt-4 pt-4 border-t border-border first:border-t-0 first:mt-0">' +
        '<div class="flex flex-wrap gap-3 items-center justify-between"><strong>' +
        (i + 1) +
        ". " +
        escapeHtml(q.text) +
        "</strong>" +
        '<span class="text-muted text-sm">' +
        escapeHtml(q.topic) +
        "</span></div>";

      if (q.explain) {
        html +=
          '<p class="text-muted text-sm mt-1">' +
          escapeHtml(q.explain) +
          "</p>";
      }

      html +=
        '<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5 mt-2">';
      opts.forEach(function (o) {
        html +=
          '<button type="button" class="bg-surface text-text border border-border shadow-md rounded-2xl py-2.5 px-3.5 cursor-pointer font-semibold transition hover:bg-accent/20 hover:border-black/30 btn-ans" data-qid="' +
          q.id +
          '" data-value="' +
          o.value +
          '">' +
          o.label +
          "</button>";
      });
      html += "</div>";

      html +=
        '<div class="mt-2">' +
        '<textarea id="stance-' +
        q.id +
        '" placeholder="Begrundelse (valgfrit)" rows="1" class="w-full py-2.5 px-3 rounded-2xl border border-border resize-y min-h-10 bg-white text-text outline-none focus:ring-[3px] focus:ring-accent/45"></textarea>' +
        "</div></div>";
    });

    html += "</section>";

    html +=
      '<div class="my-4">' +
      '<button type="submit" id="btnSubmit" class="w-full py-3.5 rounded-full cursor-pointer font-semibold border border-border bg-accent text-text border-black/20 hover:bg-[#ffd900] transition disabled:opacity-55 disabled:cursor-not-allowed">' +
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
        var selected = Number(btn.dataset.value) === value;
        btn.classList.toggle("bg-accent", selected);
        btn.classList.toggle("border-black/30", selected);
        btn.classList.toggle("bg-surface", !selected);
        btn.classList.toggle("border-border", !selected);
      });
  }

  function bindEvents() {
    document.querySelectorAll(".btn-ans[data-qid]").forEach(function (btn) {
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
        '<div class="p-3.5 rounded-2xl my-4 bg-red-100 text-red-800 border border-red-200">Udfyld venligst navn, parti og kommune.</div>';
      return;
    }

    var unanswered = questions.filter(function (q) {
      return answers[q.id] === undefined;
    });
    if (unanswered.length) {
      statusEl.innerHTML =
        '<div class="p-3.5 rounded-2xl my-4 bg-red-100 text-red-800 border border-red-200">Du mangler at besvare ' +
        unanswered.length +
        " udsagn.</div>";
      return;
    }

    setSubmitting(true);
    statusEl.innerHTML =
      '<div class="p-3.5 rounded-2xl my-4">Gemmer&hellip;</div>';

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
        '<div class="p-3.5 rounded-2xl my-4 bg-green-100 text-green-800 border border-green-200"><strong>Tak!</strong> Dine svar er gemt. ' +
        "Du kan lukke denne side.</div>";
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      statusEl.innerHTML =
        '<div class="p-3.5 rounded-2xl my-4 bg-red-100 text-red-800 border border-red-200">Noget gik galt: ' +
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
