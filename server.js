const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");
const express = require("express");

(function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
})();

const db = require("./server/db");
const oauth = require("./server/oauth");
const security = require("./server/security");
const payments = require("./server/payments");
const guard = require("./server/guard");
const { cleanText } = require("./server/pii");
const passwords = require("./server/passwords");
const productStore = require("./server/products");
const orderUrls = require("./server/orders/urls");
const adminRoutes = require("./server/admin");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const DEBUG = String(process.env.DEBUG || "False").toLowerCase() === "true" || process.env.DEBUG === "1";
const IS_PROD = process.env.NODE_ENV === "production";
const SECRET = process.env.SESSION_SECRET || (DEBUG ? "hyundai-medical-dev-secret" : "");
const JWT_SECRET = process.env.JWT_SECRET || SECRET;
const COOKIE = "hm_session";
const ADMIN_URL_PATH = String(process.env.ADMIN_URL_PATH || "hyundai-control-99").replace(/^\/+|\/+$/g, "") || "hyundai-control-99";
if (!DEBUG && !SECRET) {
  console.error("SESSION_SECRET이 없습니다. 배포 환경변수에 넣어 주세요.");
  process.exit(1);
}

const catalog = vm.runInNewContext(
  fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8") + "\n({ PRODUCTS, GROUPS, CATEGORIES, copay, productById, productGroup, isWelfare })"
);
const SITE = (process.env.SITE_URL || "https://hyundaimedi.com").replace(/\/$/, "");


const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.get("/healthz", (_req, res) => res.type("text").send("ok"));
app.use(guard.hostAllow);
app.use((req, res, next) => {
  if (DEBUG || req.path === "/healthz") return next();
  const proto = String(req.get("x-forwarded-proto") || req.protocol || "").split(",")[0].trim();
  if (proto === "https") return next();
  const host = req.get("host") || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return next();
  return res.redirect(301, "https://" + host + req.originalUrl);
});
app.use(guard.stagingAuth);
app.use(guard.helmetMw());
app.use(guard.corsMw);
app.use(guard.apiLimiter);
app.use(guard.securityHeaders);
app.use(express.json({ limit: "200kb" }));
app.use(guard.requireFetchHeader);

const pages = [
  "index", "shop", "product", "guide", "consult", "about",
  "login", "signup", "find-id", "find-password", "reset-password", "account", "mypage", "checkout", "payment-success", "payment-fail", "sitemap", "privacy", "terms", "returns"
];

const staticOpts = { dotfiles: "deny", index: false, fallthrough: true };
app.use("/css", express.static(path.join(ROOT, "css"), staticOpts));
app.use("/js", express.static(path.join(ROOT, "js"), staticOpts));
app.use("/uploads", express.static(path.join(ROOT, "uploads"), staticOpts));

pages.forEach((name) => {
  const file = path.join(ROOT, name + ".html");
  const send = (_req, res) => res.sendFile(file);
  app.get("/" + name + ".html", send);
  app.get("/" + name, send);
});
app.get("/", (_req, res) => res.sendFile(path.join(ROOT, "index.html")));
app.get("/mypage/", (_req, res) => res.sendFile(path.join(ROOT, "mypage.html")));
app.get("/terms/", (_req, res) => res.sendFile(path.join(ROOT, "terms.html")));
app.get("/privacy/", (_req, res) => res.sendFile(path.join(ROOT, "privacy.html")));
app.get("/returns/", (_req, res) => res.sendFile(path.join(ROOT, "returns.html")));

function sendAdmin(req, res) {
  res.sendFile(path.join(ROOT, "admin.html"));
}
app.get("/" + ADMIN_URL_PATH, sendAdmin);
app.get("/" + ADMIN_URL_PATH + ".html", sendAdmin);
if (DEBUG) {
  app.get("/admin", sendAdmin);
  app.get("/admin.html", sendAdmin);
} else {
  app.get("/admin", (_req, res) => res.status(404).sendFile(path.join(ROOT, "404.html")));
  app.get("/admin.html", (_req, res) => res.status(404).sendFile(path.join(ROOT, "404.html")));
}

function xmlEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function xmlUrl(loc, changefreq, priority) {
  return [
    "  <url>",
    "    <loc>" + xmlEscape(loc) + "</loc>",
    "    <changefreq>" + changefreq + "</changefreq>",
    "    <priority>" + priority + "</priority>",
    "  </url>"
  ].join("\n");
}

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /admin.html",
      "Disallow: /" + ADMIN_URL_PATH,
      "Disallow: /" + ADMIN_URL_PATH + ".html",
      "Disallow: /api/",
      "",
      "User-agent: Yeti",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /admin.html",
      "Disallow: /" + ADMIN_URL_PATH,
      "Disallow: /" + ADMIN_URL_PATH + ".html",
      "Disallow: /api/",
      "",
      "Sitemap: https://hyundaimedi.com/sitemap.xml",
      ""
    ].join("\n")
  );
});

