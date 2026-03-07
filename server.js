require("dotenv").config();

const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.join(__dirname, "kandidattest");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

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
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/config.js") {
      const js =
        "window.__SUPABASE_CONFIG=" +
        JSON.stringify({
          url: SUPABASE_URL,
          key: SUPABASE_ANON_KEY,
        }) +
        ";";
      res.writeHead(200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(js);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end("Method Not Allowed");
      return;
    }

    let filePath = resolveStaticPath(req.url || "/");
    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    let stat = await fsp.stat(filePath).catch(() => null);

    // Clean URLs: /politiker -> /politiker.html
    if ((!stat || !stat.isFile()) && !path.extname(filePath)) {
      const htmlPath = filePath + ".html";
      const htmlStat = await fsp.stat(htmlPath).catch(() => null);
      if (htmlStat && htmlStat.isFile()) {
        filePath = htmlPath;
        stat = htmlStat;
      }
    }

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
  if (SUPABASE_URL) {
    console.log("Supabase tilsluttet: " + SUPABASE_URL);
    console.log("Politiker-formular: http://localhost:" + PORT + "/politiker");
  } else {
    console.log("Advarsel: SUPABASE_URL ikke sat – kører uden database");
  }
});
