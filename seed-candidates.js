require("dotenv").config();

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Mangler SUPABASE_URL og/eller SUPABASE_SERVICE_ROLE_KEY i .env");
  process.exit(1);
}

const HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: "Bearer " + SERVICE_KEY,
  "Content-Type": "application/json",
};

function parseCsv(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const header = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    header.forEach((h, i) => (row[h.trim()] = (cols[i] || "").trim()));
    return row;
  });
}

function parseCsvLine(line) {
  const cols = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cols.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}

const { normalizeStorkreds } = require("./kandidattest/storkredse.js");

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, "data", "candidates.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("CSV-fil ikke fundet:", csvPath);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  console.log("Parsed " + rows.length + " kandidater fra CSV");

  const BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);

    const candidates = batch.map((r) => ({
      name: r["Navn"] || "",
      party: r["Parti"] || "",
      area: normalizeStorkreds(r["Storkreds"]),
    }));

    const candRes = await fetch(SUPABASE_URL + "/rest/v1/candidates", {
      method: "POST",
      headers: {
        ...HEADERS,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(candidates),
    });

    if (!candRes.ok) {
      const body = await candRes.text();
      console.error("Kandidat-fejl batch " + i + ":", candRes.status, body);
      console.error("Fejlende rækker:", JSON.stringify(candidates, null, 2));
      process.exit(1);
    }

    const saved = await candRes.json();

    const tokens = saved.map((c, j) => ({
      candidate_id: c.id,
      token: batch[j]["Token"] || "",
      email: batch[j]["Email"] || "",
      used_at: batch[j]["Used"] ? new Date().toISOString() : null,
    }));

    const tokRes = await fetch(SUPABASE_URL + "/rest/v1/candidate_tokens", {
      method: "POST",
      headers: {
        ...HEADERS,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(tokens),
    });

    if (!tokRes.ok) {
      const body = await tokRes.text();
      console.error("Token-fejl batch " + i + ":", tokRes.status, body);
      process.exit(1);
    }

    inserted += batch.length;
    console.log("  " + inserted + " / " + rows.length);
  }

  console.log("Færdig! " + inserted + " kandidater + tokens seeded.");
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