app.get("/sitemap.xml", (_req, res) => {
  const urls = [
    xmlUrl(SITE + "/", "weekly", "1.0"),
    xmlUrl(SITE + "/shop.html", "weekly", "1.0"),
    xmlUrl(SITE + "/consult.html", "weekly", "1.0"),
    xmlUrl(SITE + "/about.html", "weekly", "1.0"),
    xmlUrl(SITE + "/guide.html", "weekly", "1.0"),
    xmlUrl(SITE + "/privacy.html", "weekly", "1.0"),
    xmlUrl(SITE + "/terms.html", "weekly", "1.0")
  ];
  (catalog.GROUPS || []).forEach((g) => {
    urls.push(xmlUrl(SITE + "/shop.html?group=" + encodeURIComponent(g.id), "weekly", "0.8"));
  });
  (catalog.CATEGORIES || []).forEach((c) => {
    urls.push(xmlUrl(
      SITE + "/shop.html?group=" + encodeURIComponent(c.group) + "&category=" + encodeURIComponent(c.id),
      "weekly",
      "0.6"
    ));
  });
  (catalog.PRODUCTS || []).forEach((p) => {
    urls.push(xmlUrl(SITE + "/product.html?id=" + encodeURIComponent(p.id), "monthly", "0.5"));
  });
  res.type("application/xml").send(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") +
    "\n</urlset>\n"
  );
});

function normalizePhone(raw) {
  return String(raw || "").replace(/\D/g, "");
}

function validPhone(phone) {
  return /^01[016789]\d{7,8}$/.test(phone);
}

const SCRYPT = { N: 16384, r: 8, p: 1 };

function hashPassword(password) {
  return passwords.hashPassword(password);
}

function verifyPassword(password, stored) {
  return passwords.verifyPassword(password, stored);
}

function staffPlaceholderPhone(username) {
  const hex = crypto.createHash("sha256").update("hm-staff:" + String(username || "admin")).digest("hex");
  let digits = "";
  for (let i = 0; i < hex.length && digits.length < 8; i += 1) {
    digits += String(parseInt(hex.charAt(i), 16) % 10);
  }
  return "010" + digits.padEnd(8, "0");
}

function issueAccessToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    role: user.role || "user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60
  })).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(header + "." + payload).digest("base64url");
  return header + "." + payload + "." + sig;
}

function readAccessToken(token) {
  if (!token || token.split(".").length !== 3) return null;
  const [header, payload, sig] = token.split(".");
  const expect = crypto.createHmac("sha256", JWT_SECRET).update(header + "." + payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch (_e) {
    return null;
  }
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return body + "." + sig;
}

function unsign(token) {
  if (!token || token.indexOf(".") < 0) return null;
  const [body, sig] = token.split(".");
  const expect = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (_e) {
    return null;
  }
}

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i < 0) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function setSession(res, userId) {
  const token = sign({ uid: userId, exp: Date.now() + 14 * 24 * 60 * 60 * 1000 });
  const bits = [
    COOKIE + "=" + token,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=" + 14 * 24 * 60 * 60
  ];
  if (IS_PROD || !DEBUG) bits.push("Secure");
  res.append("Set-Cookie", bits.join("; "));
}

function clearSession(res) {
  const bits = [COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"];
  if (IS_PROD || !DEBUG) bits.push("Secure");
  res.append("Set-Cookie", bits.join("; "));
}

function publicUser(user) {
  if (!user) return null;
  const phone = validPhone(normalizePhone(user.phone)) ? user.phone : "";
  const isAdmin = (user.role || "") === "admin";
  return {
    id: user.id,
    name: user.name,
    phone,
    username: user.username || "",
    email: user.email || "",
    address: user.address || "",
    zipcode: "",
    addressBasic: "",
    addressDetail: "",
    role: isAdmin ? "admin" : (user.role || "user"),
    isAdmin
  };
}

async function publicUserWithShop(user) {
  const base = publicUser(user);
  if (!base) return null;
  const shop = await db.getShopProfile(user.id);
  if (shop) {
    base.zipcode = shop.zipcode || "";
    base.addressBasic = shop.address_basic || "";
    base.addressDetail = shop.address_detail || "";
    if (!base.address) {
      base.address = [shop.zipcode, shop.address_basic, shop.address_detail].filter(Boolean).join(" ").trim();
    }
  }
  if (base.isAdmin || (user.role || "") === "admin") {
    base.adminPath = "/" + ADMIN_URL_PATH;
    base.isAdmin = true;
    base.role = "admin";
  }
  return base;
}

function validEmail(raw) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(raw || "").trim());
}

function joinedAddress(zipcode, basic, detail, fallback) {
  const text = [zipcode, basic, detail].map((v) => String(v || "").trim()).filter(Boolean).join(" ");
  return (text || String(fallback || "")).slice(0, 200);
}

function validUsername(raw) {
  return /^[a-zA-Z가-힣][a-zA-Z0-9가-힣_]{3,19}$/.test(String(raw || "").trim());
}

