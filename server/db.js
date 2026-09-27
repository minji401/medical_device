const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { encryptText, decryptText } = require("./pii");

const DATA_DIR = path.join(__dirname, "data");
const SQLITE_FILE = path.join(DATA_DIR, "hyundai.db");
const JSON_USERS = path.join(DATA_DIR, "users.json");
const JSON_ORDERS = path.join(DATA_DIR, "orders.json");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  herium_linked INTEGER NOT NULL DEFAULT 0,
  herium_relation TEXT,
  herium_note TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  user_id TEXT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  topics TEXT NOT NULL DEFAULT '[]',
  items TEXT NOT NULL DEFAULT '[]',
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
`;

let driver = null;
let sqlite = null;
let pool = null;

function toPg(sql) {
  let n = 0;
  return sql.replace(/\?/g, () => "$" + (++n));
}

async function exec(sql, params) {
  const values = params || [];
  if (driver === "pg") {
    const result = await pool.query(toPg(sql), values);
    return result.rows || [];
  }
  const trimmed = sql.trim();
  if (/^select/i.test(trimmed)) return sqlite.prepare(sql).all(...values);
  sqlite.prepare(sql).run(...values);
  return [];
}

async function withTransaction(work) {
  if (driver === "pg") {
    const client = await pool.connect();
    const txExec = async (sql, params) => {
      const result = await client.query(toPg(sql), params || []);
      return { rows: result.rows || [], changes: result.rowCount || 0 };
    };
    try {
      await client.query("BEGIN");
      const out = await work(txExec);
      await client.query("COMMIT");
      return out;
    } catch (err) {
      try { await client.query("ROLLBACK"); } catch (_e) {}
      throw err;
    } finally {
      client.release();
    }
  }
  sqlite.exec("BEGIN IMMEDIATE");
  const txExec = async (sql, params) => {
    const values = params || [];
    const trimmed = String(sql).trim();
    if (/^select/i.test(trimmed)) {
      const rows = sqlite.prepare(sql).all(...values);
      return { rows, changes: rows.length };
    }
    const info = sqlite.prepare(sql).run(...values);
    return { rows: [], changes: info.changes || 0 };
  };
  try {
    const out = await work(txExec);
    sqlite.exec("COMMIT");
    return out;
  } catch (err) {
    try { sqlite.exec("ROLLBACK"); } catch (_e) {}
    throw err;
  }
}

async function runScript(script) {
  const parts = script.split(";").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) await exec(part);
}

function usernameFromNote(note) {
  const parts = String(note || "").split(";");
  for (const part of parts) {
    const item = part.trim();
    const key = "herium_username=";
    if (item.toLowerCase().startsWith(key)) return item.slice(key.length).trim();
  }
  return "";
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    username: row.username || usernameFromNote(row.herium_note),
    email: row.email || "",
    passwordHash: row.password_hash || row.password || "",
    role: row.role || "user",
    heriumLinked: Boolean(Number(row.herium_linked)),
    heriumRelation: row.herium_relation || "",
    heriumNote: row.herium_note || "",
    guardianName: row.guardian_name || "",
    address: row.address || "",
    loginFailures: Number(row.login_failures) || 0,
    loginLockedUntil: row.login_locked_until || "",
    kakaoId: row.kakao_id || "",
    naverId: row.naver_id || "",
    googleId: row.google_id || "",
    createdAt: row.created_at
  };
}

function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    number: row.number,
    userId: row.user_id,
    type: row.type,
    name: decryptText(row.name),
    phone: decryptText(row.phone),
    address: decryptText(row.address || ""),
    memo: decryptText(row.memo || ""),
    topics: JSON.parse(row.topics || "[]"),
    items: JSON.parse(row.items || "[]"),
    total: Number(row.total) || 0,
    status: normalizeStatus(row.status),
    createdAt: row.created_at
  };
}

function normalizeStatus(status) {
  return {
    received: "PENDING",
    reviewing: "PREPARING",
    confirmed: "PREPARING",
    cancelled: "CANCELED"
  }[status] || status || "PENDING";
}

async function migrateJson() {
  const existing = await exec("SELECT id FROM users LIMIT 1");
  if (existing.length) return;
  if (!fs.existsSync(JSON_USERS) && !fs.existsSync(JSON_ORDERS)) return;
  try {
    const users = fs.existsSync(JSON_USERS) ? JSON.parse(fs.readFileSync(JSON_USERS, "utf8")) : [];
    for (const u of users) {
      await createUser({
        id: u.id,
        name: u.name,
        phone: u.phone,
        passwordHash: u.passwordHash,
        role: u.role || "user",
        heriumLinked: false,
        heriumRelation: "",
        heriumNote: "",
        createdAt: u.createdAt || new Date().toISOString()
      });
    }
    const orders = fs.existsSync(JSON_ORDERS) ? JSON.parse(fs.readFileSync(JSON_ORDERS, "utf8")) : [];
    for (const o of orders) await createOrder(o);
    console.log("JSON 회원·주문을 DB로 옮겼습니다.");
  } catch (err) {
    console.error("JSON 이전 실패:", err.message);
  }
}

async function init() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = require("pg");
    pool = new Pool({
      connectionString: url,
      ssl: url.indexOf("localhost") >= 0 || url.indexOf("127.0.0.1") >= 0
        ? false
        : { rejectUnauthorized: false }
    });
    driver = "pg";
    await runScript(SCHEMA);
    console.log("DB: PostgreSQL");
  } else {
    const Database = require("better-sqlite3");
    sqlite = new Database(SQLITE_FILE);
    sqlite.pragma("journal_mode = WAL");
    sqlite.exec(SCHEMA);
    driver = "sqlite";
    if (process.env.NODE_ENV === "production") {
      console.warn("DATABASE_URL이 없습니다. SQLite 파일은 재배포 시 지워질 수 있습니다.");
    } else {
      console.log("DB: SQLite " + SQLITE_FILE);
    }
  }
  await migrateJson();
  await ensureColumns();
  await exec(
    `CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    )`
  );
  await exec(
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      toss_order_id TEXT NOT NULL UNIQUE,
      payment_key TEXT,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      method TEXT,
      stock_held INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      approved_at TEXT
    )`
  );
  await exec(
    `CREATE TABLE IF NOT EXISTS product_stock (
      product_id TEXT PRIMARY KEY,
      qty INTEGER NOT NULL
    )`
  );
  await exec(
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )`
  );
  await exec(
    `CREATE TABLE IF NOT EXISTS password_help_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name_enc TEXT NOT NULL,
      phone_enc TEXT NOT NULL,
      site TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      closed_at TEXT
    )`
  );
}

function sealOrder(order) {
  return {
    name: encryptText(order.name),
    phone: encryptText(order.phone),
    address: encryptText(order.address || ""),
    memo: encryptText(order.memo || "")
  };
}

async function writeAudit(actor, action, target, ip) {
  await exec(
    "INSERT INTO audit_logs (id, actor, action, target, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      "aud_" + crypto.randomUUID(),
      String(actor || "").slice(0, 80),
      String(action || "").slice(0, 80),
      String(target || "").slice(0, 120),
      String(ip || "").slice(0, 64),
      new Date().toISOString()
    ]
  );
}

async function findUserById(id) {
  const rows = await exec("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return mapUser(rows[0]);
}

async function ensureColumns() {
  const cols = [
    ["username", "TEXT"],
    ["email", "TEXT"],
    ["kakao_id", "TEXT"],
    ["naver_id", "TEXT"],
    ["google_id", "TEXT"],
    ["herium_linked", "INTEGER"],
    ["herium_relation", "TEXT"],
    ["herium_note", "TEXT"],
    ["guardian_name", "TEXT"],
    ["address", "TEXT"],
    ["login_failures", "INTEGER NOT NULL DEFAULT 0"],
    ["login_locked_until", "TEXT"]
  ];
  for (const [name, type] of cols) {
    try {
      if (driver === "pg") await exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS " + name + " " + type);
      else await exec("ALTER TABLE users ADD COLUMN " + name + " " + type);
    } catch (_e) {}
  }
}

async function findUserByPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  const dashed = digits.length === 11
    ? digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7)
    : digits.length === 10
      ? digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6)
      : digits;
  const intl = digits.charAt(0) === "0" ? "+82" + digits.slice(1) : digits;
  const rows = await exec(
    "SELECT * FROM users WHERE phone = ? OR phone = ? OR phone = ? OR phone = ? LIMIT 1",
    [digits, dashed, String(phone || "").trim(), intl]
  );
  return mapUser(rows[0]);
}

async function findUserByUsername(username) {
  const login = String(username || "").trim();
  if (!login) return null;
  const rows = await exec("SELECT * FROM users WHERE lower(username) = lower(?) LIMIT 1", [login]);
  if (rows[0]) return mapUser(rows[0]);
  const noted = await exec("SELECT * FROM users WHERE herium_note LIKE ?", ["%herium_username=%"]);
  const hit = noted.find((row) => usernameFromNote(row.herium_note).toLowerCase() === login.toLowerCase());
  if (!hit) return null;
  const parsed = usernameFromNote(hit.herium_note);
  if (!hit.username && parsed) {
    await exec("UPDATE users SET username = ? WHERE id = ? AND (username IS NULL OR username = '')", [parsed, hit.id]);
    hit.username = parsed;
  }
  return mapUser(hit);
}

function heriumDbPath() {
  return path.join(__dirname, "..", "..", "홈페이지", "db.sqlite3");
}

function withHerium(read) {
  if (driver !== "sqlite") return null;
  const file = heriumDbPath();
  if (!fs.existsSync(file)) return null;
  let herium = null;
  try {
    const Database = require("better-sqlite3");
    herium = new Database(file, { readonly: true, fileMustExist: true, timeout: 5000 });
    return read(herium);
  } catch (err) {
    console.error("herium sqlite read failed:", err.message);
    return null;
  } finally {
    if (herium) herium.close();
  }
}

function heriumSelect(herium) {
  const cols = herium.prepare("PRAGMA table_info(accounts_profile)").all().map((col) => col.name);
  const role = cols.includes("role") ? "p.role" : "'member'";
  const status = cols.includes("status") ? "p.status" : "'active'";
  return herium.prepare(
    "SELECT u.username, u.password, u.first_name, u.is_active, u.is_staff, " +
    "p.name AS profile_name, p.phone AS profile_phone, " +
    role + " AS profile_role, " + status + " AS profile_status " +
    "FROM auth_user u LEFT JOIN accounts_profile p ON p.user_id = u.id"
  ).all();
}

function mapHerium(row) {
  if (!row) return null;
  return {
    username: row.username || "",
    password: row.password || "",
    name: row.profile_name || row.first_name || row.username || "",
    phone: String(row.profile_phone || "").replace(/\D/g, ""),
    isActive: Number(row.is_active) === 1,
    isStaff: Number(row.is_staff) === 1,
    role: row.profile_role || "member",
    status: row.profile_status || "active"
  };
}

function findHeriumAccount(login) {
  const loginId = String(login || "").trim();
  const digits = loginId.replace(/\D/g, "");
  return withHerium((herium) => {
    const hit = heriumSelect(herium).find((row) => {
      if (String(row.username || "").toLowerCase() === loginId.toLowerCase()) return true;
      const phone = String(row.profile_phone || "").replace(/\D/g, "");
      return /^01[016789]\d{7,8}$/.test(digits) && phone === digits;
    });
    return mapHerium(hit);
  });
}

function findHeriumByNamePhone(name, phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const wanted = String(name || "").replace(/\s/g, "");
  if (!digits || !wanted) return null;
  return withHerium((herium) => {
    const hit = heriumSelect(herium).find((row) => {
      const rowName = String(row.profile_name || row.first_name || "").replace(/\s/g, "");
      const rowPhone = String(row.profile_phone || "").replace(/\D/g, "");
      return rowName === wanted && rowPhone === digits;
    });
    return mapHerium(hit);
  });
}

async function setUsername(id, username) {
  const login = String(username || "").trim();
  if (!id || !login) return;
  await exec("UPDATE users SET username = ? WHERE id = ? AND (username IS NULL OR username = '')", [login, id]);
}

async function findUserByLogin(raw) {
  const login = String(raw || "").trim();
  const phone = login.replace(/\D/g, "");
  if (/^01[016789]\d{7,8}$/.test(phone)) {
    const byPhone = await findUserByPhone(phone);
    if (byPhone) return byPhone;
  }
  return findUserByUsername(login);
}

async function findUserBySocial(provider, socialId) {
  const col = { kakao: "kakao_id", naver: "naver_id", google: "google_id" }[provider];
  if (!col || !socialId) return null;
  const rows = await exec("SELECT * FROM users WHERE " + col + " = ? LIMIT 1", [String(socialId)]);
  return mapUser(rows[0]);
}

async function findUserByEmail(email) {
  const value = String(email || "").trim();
  if (!value) return null;
  const rows = await exec("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1", [value]);
  return mapUser(rows[0]);
}

async function linkSocial(id, provider, socialId) {
  const col = { kakao: "kakao_id", naver: "naver_id", google: "google_id" }[provider];
  if (!col) return;
  await exec("UPDATE users SET " + col + " = ? WHERE id = ?", [String(socialId), id]);
}

async function updatePassword(id, passwordHash) {
  await exec("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

async function updateBuyerProfile(id, fields) {
  await exec(
    "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?",
    [fields.name, fields.phone, fields.address || "", id]
  );
  if (Object.prototype.hasOwnProperty.call(fields, "email")) {
    await exec("UPDATE users SET email = ? WHERE id = ?", [fields.email || null, id]);
  }
}

async function setGuardianName(id, guardianName) {
  const name = String(guardianName || "").trim();
  if (!id || !name) return;
  await exec("UPDATE users SET guardian_name = ?, herium_linked = 1 WHERE id = ?", [name, id]);
}

async function findUserByNamePhone(name, phone) {
  const rows = await exec("SELECT * FROM users WHERE name = ? AND phone = ? LIMIT 1", [name, phone]);
  return mapUser(rows[0]);
}

async function createUser(user) {
  await exec(
    `INSERT INTO users (id, name, phone, password_hash, role, herium_linked, herium_relation, herium_note, created_at, username, email, kakao_id, naver_id, google_id, guardian_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.name,
      user.phone,
      user.passwordHash,
      user.role || "user",
      user.heriumLinked ? 1 : 0,
      user.heriumRelation || "",
      user.heriumNote || "",
      user.createdAt,
      user.username || null,
      user.email || null,
      user.kakaoId || null,
      user.naverId || null,
      user.googleId || null,
      user.guardianName || null
    ]
  );
  return user;
}

