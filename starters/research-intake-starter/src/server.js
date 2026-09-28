const http = require("http");
const crypto = require("crypto");
const page = require("./form-page");
const { validate, toResponseRow } = require("./schema");
const { appendResponse } = require("./google-sheets");

const port = Number(process.env.PORT || 8080);
const recordPrefix = process.env.RECORD_PREFIX || "RES";
const rate = new Map();

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function readJson(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > maxBytes) {
        reject(Object.assign(new Error("Payload too large."), { status: 413 }));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(Object.assign(new Error("Invalid JSON."), { status: 400 }));
      }
    });

    req.on("error", reject);
  });
}

function allowedOrigin(req) {
  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);

  if (!configured.length) return true;

  const origin = req.headers.origin;
  if (!origin) return true;
  return configured.includes(origin);
}

function isRateLimited(req) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = 5;
  const ip = String(
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown"
  ).split(",")[0].trim();

  const item = rate.get(ip);

  if (!item || now - item.started > windowMs) {
    rate.set(ip, { started: now, count: 1 });
    return false;
  }

  item.count += 1;
  return item.count > max;
}

function recordId() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  return (
    recordPrefix +
    "-" +
    date +
    "-" +
    crypto.randomBytes(3).toString("hex").toUpperCase()
  );
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/intake")) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    return res.end(page);
  }

  if (req.method === "POST" && url.pathname === "/api/intake") {
    if (!allowedOrigin(req)) {
      return sendJson(res, 403, { message: "Origin not allowed." });
    }

    if (isRateLimited(req)) {
      return sendJson(res, 429, {
        message: "Too many submissions. Try again later."
      });
    }

    try {
      const body = await readJson(req);

      // Honeypot: pretend success for obvious bots.
      if (String(body.website || "").trim()) {
        return sendJson(res, 200, {
          ok: true,
          record_id: "accepted"
        });
      }

      const startedAt = Number(body.startedAt || 0);
      if (!startedAt || Date.now() - startedAt < 2500) {
        return sendJson(res, 400, {
          message: "Submission was too fast. Review the form and try again."
        });
      }

      const checked = validate(body);
      if (!checked.ok) {
        return sendJson(res, 400, {
          message: checked.errors.join(" ")
        });
      }

      const id = recordId();
      const submittedAt = new Date().toISOString();

      await appendResponse(
        toResponseRow({
          recordId: id,
          submittedAt,
          data: checked.data
        })
      );

      return sendJson(res, 201, {
        ok: true,
        record_id: id
      });
    } catch (err) {
      console.error("Intake error:", err);
      return sendJson(
        res,
        err.status && err.status < 500 ? err.status : 503,
        { message: err.message || "Submission could not be stored." }
      );
    }
  }

  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end("Not found");
}).listen(port, "0.0.0.0", () => {
  console.log("Research intake starter listening on port " + port);
});