function safeNext(raw) {
  let value = String(raw || "").trim();
  if (value.startsWith("/")) value = value.slice(1);
  const pathOnly = value.split(/[#?]/)[0];
  if (pathOnly === ADMIN_URL_PATH || pathOnly === ADMIN_URL_PATH + ".html") return "/" + ADMIN_URL_PATH;
  if (DEBUG && /^(admin|admin\.html)$/i.test(pathOnly)) return "/admin.html";
  if (!/^[a-z0-9_-]+\.html(?:[#?].*)?$/i.test(value)) return "/mypage.html";
  if (/^(admin|account)\.html/i.test(value)) return "/mypage.html";
  return "/" + value;
}

function setOauth(res, payload) {
  const token = sign(Object.assign({ exp: Date.now() + 10 * 60 * 1000 }, payload));
  const bits = ["hm_oauth=" + token, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=600"];
  if (IS_PROD || !DEBUG) bits.push("Secure");
  res.append("Set-Cookie", bits.join("; "));
}

function clearOauth(res) {
  const bits = ["hm_oauth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"];
  if (IS_PROD || !DEBUG) bits.push("Secure");
  res.append("Set-Cookie", bits.join("; "));
}

function normalizeSocialPhone(raw) {
  let phone = String(raw || "").replace(/\D/g, "");
  if (phone.startsWith("82") && phone.length >= 11) phone = "0" + phone.slice(2);
  return validPhone(phone) ? phone : "";
}

function sameName(a, b) {
  return String(a || "").replace(/\s/g, "") === String(b || "").replace(/\s/g, "");
}

async function upsertSocialUser(provider, profile) {
  const existing = await db.findUserBySocial(provider, profile.id);
  if (existing) return existing;
  const phone = normalizeSocialPhone(profile.phone);
  if (phone) {
    const byPhone = await db.findUserByPhone(phone);
    if (byPhone) {
      await db.linkSocial(byPhone.id, provider, profile.id);
      return byPhone;
    }
  }
  if (profile.email) {
    const byEmail = await db.findUserByEmail(profile.email);
    if (byEmail) {
      await db.linkSocial(byEmail.id, provider, profile.id);
      return byEmail;
    }
  }
  if (!guard.registrationOpen()) return null;
  let username = String((profile.email && profile.email.split("@")[0]) || provider + String(profile.id).slice(-6))
    .replace(/[^a-zA-Z0-9가-힣_]/g, "")
    .slice(0, 20);
  if (!validUsername(username) || await db.findUserByUsername(username)) {
    username = (provider.slice(0, 2) + String(profile.id).replace(/\W/g, "")).slice(0, 20);
  }
  if (!validUsername(username)) username = "s" + crypto.randomBytes(4).toString("hex");
  const user = {
    id: "u_" + crypto.randomUUID(),
    name: String(profile.name || "회원").slice(0, 40),
    username,
    email: profile.email || "",
    phone: phone || ("s" + provider.charAt(0) + String(profile.id).replace(/\D/g, "").slice(-10).padStart(10, "0")),
    passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")),
    role: "user",
    heriumLinked: true,
    heriumRelation: "",
    heriumNote: "",
    kakaoId: provider === "kakao" ? String(profile.id) : "",
    naverId: provider === "naver" ? String(profile.id) : "",
    googleId: provider === "google" ? String(profile.id) : "",
    createdAt: new Date().toISOString()
  };
  await db.createUser(user);
  return user;
}

function looksLikeAdminLogin(user, login) {
  const keys = [login, user && user.username, user && user.email]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  return keys.some((key) => key === "admin" || key === "admin@example.com");
}

async function ensureAdminRole(user, login) {
  if (!user) return user;
  if (user.role === "admin") {
    user.isAdmin = true;
    return user;
  }
  let herium = null;
  try {
    herium = await db.findHeriumAccount(login || user.username || user.email || "");
    if (!herium && user.phone) herium = await db.findHeriumAccount(user.phone);
  } catch (_e) {}
  if (looksLikeAdminLogin(user, login) || db.heriumIsAdmin(herium)) {
    await db.setUserRole(user.id, "admin");
    user.role = "admin";
    user.isAdmin = true;
  }
  return user;
}

async function currentUser(req) {
  const header = String(req.headers.authorization || "");
  if (header.toLowerCase().startsWith("bearer ")) {
    const data = readAccessToken(header.slice(7).trim());
    if (data && data.sub) {
      const user = await db.findUserById(data.sub);
      if (user && !user.withdrawnAt) return ensureAdminRole(user);
    }
  }
  const payload = unsign(parseCookies(req)[COOKIE]);
  if (!payload) return null;
  const user = await db.findUserById(payload.uid);
  if (user && user.withdrawnAt) return null;
  return user ? ensureAdminRole(user) : null;
}

async function requireUser(req, res, next) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: "로그인이 필요합니다." });
  req.user = user;
  next();
}

const loginHits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const row = loginHits.get(ip) || { n: 0, t: now };
  if (now - row.t > 30 * 60 * 1000) {
    row.n = 0;
    row.t = now;
  }
  row.n += 1;
  loginHits.set(ip, row);
  return row.n > 5;
}

app.get("/api/me", async (req, res) => {
  res.json({ user: await publicUserWithShop(await currentUser(req)) });
});

app.get("/api/cart", requireUser, async (req, res) => {
  res.json({ items: await db.listCartItems(req.user.id) });
});

app.put("/api/cart", requireUser, async (req, res) => {
  const items = await db.replaceCartItems(req.user.id, req.body && req.body.items);
  res.json({ items });
});

app.patch("/api/me", requireUser, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  const zipcode = String(req.body.zipcode || "").trim().slice(0, 10);
  const addressBasic = String(req.body.address_basic || req.body.addressBasic || "").trim().slice(0, 120);
  const addressDetail = String(req.body.address_detail || req.body.addressDetail || "").trim().slice(0, 80);
  const address = joinedAddress(zipcode, addressBasic, addressDetail, req.body.address);
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const current = String(req.body.currentPassword || "");
  if (name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  const taken = await db.findUserByPhone(phone);
  if (taken && taken.id !== req.user.id) {
    return res.status(409).json({ error: "이미 사용 중인 휴대폰 번호입니다." });
  }
  if (email && !validEmail(email)) {
    return res.status(400).json({ error: "이메일 형식을 확인해 주세요." });
  }
  if (email) {
    const emailTaken = await db.findUserByEmail(email);
    if (emailTaken && emailTaken.id !== req.user.id) {
      return res.status(409).json({ error: "이미 사용 중인 이메일입니다." });
    }
  }
  if (password) {
    const policy = security.passwordError(password);
    if (policy) return res.status(400).json({ error: policy });
    if (!verifyPassword(current, req.user.passwordHash)) {
      return res.status(400).json({ error: "현재 비밀번호가 일치하지 않습니다." });
    }
    await db.updatePassword(req.user.id, hashPassword(password));
  }
  await db.updateBuyerProfile(req.user.id, { name, phone, address, email });
  await db.upsertShopProfile(req.user.id, {
    recipient_name: name,
    recipient_phone: phone,
    zipcode,
    address_basic: addressBasic,
    address_detail: addressDetail
  });
  res.json({ user: await publicUserWithShop(await db.findUserById(req.user.id)) });
});

app.post("/api/signup", guard.signupLimiter, async (req, res) => {
  if (!guard.registrationOpen()) {
    return res.status(403).json({ error: "현재 정식 오픈 준비 중입니다." });
  }
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const username = email;
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");
  const confirm = String(req.body.passwordConfirm || req.body.password_confirm || "");
  const zipcode = String(req.body.zipcode || "").trim().slice(0, 10);
  const addressBasic = String(req.body.address_basic || req.body.addressBasic || "").trim().slice(0, 120);
  const addressDetail = String(req.body.address_detail || req.body.addressDetail || "").trim().slice(0, 80);
  const address = joinedAddress(zipcode, addressBasic, addressDetail, req.body.address);
  const age14 = req.body.age14 === true || req.body.age14 === "true" || req.body.age14 === "on" || req.body.age14 === 1;
  const marketing = req.body.marketing === true || req.body.marketing === "true" || req.body.marketing === "on";
  if (!age14) return res.status(400).json({ error: "만 14세 이상만 가입할 수 있습니다." });
  if (!validEmail(email)) return res.status(400).json({ error: "이메일을 올바르게 입력해 주세요." });
  if (name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  if (confirm && password !== confirm) {
    return res.status(400).json({ error: "비밀번호가 일치하지 않습니다." });
  }
  const policy = security.passwordError(password);
  if (policy) return res.status(400).json({ error: policy });
  if (await db.findUserByEmail(email) || await db.findUserByUsername(username)) {
    return res.status(409).json({ error: "이미 사용 중인 이메일입니다." });
  }
  if (await db.findUserByPhone(phone)) {
    return res.status(409).json({ error: "이미 가입된 휴대폰 번호입니다." });
  }
  const user = {
    id: "u_" + crypto.randomUUID(),
    name,
    username,
    email,
    phone,
    passwordHash: hashPassword(password),
    role: process.env.ADMIN_PHONE && normalizePhone(process.env.ADMIN_PHONE) === phone ? "admin" : "user",
    heriumLinked: false,
    heriumRelation: "",
    heriumNote: "",
    createdAt: new Date().toISOString(),
    age14: true,
    marketing
  };
  await db.createUser(user);
  if (address) {
    await db.updateBuyerProfile(user.id, { name, phone, address, email });
  }
  if (zipcode || addressBasic || addressDetail) {
    await db.upsertShopProfile(user.id, {
      recipient_name: name,
      recipient_phone: phone,
      zipcode,
      address_basic: addressBasic,
      address_detail: addressDetail
    });
  }
  setSession(res, user.id);
  res.json({ user: await publicUserWithShop(user), token: issueAccessToken(user) });
});

async function linkHeriumLogin(login, password, sharedUser) {
  const herium = await db.findHeriumAccount(login);
  if (!herium || !herium.isActive) return null;
  if (herium.status === "suspended" || herium.status === "withdrawn") return null;
  if (!(await passwords.verifyDjangoPassword(password, herium.password))) return null;
  const staff = db.heriumIsAdmin(herium);
  const passwordHash = hashPassword(password);
  const samePerson = (user) => {
    if (!user) return false;
    const samePhone = herium.phone && normalizePhone(user.phone) === herium.phone;
    const sameId = String(user.username || "").toLowerCase() === herium.username.toLowerCase();
    const sameEmail = herium.email && String(user.email || "").toLowerCase() === herium.email.toLowerCase();
    return samePhone || sameId || sameEmail;
  };
  if (sharedUser && !samePerson(sharedUser) && !staff) return null;
  let target = sharedUser && samePerson(sharedUser) ? sharedUser : null;
  if (!target && herium.phone) target = await db.findUserByPhone(herium.phone);
  if (!target && herium.username) target = await db.findUserByUsername(herium.username);
  if (!target && herium.email) target = await db.findUserByEmail(herium.email);
  if (target) {
    await db.updatePassword(target.id, passwordHash);
    await db.setUsername(target.id, herium.username);
    if (herium.name) await db.setGuardianName(target.id, herium.name);
    if (staff) await db.setUserRole(target.id, "admin");
    return ensureAdminRole(await db.findUserById(target.id), login);
  }
  const phone = validPhone(herium.phone) ? herium.phone : (staff ? staffPlaceholderPhone(herium.username) : "");
  if (!validPhone(phone)) return null;
  const created = {
    id: "u_" + crypto.randomUUID(),
    name: herium.name || herium.username || "",
    username: herium.username,
    email: herium.email || "",
    phone,
    passwordHash,
    role: staff ? "admin" : "user",
    heriumLinked: true,
    guardianName: String(herium.name || "").slice(0, 40),
    heriumRelation: "",
    heriumNote: "herium_username=" + herium.username,
    createdAt: new Date().toISOString()
  };
  try {
    await db.createUser(created);
    return ensureAdminRole(created, login);
  } catch (_err) {
    const again = (herium.phone && await db.findUserByPhone(herium.phone))
      || await db.findUserByPhone(phone)
      || await db.findUserByUsername(herium.username);
    if (!again) return null;
    await db.updatePassword(again.id, passwordHash);
    await db.setUsername(again.id, herium.username);
    if (staff) await db.setUserRole(again.id, "admin");
    return ensureAdminRole(await db.findUserById(again.id), login);
  }
}

app.post("/api/login", guard.loginLimiter, async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (tooMany(ip)) return res.status(429).json({ error: "잠시 후 다시 시도해 주세요." });
  const login = String(req.body.login || req.body.username || req.body.phone || "").trim();
  const password = String(req.body.password || "");
  const user = await db.findUserByLogin(login);
  if (user && user.loginLockedUntil && !db.lockMessage(user)) {
    await db.clearLoginFailure(user.id);
    user.loginFailures = 0;
    user.loginLockedUntil = "";
  }
  const locked = user ? db.lockMessage(user) : "";
  if (user && user.withdrawnAt) return res.status(403).json({ error: "탈퇴 처리된 계정입니다." });
  if (user && !locked && await passwords.verifyAnyPassword(password, user.passwordHash)) {
    if (passwords.needsRehash(user.passwordHash)) await db.updatePassword(user.id, hashPassword(password));
    await db.clearLoginFailure(user.id);
    await ensureAdminRole(user, login);
    setSession(res, user.id);
    return res.json({ user: await publicUserWithShop(user), token: issueAccessToken(user) });
  }
  const linked = await linkHeriumLogin(login, password, user);
  if (!linked) {
    if (locked) return res.status(423).json({ error: locked });
    if (user) {
      const state = await db.noteLoginFailure(user.id, user.loginFailures);
      if (state.locked) return res.status(423).json({ error: db.lockMessage({ loginLockedUntil: state.until }) });
    }
    try { await db.writeAudit("anon", "login_failed", String(login || "").slice(0, 80), ip); } catch (_e) {}
    return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }
  await db.clearLoginFailure(linked.id);
  setSession(res, linked.id);
  res.json({ user: await publicUserWithShop(linked), token: issueAccessToken(linked) });
});

app.post("/api/find-id", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  if (name.length < 2 || !validPhone(phone)) {
    return res.status(400).json({ error: "이름과 휴대폰 번호를 확인해 주세요." });
  }
  const user = await db.findUserByPhone(phone);
  if (user && sameName(user.name, name)) {
    return res.json({ username: user.username || "", phone: user.phone });
  }
  const herium = await db.findHeriumByNamePhone(name, phone);
  if (!herium || herium.status === "suspended" || herium.status === "withdrawn" || !herium.isActive) {
    return res.status(404).json({ error: "일치하는 회원 정보가 없습니다." });
  }
  res.json({ username: herium.username || "", phone: herium.phone });
});

const resetHits = new Map();
function resetTooMany(ip) {
  const now = Date.now();
  const row = resetHits.get(ip) || { n: 0, t: now };
  if (now - row.t > 10 * 60 * 1000) {
    row.n = 0;
    row.t = now;
  }
  row.n += 1;
  resetHits.set(ip, row);
  return row.n > 8;
}

app.post("/api/forgot-password", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (resetTooMany(ip)) return res.status(429).json({ error: "요청이 너무 많습니다. 10분 뒤에 다시 시도해 주세요." });
  const email = String(req.body.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "이메일 형식을 확인해 주세요." });
  }
  if (!security.mailConfigured()) {
    return res.status(503).json({ error: "비밀번호 재설정 메일을 보낼 설정이 아직 없습니다. 관리자에게 문의해 주세요." });
  }
  const generic = { ok: true, message: "가입된 이메일이라면 재설정 링크를 보냈습니다. 30분 안에 메일을 확인해 주세요." };
  const user = await db.findUserByEmail(email);
  if (user) {
    try {
      const token = await db.issueResetToken(user.id);
      const link = SITE + "/reset-password.html?token=" + encodeURIComponent(token);
      await security.sendResetMail(email, link, "현대 의료기");
    } catch (err) {
      console.error("password reset mail failed");
    }
  }
  res.json(generic);
});

