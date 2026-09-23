const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");
const express = require("express");
const db = require("./server/db");
const oauth = require("./server/oauth");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === "production";
const SECRET = process.env.SESSION_SECRET || (IS_PROD ? "" : "hyundai-medical-dev-secret");
const COOKIE = "hm_session";
if (IS_PROD && !SECRET) {
  console.error("SESSION_SECRET이 없습니다. 배포 환경변수에 넣어 주세요.");
  process.exit(1);
}

const catalog = vm.runInNewContext(
  fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8") + "\n({ PRODUCTS, GROUPS, CATEGORIES, copay, productById, productGroup, isWelfare })"
);
const SITE = (process.env.SITE_URL || "https://hyundaimedi.com").replace(/\/$/, "");


const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "200kb" }));

const pages = [
  "index", "shop", "product", "guide", "consult", "about",
  "login", "signup", "find-id", "find-password", "account", "checkout", "sitemap"
];

app.use("/css", express.static(path.join(ROOT, "css")));
app.use("/js", express.static(path.join(ROOT, "js")));

pages.forEach((name) => {
  const file = path.join(ROOT, name + ".html");
  const send = (_req, res) => res.sendFile(file);
  app.get("/" + name + ".html", send);
  app.get("/" + name, send);
});
app.get("/", (_req, res) => res.sendFile(path.join(ROOT, "index.html")));

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
    "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /account\nDisallow: /checkout\nSitemap: " + SITE + "/sitemap.xml\n"
  );
});

