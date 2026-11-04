const crypto = require("crypto");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const hits = new Map();

const CORS_ORIGINS = [
  "https://hyundaimedi.com",
  "https://www.hyundaimedi.com",
  "https://heriumcare.com",
  "https://www.heriumcare.com"
];

function tooMany(bucket, ip, limit, windowMs) {
  const key = bucket + ":" + (ip || "unknown");
  const now = Date.now();
  const row = hits.get(key) || { n: 0, t: now };
  if (now - row.t > windowMs) {
    row.n = 0;
    row.t = now;
  }
  row.n += 1;
  hits.set(key, row);
  if (hits.size > 5000) {
    for (const [name, value] of hits) {
      if (now - value.t > windowMs) hits.delete(name);
    }
  }
  return row.n > limit;
}

function isDebug() {
  const value = String(process.env.DEBUG || "False").toLowerCase();
  return value === "true" || value === "1";
}

function allowedHosts() {
  return String(process.env.ALLOWED_HOSTS || "hyundaimedi.com,www.hyundaimedi.com,.onrender.com,localhost,127.0.0.1")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hostAllowed(host) {
  const h = String(host || "").split(":")[0].toLowerCase();
  if (!h) return false;
  return allowedHosts().some((item) => {
    const rule = item.replace(/^\*\./, ".").toLowerCase();
    if (rule.startsWith(".")) return h === rule.slice(1) || h.endsWith(rule);
    return h === rule;
  });
}

function hostAllow(req, res, next) {
  if (req.path === "/healthz") return next();
  const host = req.get("host") || "";
  if (hostAllowed(host)) return next();
  res.status(400).type("text").send("잘못된 호스트입니다.");
}

function isCheckoutPath(path) {
  const p = String(path || "");
  return /^\/(checkout|payment-success|payment-fail)(\.html)?\/?$/.test(p)
    || p.indexOf("/orders/payment") === 0
    || p.indexOf("/orders/complete") === 0;
}

function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (!isDebug()) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  const toss = "https://*.tosspayments.com https://tosspayments.com https://pay.toss.im https://*.toss.im https://toss.im https://static.toss.im";
  const daum = "https://t1.daumcdn.net https://t1.kakaocdn.net https://postcode.map.daum.net https://postcode.map.kakao.com https://*.daum.net https://*.kakao.com https://*.daumcdn.net https://*.kakaocdn.net";
  if (isCheckoutPath(req.path)) {
    res.setHeader("Content-Security-Policy", [
      "default-src 'self' https: wss: blob: data:",
      "script-src 'self' 'unsafe-inline' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: https:",
      "font-src 'self' https: data:",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https:",
      "form-action 'self' https:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join("; "));
  } else {
    res.setHeader("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.tosspayments.com " + toss + " " + daum,
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com data:",
      "img-src 'self' data: " + toss + " " + daum,
      "connect-src 'self' " + toss + " wss://*.tosspayments.com https://api.tosspayments.com https://event.tosspayments.com https://log.tosspayments.com " + daum,
      "frame-src 'self' " + toss + " " + daum,
      "child-src 'self' " + toss + " " + daum,
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self' " + toss
    ].join("; "));
  }
  next();
}

function requireFetchHeader(req, res, next) {
  if (req.method !== "POST" && req.method !== "PATCH" && req.method !== "DELETE") return next();
  const p = String(req.path || "");
  if (p === "/api/payments/webhook") return next();
  if (!p.startsWith("/api/") && !p.startsWith("/orders/")) return next();
  if (req.get("X-Requested-With") !== "fetch") {
    return res.status(403).json({ error: "요청을 확인할 수 없습니다." });
  }
  next();
}

function helmetMw() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" },
    hsts: isDebug() ? false : { maxAge: 31536000, includeSubDomains: true, preload: true }
  });
}

function corsMw(req, res, next) {
  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (CORS_ORIGINS.indexOf(origin) >= 0) return cb(null, true);
      if (isDebug() && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true
  })(req, res, next);
}

const jsonLimitMessage = { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." };

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip(req) {
    const p = String(req.path || "");
    if (p === "/healthz" || p === "/api/payments/webhook") return true;
    if (req.method === "GET" && p.indexOf("/api/") !== 0) return true;
    return false;
  },
  message: jsonLimitMessage
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonLimitMessage
});

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonLimitMessage
});

function registrationOpen() {
  const value = String(process.env.ALLOW_REGISTRATION || "true").trim().toLowerCase();
  return value !== "0" && value !== "false" && value !== "no";
}

function stagingAuth(req, res, next) {
  const user = String(process.env.STAGING_USER || "").trim();
  const password = String(process.env.STAGING_PASSWORD || "");
  if (!user || !password) return next();
  if (req.path === "/healthz" || req.path === "/api/payments/webhook") return next();
  const header = req.get("authorization") || "";
  const expected = Buffer.from(user + ":" + password);
  let given = Buffer.alloc(0);
  if (header.startsWith("Basic ")) {
    try {
      given = Buffer.from(header.slice(6), "base64");
    } catch (_err) {
      given = Buffer.alloc(0);
    }
  }
  if (given.length === expected.length && crypto.timingSafeEqual(given, expected)) return next();
  res.set("WWW-Authenticate", 'Basic realm="staging"');
  res.status(401).type("text").send("인증이 필요합니다.");
}

module.exports = {
  tooMany,
  isDebug,
  hostAllow,
  securityHeaders,
  requireFetchHeader,
  registrationOpen,
  stagingAuth,
  helmetMw,
  corsMw,
  apiLimiter,
  loginLimiter,
  signupLimiter
};