app.post("/api/password-help", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (guard.tooMany("password-help", ip, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "요청이 너무 많습니다. 10분 뒤에 다시 시도해 주세요." });
  }
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  if (name.length < 2 || !validPhone(phone)) {
    return res.status(400).json({ error: "이름과 휴대폰 번호를 확인해 주세요." });
  }
  const sent = {
    ok: true,
    message: "요청을 접수했습니다. 고객센터(054-334-9986)에서 본인 확인 후 연락드립니다."
  };
  try {
    const user = await db.findNoEmailMember(name, phone);
    if (user) await db.openPasswordHelp(user.id, name, phone, "medical");
  } catch (err) {
    console.error("password help request failed");
    return res.status(503).json({ error: "지금은 요청을 저장할 수 없습니다. 054-334-9986으로 전화해 주세요." });
  }
  res.json(sent);
});

app.get("/api/password-help", requireUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "관리자만 볼 수 있습니다." });
  const items = await db.listPasswordHelp();
  await db.writeAudit(req.user.id, "view_password_help", "open", req.ip || "");
  res.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      site: item.site,
      createdAt: item.createdAt
    }))
  });
});

app.post("/api/password-help/:id/reset", requireUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "관리자만 변경할 수 있습니다." });
  const password = String(req.body.password || "");
  const confirm = String(req.body.confirm || "");
  if (password !== confirm) return res.status(400).json({ error: "비밀번호 확인이 일치하지 않습니다." });
  const policy = security.passwordError(password);
  if (policy) return res.status(400).json({ error: policy });
  const item = await db.findOpenPasswordHelp(req.params.id);
  if (!item) return res.status(404).json({ error: "요청을 찾을 수 없습니다." });
  await db.updatePassword(item.userId, hashPassword(password));
  await db.clearLoginFailure(item.userId);
  await db.closePasswordHelp(item.id);
  await db.writeAudit(req.user.id, "password_help_reset", item.id, req.ip || "");
  res.json({ ok: true });
});