async function clearLoginFailure(id) {
  await exec("UPDATE users SET login_failures = 0, login_locked_until = NULL WHERE id = ?", [id]);
}

function lockMessage(user) {
  if (!user || !user.loginLockedUntil) return "";
  const left = new Date(user.loginLockedUntil).getTime() - Date.now();
  if (!left || left <= 0) return "";
  const minutes = Math.max(1, Math.ceil(left / 60000));
  return "비밀번호를 5회 연속으로 틀려 로그인이 잠겼습니다. 약 " + minutes + "분 뒤에 다시 시도해 주세요.";
}

async function noteLoginFailure(id, currentCount) {
  const next = (Number(currentCount) || 0) + 1;
  if (next >= 5) {
    const until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await exec("UPDATE users SET login_failures = ?, login_locked_until = ? WHERE id = ?", [next, until, id]);
    return { locked: true, until };
  }
  await exec("UPDATE users SET login_failures = ? WHERE id = ?", [next, id]);
  return { locked: false };
}

async function issueResetToken(userId) {
  const raw = crypto.randomBytes(32).toString("base64url");
  const digest = crypto.createHash("sha256").update(raw).digest("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const nowS = now.toISOString();
  await exec("UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL", [nowS, userId]);
  await exec(
    "INSERT INTO password_resets (id, user_id, token_hash, expires_at, used_at, created_at) VALUES (?, ?, ?, ?, NULL, ?)",
    ["pr_" + crypto.randomUUID().replace(/-/g, ""), userId, digest, expires, nowS]
  );
  return raw;
}

async function takeResetToken(raw) {
  if (!raw) return null;
  const digest = crypto.createHash("sha256").update(String(raw)).digest("hex");
  const rows = await exec(
    "SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ? LIMIT 1",
    [digest]
  );
  const row = rows[0];
  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;
  const nowS = new Date().toISOString();
  if (driver === "pg") {
    const updated = await pool.query(
      "UPDATE password_resets SET used_at = $1 WHERE id = $2 AND used_at IS NULL RETURNING id",
      [nowS, row.id]
    );
    if (!updated.rows.length) return null;
  } else {
    const info = sqlite.prepare("UPDATE password_resets SET used_at = ? WHERE id = ? AND used_at IS NULL").run(nowS, row.id);
    if (!info.changes) return null;
  }
  return row.user_id;
}

async function createOrder(order) {
  const sealed = sealOrder(order);
  await exec(
    `INSERT INTO orders (id, number, user_id, type, name, phone, address, memo, topics, items, total, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.id,
      order.number,
      order.userId || null,
      order.type,
      sealed.name,
      sealed.phone,
      sealed.address,
      sealed.memo,
      JSON.stringify(order.topics || []),
      JSON.stringify(order.items || []),
      order.total || 0,
      order.status || "received",
      order.createdAt
    ]
  );
  return order;
}

async function listOrders(opts) {
  const all = opts && opts.all;
  const userId = opts && opts.userId;
  const rows = all
    ? await exec("SELECT * FROM orders ORDER BY created_at DESC")
    : await exec("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId]);
  return rows.map(mapOrder);
}

async function findOrderById(id) {
  const rows = await exec("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  return mapOrder(rows[0]);
}

async function findOrderByNumber(number) {
  const rows = await exec("SELECT * FROM orders WHERE number = ? LIMIT 1", [number]);
  return mapOrder(rows[0]);
}

function mapPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    tossOrderId: row.toss_order_id,
    paymentKey: row.payment_key || "",
    amount: Number(row.amount) || 0,
    status: row.status,
    method: row.method || "",
    stockHeld: Number(row.stock_held) === 1,
    createdAt: row.created_at,
    approvedAt: row.approved_at || ""
  };
}

async function findPaymentByTossOrderId(tossOrderId) {
  const rows = await exec("SELECT * FROM payments WHERE toss_order_id = ? LIMIT 1", [tossOrderId]);
  return mapPayment(rows[0]);
}

async function createPendingCheckout(order, items) {
  return withTransaction(async (tx) => {
    let held = false;
    for (const item of items) {
      const found = await tx("SELECT qty FROM product_stock WHERE product_id = ?", [item.id]);
      if (!found.rows.length) continue;
      const updated = await tx(
        "UPDATE product_stock SET qty = qty - ? WHERE product_id = ? AND qty >= ?",
        [item.qty, item.id, item.qty]
      );
      if (!updated.changes) {
        const err = new Error("재고가 부족한 상품이 있습니다.");
        err.status = 409;
        throw err;
      }
      held = true;
    }
    const sealed = sealOrder(order);
    await tx(
      `INSERT INTO orders (id, number, user_id, type, name, phone, address, memo, topics, items, total, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.number,
        order.userId || null,
        order.type,
        sealed.name,
        sealed.phone,
        sealed.address,
        sealed.memo,
        JSON.stringify(order.topics || []),
        JSON.stringify(order.items || []),
        order.total || 0,
        "PENDING",
        order.createdAt
      ]
    );
    await tx(
      `INSERT INTO payments (id, order_id, toss_order_id, payment_key, amount, status, method, stock_held, created_at, approved_at)
       VALUES (?, ?, ?, NULL, ?, 'PENDING', NULL, ?, ?, NULL)`,
      ["pay_" + crypto.randomUUID(), order.id, order.number, order.total || 0, held ? 1 : 0, order.createdAt]
    );
    return { stockHeld: held };
  });
}