app.get("/sitemap.xml", (_req, res) => {
  const urls = [
    xmlUrl(SITE + "/", "weekly", "1.0"),
    xmlUrl(SITE + "/shop.html", "weekly", "0.9"),
    xmlUrl(SITE + "/guide.html", "monthly", "0.8"),
    xmlUrl(SITE + "/consult.html", "monthly", "0.8"),
    xmlUrl(SITE + "/about.html", "monthly", "0.7"),
    xmlUrl(SITE + "/sitemap.html", "monthly", "0.4"),
    xmlUrl(SITE + "/login.html", "yearly", "0.3"),
    xmlUrl(SITE + "/signup.html", "yearly", "0.3"),
    xmlUrl(SITE + "/find-id.html", "yearly", "0.2"),
    xmlUrl(SITE + "/find-password.html", "yearly", "0.2"),
    xmlUrl(SITE + "/find-id.html", "yearly", "0.2"),
    xmlUrl(SITE + "/find-password.html", "yearly", "0.2")
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
  const saltHex = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, saltHex, 64, SCRYPT);
  return saltHex + ":" + hash.toString("hex");
}

function verifyDjangoPassword(password, encoded) {
  const parts = String(encoded || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;
  const iterations = Number(parts[1]);
  const salt = parts[2];
  let expected;
  try {
    expected = Buffer.from(parts[3], "base64");
  } catch (_e) {
    return false;
  }
  if (!iterations || !salt || !expected.length) return false;
  const actual = crypto.pbkdf2Sync(String(password), salt, iterations, expected.length, "sha256");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function verifyPassword(password, stored) {
  const raw = String(stored || "");
  const cut = raw.indexOf(":");
  if (cut < 1) return false;
  const saltHex = raw.slice(0, cut);
  const hashHex = raw.slice(cut + 1);
  if (!saltHex || !hashHex) return false;
  try {
    const actual = crypto.scryptSync(password, saltHex, 64, SCRYPT);
    const expected = Buffer.from(hashHex, "hex");
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch (_e) {
    return false;
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
  if (IS_PROD) bits.push("Secure");
  res.append("Set-Cookie", bits.join("; "));
}

function clearSession(res) {
  res.append("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function publicUser(user) {
  if (!user) return null;
  const phone = validPhone(normalizePhone(user.phone)) ? user.phone : "";
  return {
    id: user.id,
    name: user.name,
    phone,
    username: user.username || "",
    email: user.email || "",
    address: user.address || "",
    role: user.role || "user"
  };
}

function validUsername(raw) {
  return /^[a-zA-Z가-힣][a-zA-Z0-9가-힣_]{3,19}$/.test(String(raw || "").trim());
}

function safeNext(raw) {
  const value = String(raw || "").trim();
  if (!/^[a-z0-9_-]+\.html(?:[#?].*)?$/i.test(value)) return "/account.html";
  return "/" + value;
}

function setOauth(res, payload) {
  const token = sign(Object.assign({ exp: Date.now() + 10 * 60 * 1000 }, payload));
  const bits = ["hm_oauth=" + token, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=600"];
  if (IS_PROD) bits.push("Secure");
  res.append("Set-Cookie", bits.join("; "));
}

function clearOauth(res) {
  res.append("Set-Cookie", "hm_oauth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
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

async function currentUser(req) {
  const payload = unsign(parseCookies(req)[COOKIE]);
  if (!payload) return null;
  return db.findUserById(payload.uid);
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
  if (now - row.t > 10 * 60 * 1000) {
    row.n = 0;
    row.t = now;
  }
  row.n += 1;
  loginHits.set(ip, row);
  return row.n > 12;
}

app.get("/api/me", async (req, res) => {
  res.json({ user: publicUser(await currentUser(req)) });
});

app.patch("/api/me", requireUser, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  const address = String(req.body.address || "").trim().slice(0, 200);
  const password = String(req.body.password || "");
  const current = String(req.body.currentPassword || "");
  if (name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  const taken = await db.findUserByPhone(phone);
  if (taken && taken.id !== req.user.id) {
    return res.status(409).json({ error: "이미 사용 중인 휴대폰 번호입니다." });
  }
  if (password) {
    if (password.length < 8) return res.status(400).json({ error: "새 비밀번호는 8자 이상이어야 합니다." });
    if (!verifyPassword(current, req.user.passwordHash)) {
      return res.status(400).json({ error: "현재 비밀번호가 일치하지 않습니다." });
    }
    await db.updatePassword(req.user.id, hashPassword(password));
  }
  await db.updateBuyerProfile(req.user.id, { name, phone, address });
  res.json({ user: publicUser(await db.findUserById(req.user.id)) });
});

app.post("/api/signup", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const username = String(req.body.username || "").trim();
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");
  if (!validUsername(username)) return res.status(400).json({ error: "아이디는 4~20자의 영문·숫자·한글만 가능합니다." });
  if (name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  if (password.length < 8) return res.status(400).json({ error: "비밀번호는 8자 이상이어야 합니다." });
  if (await db.findUserByUsername(username)) {
    return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
  }
  if (await db.findUserByPhone(phone)) {
    return res.status(409).json({ error: "이미 가입된 휴대폰 번호입니다." });
  }
  const user = {
    id: "u_" + crypto.randomUUID(),
    name,
    username,
    phone,
    passwordHash: hashPassword(password),
    role: process.env.ADMIN_PHONE && normalizePhone(process.env.ADMIN_PHONE) === phone ? "admin" : "user",
    heriumLinked: false,
    heriumRelation: "",
    heriumNote: "herium_username=" + username,
    createdAt: new Date().toISOString()
  };
  await db.createUser(user);
  setSession(res, user.id);
  res.json({ user: publicUser(user) });
});

async function linkHeriumLogin(login, password, sharedUser) {
  const herium = db.findHeriumAccount(login);
  if (!herium || !herium.isActive) return null;
  if (herium.status === "suspended" || herium.status === "withdrawn") return null;
  if (!verifyDjangoPassword(password, herium.password)) return null;
  if (!validPhone(herium.phone)) return null;
  const passwordHash = hashPassword(password);
  const samePerson = (user) => {
    if (!user) return false;
    const samePhone = normalizePhone(user.phone) === herium.phone;
    const sameId = String(user.username || "").toLowerCase() === herium.username.toLowerCase();
    return samePhone || sameId;
  };
  if (sharedUser && !samePerson(sharedUser)) return null;
  const target = sharedUser && samePerson(sharedUser) ? sharedUser : await db.findUserByPhone(herium.phone);
  if (target) {
    await db.updatePassword(target.id, passwordHash);
    await db.setUsername(target.id, herium.username);
    if (herium.name) await db.setGuardianName(target.id, herium.name);
    return db.findUserById(target.id);
  }
  const created = {
    id: "u_" + crypto.randomUUID(),
    name: "",
    username: herium.username,
    phone: herium.phone,
    passwordHash,
    role: herium.isStaff || herium.role === "admin" ? "admin" : "user",
    heriumLinked: true,
    guardianName: String(herium.name || "").slice(0, 40),
    heriumRelation: "",
    heriumNote: "herium_username=" + herium.username,
    createdAt: new Date().toISOString()
  };
  try {
    await db.createUser(created);
    return created;
  } catch (_err) {
    const again = await db.findUserByPhone(herium.phone);
    if (!again) return null;
    await db.updatePassword(again.id, passwordHash);
    await db.setUsername(again.id, herium.username);
    return db.findUserById(again.id);
  }
}

app.post("/api/login", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (tooMany(ip)) return res.status(429).json({ error: "잠시 후 다시 시도해 주세요." });
  const login = String(req.body.login || req.body.username || req.body.phone || "").trim();
  const password = String(req.body.password || "");
  const user = await db.findUserByLogin(login);
  if (user && verifyPassword(password, user.passwordHash)) {
    setSession(res, user.id);
    return res.json({ user: publicUser(user) });
  }
  const linked = await linkHeriumLogin(login, password, user);
  if (!linked) {
    return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }
  setSession(res, linked.id);
  res.json({ user: publicUser(linked) });
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
  const herium = db.findHeriumByNamePhone(name, phone);
  if (!herium || herium.status === "suspended" || herium.status === "withdrawn" || !herium.isActive) {
    return res.status(404).json({ error: "일치하는 회원 정보가 없습니다." });
  }
  res.json({ username: herium.username || "", phone: herium.phone });
});

app.post("/api/reset-password", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const login = String(req.body.login || req.body.username || "").trim();
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");
  if (name.length < 2 || !login || !validPhone(phone)) {
    return res.status(400).json({ error: "아이디, 이름, 휴대폰 번호를 확인해 주세요." });
  }
  if (password.length < 8) return res.status(400).json({ error: "새 비밀번호는 8자 이상이어야 합니다." });
  const user = await db.findUserByLogin(login);
  if (!user || !sameName(user.name, name) || normalizePhone(user.phone) !== phone) {
    return res.status(404).json({ error: "일치하는 회원 정보가 없습니다." });
  }
  await db.updatePassword(user.id, hashPassword(password));
  res.json({ ok: true });
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
    setSession(res, user.id);
    res.redirect(payload.next || "/account.html");
  } catch (err) {
    fail(err.message || "소셜 로그인에 실패했습니다.");
  }
});

app.post("/api/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

function unitPrice(product) {
  return catalog.isWelfare(product) ? catalog.copay(product.price) : product.price;
}

function buildItems(rawItems) {
  const items = [];
  let total = 0;
  (rawItems || []).forEach((row) => {
    const product = catalog.productById(row.id);
    const qty = Math.max(1, Math.min(20, Number(row.qty) || 1));
    if (!product) return;
    const unit = unitPrice(product);
    const line = unit * qty;
    total += line;
    items.push({
      id: product.id,
      name: product.name,
      qty,
      unit,
      total: line,
      group: catalog.productGroup(product),
      mode: product.mode
    });
  });
  return { items, total };
}

app.post("/api/orders", async (req, res) => {
  const user = await currentUser(req);
  const type = req.body.type === "consult" ? "consult" : "order";
  const name = String(req.body.name || (user && user.name) || "").trim();
  const phone = normalizePhone(req.body.phone || (user && user.phone) || "");
  const address = String(req.body.address || "").trim();
  const memo = String(req.body.memo || "").trim().slice(0, 1000);
  const topics = Array.isArray(req.body.topics) ? req.body.topics.map((t) => String(t).slice(0, 40)).slice(0, 12) : [];

  if (type !== "order" && name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  if (type === "order" && address.length < 5) return res.status(400).json({ error: "배송·설치 주소를 입력해 주세요." });

  const built = buildItems(req.body.items);
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
  res.json({
    orders: list.map((o) => ({
      id: o.id,
      number: o.number,
      type: o.type,
      name: o.name,
      phone: o.phone,
      address: o.address,
      memo: o.memo,
      topics: o.topics || [],
      items: o.items,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt
    }))
  });
});

app.patch("/api/orders/:id", requireUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "관리자만 변경할 수 있습니다." });
  const allowed = ["received", "reviewing", "confirmed", "cancelled"];
  const status = String(req.body.status || "");
  if (allowed.indexOf(status) < 0) return res.status(400).json({ error: "상태 값이 올바르지 않습니다." });
  const order = await db.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  res.json({ ok: true, status });
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "없는 요청입니다." });
  res.status(404).sendFile(path.join(ROOT, "index.html"));
});

db.init().then(() => {
  app.listen(PORT, () => {
    console.log("현대 의료기 서버 http://localhost:" + PORT);
  });
}).catch((err) => {
  console.error("DB 시작 실패:", err);
  process.exit(1);
});