app.post("/api/reset-password", async (req, res) => {
  const token = String(req.body.token || "");
  const password = String(req.body.password || "");
  if (!token) return res.status(400).json({ error: "재설정 링크가 올바르지 않습니다." });
  const policy = security.passwordError(password);
  if (policy) return res.status(400).json({ error: policy });
  const userId = await db.takeResetToken(token);
  if (!userId) {
    return res.status(400).json({ error: "재설정 링크가 없거나 만료되었습니다. 비밀번호 찾기에서 다시 요청해 주세요." });
  }
  await db.updatePassword(userId, hashPassword(password));
  await db.clearLoginFailure(userId);
  res.json({ ok: true });
});

app.get("/api/public-config", (_req, res) => {
  res.json({
    registrationOpen: guard.registrationOpen(),
    tossClientKey: process.env.TOSS_CLIENT_KEY || ""
  });
});

app.get("/api/auth/providers", (_req, res) => {
  res.json({
    kakao: oauth.enabled("kakao"),
    naver: oauth.enabled("naver"),
    google: oauth.enabled("google")
  });
});

app.get("/api/auth/:provider", (req, res) => {
  const provider = String(req.params.provider || "");
  if (["kakao", "naver", "google"].indexOf(provider) < 0) {
    return res.redirect("/login.html?error=" + encodeURIComponent("지원하지 않는 로그인입니다."));
  }
  if (!oauth.enabled(provider)) {
    return res.redirect("/login.html?error=" + encodeURIComponent("간편 로그인 키가 아직 등록되지 않았습니다."));
  }
  const state = oauth.randomState();
  setOauth(res, { s: state, next: safeNext(req.query.next) });
  res.redirect(oauth.authorizeUrl(SITE, provider, state));
});