async function applyPaymentResult(tossOrderId, next) {
  return withTransaction(async (tx) => {
    const orderRows = await tx("SELECT * FROM orders WHERE number = ? LIMIT 1", [tossOrderId]);
    const payRows = await tx("SELECT * FROM payments WHERE toss_order_id = ? LIMIT 1", [tossOrderId]);
    if (!orderRows.rows[0] || !payRows.rows[0]) return null;
    const order = mapOrder(orderRows.rows[0]);
    const payment = mapPayment(payRows.rows[0]);
    const fulfillment = ["PREPARING", "SHIPPED", "DELIVERED"];
    let orderStatus = next.orderStatus;
    if (fulfillment.indexOf(order.status) >= 0 && orderStatus === "PAID") orderStatus = order.status;
    if (next.releaseStock && Number(payRows.rows[0].stock_held) === 1) {
      for (const item of order.items || []) {
        const found = await tx("SELECT qty FROM product_stock WHERE product_id = ?", [item.id]);
        if (!found.rows.length) continue;
        await tx("UPDATE product_stock SET qty = qty + ? WHERE product_id = ?", [item.qty, item.id]);
      }
      await tx("UPDATE payments SET stock_held = 0 WHERE id = ?", [payment.id]);
    }
    await tx("UPDATE orders SET status = ? WHERE id = ?", [orderStatus, order.id]);
    await tx(
      "UPDATE payments SET status = ?, payment_key = COALESCE(?, payment_key), method = COALESCE(?, method), approved_at = COALESCE(?, approved_at) WHERE id = ?",
      [next.paymentStatus, next.paymentKey || null, next.method || null, next.approvedAt || null, payment.id]
    );
    return { id: order.id, status: orderStatus, amount: payment.amount };
  });
}

