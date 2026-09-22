const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");
const express = require("express");
const store = require("./server/store");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const SECRET = process.env.SESSION_SECRET || "hyundai-medical-dev-secret";
const COOKIE = "hm_session";
const IS_PROD = process.env.NODE_ENV === "production";

const catalog = vm.runInNewContext(
  fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8") + "\n({ PRODUCTS, GROUPS, CATEGORIES, copay, productById, productGroup, isWelfare })"
);
const SITE = (process.env.SITE_URL || "https://hyundaimedi.com").replace(/\/$/, "");

store.ensure();

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "200kb" }));

const pages = [
  "index", "shop", "product", "guide", "consult", "about",
  "login", "signup", "account", "checkout", "sitemap"
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

function xmlUrl(loc, changefreq, priority) {
  return [
    "  <url>",
    "    <loc>" + loc + "</loc>",
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
    xmlUrl(SITE + "/signup.html", "yearly", "0.3")
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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

function verifyPassword(password, stored) {
  const parts = String(stored || "").split(":");
  if (parts.length !== 2) return false;
  const test = crypto.scryptSync(password, parts[0], 64);
  const real = Buffer.from(parts[1], "hex");
  if (test.length !== real.length) return false;
  return crypto.timingSafeEqual(test, real);
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
  res.setHeader("Set-Cookie", bits.join("; "));
}

function clearSession(res) {
  res.setHeader("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, phone: user.phone, role: user.role || "user" };
}

function currentUser(req) {
  const payload = unsign(parseCookies(req)[COOKIE]);
  if (!payload) return null;
  return store.users().find((u) => u.id === payload.uid) || null;
}

function requireUser(req, res, next) {
  const user = currentUser(req);
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

app.get("/api/me", (req, res) => {
  res.json({ user: publicUser(currentUser(req)) });
});

app.post("/api/signup", (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");
  if (name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  if (password.length < 8) return res.status(400).json({ error: "비밀번호는 8자 이상이어야 합니다." });
  const list = store.users();
  if (list.some((u) => u.phone === phone)) {
    return res.status(409).json({ error: "이미 가입된 휴대폰 번호입니다." });
  }
  const user = {
    id: "u_" + crypto.randomUUID(),
    name,
    phone,
    passwordHash: hashPassword(password),
    role: process.env.ADMIN_PHONE && normalizePhone(process.env.ADMIN_PHONE) === phone ? "admin" : "user",
    createdAt: new Date().toISOString()
  };
  list.push(user);
  store.saveUsers(list);
  setSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post("/api/login", (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (tooMany(ip)) return res.status(429).json({ error: "잠시 후 다시 시도해 주세요." });
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");
  const user = store.users().find((u) => u.phone === phone);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "휴대폰 번호 또는 비밀번호가 올바르지 않습니다." });
  }
  setSession(res, user.id);
  res.json({ user: publicUser(user) });
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

app.post("/api/orders", (req, res) => {
  const user = currentUser(req);
  const type = req.body.type === "consult" ? "consult" : "order";
  const name = String(req.body.name || (user && user.name) || "").trim();
  const phone = normalizePhone(req.body.phone || (user && user.phone) || "");
  const address = String(req.body.address || "").trim();
  const memo = String(req.body.memo || "").trim().slice(0, 1000);
  const topics = Array.isArray(req.body.topics) ? req.body.topics.map((t) => String(t).slice(0, 40)).slice(0, 12) : [];

  if (name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
  if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
  if (type === "order" && !user) return res.status(401).json({ error: "주문은 로그인 후 가능합니다." });
  if (type === "order" && address.length < 5) return res.status(400).json({ error: "배송·설치 주소를 입력해 주세요." });

  const built = buildItems(req.body.items);
  if (type === "order" && !built.items.length) return res.status(400).json({ error: "주문할 상품이 없습니다." });

  const order = {
    id: "o_" + crypto.randomUUID(),
    number: "HM" + Date.now().toString().slice(-10),
    userId: user ? user.id : null,
    type,
    name,
    phone,
    address,
    memo,
    topics,
    items: built.items,
    total: built.total,
    status: "received",
    createdAt: new Date().toISOString()
  };
  const list = store.orders();
  list.unshift(order);
  store.saveOrders(list);
  res.json({ order: { id: order.id, number: order.number, status: order.status } });
});

app.get("/api/orders", requireUser, (req, res) => {
  const all = store.orders();
  const list = req.user.role === "admin" ? all : all.filter((o) => o.userId === req.user.id);
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

app.patch("/api/orders/:id", requireUser, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "관리자만 변경할 수 있습니다." });
  const allowed = ["received", "reviewing", "confirmed", "cancelled"];
  const status = String(req.body.status || "");
  if (allowed.indexOf(status) < 0) return res.status(400).json({ error: "상태 값이 올바르지 않습니다." });
  const list = store.orders();
  const order = list.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  order.status = status;
  store.saveOrders(list);
  res.json({ ok: true, status });
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "없는 요청입니다." });
  res.status(404).sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log("현대 의료기 서버 http://localhost:" + PORT);
});