app.get("/api/auth/:provider/callback", async (req, res) => {
  const provider = String(req.params.provider || "");
  const fail = (msg) => res.redirect("/login.html?error=" + encodeURIComponent(msg));
  if (["kakao", "naver", "google"].indexOf(provider) < 0) return fail("지원하지 않는 로그인입니다.");
  const payload = unsign(parseCookies(req).hm_oauth);
  clearOauth(res);
  if (!payload || payload.s !== String(req.query.state || "")) return fail("로그인 확인에 실패했습니다. 다시 시도해 주세요.");
  if (req.query.error) return fail("소셜 로그인이 취소되었습니다.");
  const code = String(req.query.code || "");
  if (!code) return fail("인증 코드가 없습니다.");
  try {
    const profile = await oauth.profile(SITE, provider, code);
    if (!profile.id) return fail("소셜 계정 정보를 읽지 못했습니다.");
    const user = await upsertSocialUser(provider, profile);
    if (!user) return fail("현재 정식 오픈 준비 중입니다.");
    setSession(res, user.id);
    res.redirect(safeNext(payload.next));
  } catch (err) {
    fail(err.message || "소셜 로그인에 실패했습니다.");
  }
});

app.post("/api/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

function unitPrice(product) {
  if (product.salePrice) return product.salePrice;
  return catalog.isWelfare(product) ? catalog.copay(product.price) : product.price;
}

async function buildItems(rawItems) {
  const items = [];
  let total = 0;
  for (const row of rawItems || []) {
    const product = await productStore.one(catalog, row.id);
    const qty = Math.max(1, Math.min(20, Number(row.qty) || 1));
    if (!product || product.isActive === false) continue;
    if (Number(product.stock) === 0) {
      const err = new Error(product.name + "은(는) 품절입니다.");
      err.status = 409;
      throw err;
    }
    if (Number(product.stock) > 0 && qty > Number(product.stock)) {
      const err = new Error(product.name + " 재고가 부족합니다.");
      err.status = 409;
      throw err;
    }
    const unit = unitPrice(product);
    const line = unit * qty;
    total += line;
    items.push({
      id: product.id,
      name: product.name,
      qty,
      unit,
      total: line,
      option_text: row.option_text || "",
      hygiene: Boolean(product.isHygiene),
      group: catalog.productGroup(product),
      mode: product.mode
    });
  }
  return { items, total };
}

payments.attach(app, {
  buildItems,
  currentUser,
  normalizePhone,
  validPhone,
  updateBuyerProfile: db.updateBuyerProfile,
  SITE
});
orderUrls.attach(app, { buildItems, currentUser, root: ROOT, requireUser });

app.post("/api/orders", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (guard.tooMany("orders", ip, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "잠시 후 다시 신청해 주세요." });
  }
  const user = await currentUser(req);
  const type = req.body.type === "consult" ? "consult" : "order";
  let name = String(req.body.name || (user && user.name) || "").trim();
  const phone = normalizePhone(req.body.phone || (user && user.phone) || "");
  let address = String(req.body.address || "").trim();
  let memo = String(req.body.memo || "").trim().slice(0, 1000);
  try {
    name = cleanText(name, 40);
    address = cleanText(address, 200);
    memo = cleanText(memo, 1000);
  } catch (err) {
    return res.status(400).json({ error: err.message || "입력 내용을 확인해 주세요." });
  }
  const topics = Array.isArray(req.body.topics) ? req.body.topics.map((t) => String(t).slice(0, 40)).slice(0, 12) : [];

  if (type !== "order" && name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  if (type === "order" && address.length < 5) return res.status(400).json({ error: "배송·설치 주소를 입력해 주세요." });

  let built;
  try {
    built = await buildItems(req.body.items);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message || "주문할 상품이 없습니다." });
  }
  if (type === "order" && !built.items.length) return res.status(400).json({ error: "주문할 상품이 없습니다." });

  const order = {
    id: "o_" + crypto.randomUUID(),
    number: "HM" + Date.now().toString().slice(-10),
    userId: user ? user.id : null,
    type,
    name: name || (type === "order" ? "비회원" : name),
    phone,
    address,
    memo,
    topics,
    items: built.items,
    total: built.total,
    status: "received",
    createdAt: new Date().toISOString()
  };
  await db.createOrder(order);
  if (user && type === "order" && address) {
    await db.updateBuyerProfile(user.id, {
      name: name || user.name || "",
      phone: phone || normalizePhone(user.phone),
      address
    });
  }
  res.json({ order: { id: order.id, number: order.number, status: order.status } });
});

