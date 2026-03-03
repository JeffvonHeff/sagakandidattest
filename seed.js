require("dotenv").config();

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Mangler SUPABASE_URL og/eller SUPABASE_ANON_KEY i .env");
  process.exit(1);
}

async function main() {
  const dataPath = process.argv[2] || path.join(__dirname, "seed-questions.json");

  if (!fs.existsSync(dataPath)) {
    console.error("Filen findes ikke:", dataPath);
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log("Seeder " + questions.length + " spørgsmål til Supabase...");

  const res = await fetch(SUPABASE_URL + "/rest/v1/questions", {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify(questions)
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Fejl fra Supabase (" + res.status + "):", body);
    process.exit(1);
  }

  console.log("Færdig! " + questions.length + " spørgsmål upserted.");
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