async function updateOrderStatus(id, status) {
  const rows = await exec("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) return null;
  await exec("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  return mapOrder(Object.assign({}, rows[0], { status: status }));
}

async function findNoEmailMember(name, phone) {
  const user = await findUserByPhone(phone);
  if (!user || String(user.email || "").trim()) return null;
  const wanted = String(name || "").replace(/\s/g, "");
  const names = [user.name, user.guardianName]
    .map((value) => String(value || "").replace(/\s/g, ""))
    .filter(Boolean);
  if (names.indexOf(wanted) < 0) return null;
  return user;
}

async function openPasswordHelp(userId, name, phone, site) {
  const existing = await exec(
    "SELECT id FROM password_help_requests WHERE user_id = ? AND status = 'open' LIMIT 1",
    [userId]
  );
  if (existing[0]) return;
  await exec(
    `INSERT INTO password_help_requests (id, user_id, name_enc, phone_enc, site, status, created_at, closed_at)
     VALUES (?, ?, ?, ?, ?, 'open', ?, NULL)`,
    [
      "ph_" + crypto.randomUUID().replace(/-/g, ""),
      userId,
      encryptText(name),
      encryptText(phone),
      site,
      new Date().toISOString()
    ]
  );
}

function mapHelp(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: decryptText(row.name_enc),
    phone: decryptText(row.phone_enc),
    site: row.site,
    createdAt: row.created_at
  };
}

async function listPasswordHelp() {
  const rows = await exec("SELECT * FROM password_help_requests WHERE status = 'open' ORDER BY created_at DESC");
  return rows.map(mapHelp);
}

async function findOpenPasswordHelp(id) {
  const rows = await exec(
    "SELECT * FROM password_help_requests WHERE id = ? AND status = 'open' LIMIT 1",
    [id]
  );
  return mapHelp(rows[0]);
}

async function closePasswordHelp(id) {
  await exec(
    "UPDATE password_help_requests SET status = 'done', closed_at = ? WHERE id = ? AND status = 'open'",
    [new Date().toISOString(), id]
  );
}

module.exports = {
  init,
  findUserById,
  findUserByPhone,
  findUserByUsername,
  findUserByLogin,
  findHeriumAccount,
  findHeriumByNamePhone,
  setUsername,
  findUserBySocial,
  findUserByEmail,
  findUserByNamePhone,
  linkSocial,
  updatePassword,
  updateBuyerProfile,
  setGuardianName,
  clearLoginFailure,
  lockMessage,
  noteLoginFailure,
  issueResetToken,
  takeResetToken,
  createUser,
  createOrder,
  findOrderByNumber,
  findOrderById,
  findPaymentByTossOrderId,
  createPendingCheckout,
  applyPaymentResult,
  listOrders,
  updateOrderStatus,
  writeAudit,
  findNoEmailMember,
  openPasswordHelp,
  listPasswordHelp,
  findOpenPasswordHelp,
  closePasswordHelp
};