app.get("/api/orders", requireUser, async (req, res) => {
  const list = await db.listOrders({
    all: req.user.role === "admin",
    userId: req.user.id
  });
  const mask = req.user.role !== "admin";
  if (!mask) {
    await db.writeAudit(req.user.id, "view_orders", "all", req.ip || "");
  }
  res.json({
    orders: list.map((o) => payments.publicOrder(o, mask))
  });
});

app.patch("/api/orders/:id", requireUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "관리자만 변경할 수 있습니다." });
  const allowed = ["READY", "PENDING", "PAID", "PREPARING", "SHIPPING", "SHIPPED", "DELIVERED", "CANCEL_REQUESTED", "CANCELLED", "CANCELED"];
  const status = String(req.body.status || "");
  if (allowed.indexOf(status) < 0) return res.status(400).json({ error: "상태 값이 올바르지 않습니다." });
  const order = await db.findOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  const fulfillment = ["PREPARING", "SHIPPING", "SHIPPED", "DELIVERED"];
  if (fulfillment.indexOf(status) >= 0 && order.status !== "PAID" && fulfillment.indexOf(order.status) < 0) {
    return res.status(400).json({ error: "결제 완료 전에 배송 상태로 바꿀 수 없습니다." });
  }
  if (status === "CANCELED" || status === "CANCELLED") {
    try {
      const canceled = await payments.cancelPaidOrder(order);
      if (!canceled) await db.updateOrderStatus(order.id, "CANCELLED");
    } catch (_err) {
      return res.status(400).json({ error: "결제 취소가 완료되지 않았습니다." });
    }
    await db.writeAudit(req.user.id, "order_status", order.number + ":CANCELLED", req.ip || "");
    return res.json({ ok: true, status: "CANCELLED" });
  }
  const tracking = String(req.body.tracking_number || "").trim();
  const saved = await db.updateOrderStatus(order.id, status, { tracking_number: tracking });
  await db.writeAudit(req.user.id, "order_status", order.number + ":" + status, req.ip || "");
  res.json({ ok: true, status: saved.status, tracking_number: tracking || "" });
});

