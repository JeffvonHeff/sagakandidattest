const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.join(__dirname, "kandidattest");
const DATA_DIR = path.join(ROOT_DIR, "data");
const SUBMISSION_CSV = path.join(DATA_DIR, "test_besvarelser.csv");

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

async function appendSubmission(submission) {
  await fsp.mkdir(DATA_DIR, { recursive: true });

  const keys = Object.keys(submission);
  const header = keys.map(csvEscape).join(",") + "\n";
  const row = keys.map(k => csvEscape(submission[k])).join(",") + "\n";

  const fileExists = fs.existsSync(SUBMISSION_CSV);
  if (!fileExists) {
    await fsp.writeFile(SUBMISSION_CSV, header + row, "utf8");
    return;
  }

  const content = await fsp.readFile(SUBMISSION_CSV, "utf8");
  const firstLine = content.split(/\r?\n/)[0] || "";
  const existingHeader = firstLine;
  const expectedHeader = keys.map(csvEscape).join(",");

  if (existingHeader !== expectedHeader) {
    throw new Error("CSV-header matcher ikke submission payload.");
  }

  await fsp.appendFile(SUBMISSION_CSV, row, "utf8");
}

function resolveStaticPath(urlPath) {
  const cleanPath = urlPath.split("?")[0];
  const relPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const resolved = path.normalize(path.join(ROOT_DIR, relPath));
  if (!resolved.startsWith(ROOT_DIR)) return null;
  return resolved;
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/submissions") {
      let body = "";
      req.on("data", chunk => {
        body += chunk;
        if (body.length > 1_000_000) {
          req.destroy();
        }
      });

      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          if (!payload || typeof payload !== "object") {
            sendJson(res, 400, { error: "Ugyldigt payload" });
            return;
          }

          await appendSubmission(payload);
          sendJson(res, 201, { ok: true });
        } catch (err) {
          console.error(err);
          sendJson(res, 500, { error: "Kunne ikke gemme submission" });
        }
      });
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end("Method Not Allowed");
      return;
    }

    const filePath = resolveStaticPath(req.url || "/");
    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const stat = await fsp.stat(filePath).catch(() => null);
    if (!stat || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": type });
    if (req.method === "HEAD") {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Kandidattest server kører på http://localhost:${PORT}`);
});
