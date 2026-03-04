module.exports = function handler(req, res) {
  var js = "window.__SUPABASE_CONFIG=" + JSON.stringify({
    url: process.env.SUPABASE_URL || "",
    key: process.env.SUPABASE_ANON_KEY || ""
  }) + ";";

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(js);
};