app.post("/api/me/withdraw", requireUser, async (req, res) => {
  const nextHash = hashPassword(crypto.randomBytes(24).toString("hex"));
  await db.withdrawUser(Object.assign({}, req.user, { passwordHash: nextHash }));
  clearSession(res);
  res.json({ ok: true, message: "탈퇴가 완료되었습니다. 주문·결제 기록은 관계 법령에 따라 보관됩니다." });
});

app.get("/api/products", async (_req, res) => {
  res.json({ products: await productStore.all(catalog) });
});

app.get("/api/products/:id", async (req, res) => {
  const product = await productStore.one(catalog, req.params.id);
  if (!product) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  res.json({ product });
});

async function requireAdmin(req, res, next) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: "로그인이 필요합니다." });
  if (user.role !== "admin" && !user.isAdmin) {
    return res.status(403).json({ error: "관리자만 사용할 수 있습니다." });
  }
  req.user = user;
  next();
}

app.post("/api/admin/upload", requireAdmin, (req, res) => {
  const { uploadImage, saveProductImage } = require("./server/upload");
  uploadImage(req, res, async (err) => {
    if (err) return res.status(err.status || 400).json({ error: err.message || "업로드에 실패했습니다." });
    try {
      const url = saveProductImage(req.file);
      await db.writeAudit(req.user.id, "admin_upload", url, req.ip || "");
      res.json({ ok: true, url });
    } catch (saveErr) {
      res.status(saveErr.status || 500).json({ error: saveErr.message || "업로드에 실패했습니다." });
    }
  });
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  if (!String(req.body.name || "").trim() || !Number(req.body.price)) {
    return res.status(400).json({ error: "상품명과 가격을 입력해 주세요." });
  }
  const saved = await productStore.save(req.body);
  res.json({ product: saved });
});

app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
  req.body.id = req.params.id;
  const saved = await productStore.save(req.body);
  res.json({ product: saved });
});

adminRoutes.attach(app, { requireAdmin });

app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  const products = await productStore.all(catalog);
  res.json({
    products,
    lowStock: products.filter((p) => Number(p.stock) <= 10)
  });
});

app.get("/api/company", async (_req, res) => {
  res.json({ company: await db.companyContent() });
});

app.get("/api/admin/company", requireAdmin, async (_req, res) => {
  res.json({ company: await db.companyContent() });
});

app.post("/api/admin/company", requireAdmin, async (req, res) => {
  await db.setCompanyContent(req.body || {});
  res.json({ ok: true });
});

app.get("/api/admin/members", requireAdmin, async (_req, res) => {
  const orders = await db.listOrders({ all: true });
  const users = {};
  orders.forEach((o) => {
    if (!o.userId) return;
    users[o.userId] = (users[o.userId] || 0) + (Number(o.total) || 0);
  });
  res.json({ totals: users });
});

app.use((err, req, res, next) => {
  if (!err) return next();
  if (DEBUG) console.error(err);
  else console.error(err && err.message ? err.message : err);
  const status = Number(err.status) >= 400 && Number(err.status) < 600 ? Number(err.status) : 500;
  if (req.path && String(req.path).startsWith("/api/")) {
    return res.status(status).json({ error: status === 500 ? "서버 오류가 발생했습니다." : (err.message || "요청을 처리하지 못했습니다.") });
  }
  res.status(status === 500 ? 500 : status).sendFile(path.join(ROOT, status === 404 ? "404.html" : "500.html"));
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "없는 요청입니다." });
  res.status(404).sendFile(path.join(ROOT, "404.html"));
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startDatabase() {
  let lastError = null;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      await db.init();
      await productStore.seed(catalog);
      console.log("DB 준비 완료");
      return;
    } catch (err) {
      lastError = err;
      const msg = String((err && err.message) || err).replace(/postgresql:\/\/\S+/gi, "postgresql://***");
      console.error("DB 시작 재시도 " + attempt + "/8:", msg);
      await sleep(Math.min(20000, 2000 * attempt));
    }
  }
  console.error("DB 시작 실패. 페이지는 열고 API는 잠시 후 다시 시도합니다.", lastError && lastError.message);
}

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection", reason && reason.message ? reason.message : reason);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("현대 의료기 서버 0.0.0.0:" + PORT);
});
startDatabase();
