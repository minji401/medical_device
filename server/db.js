const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { encryptText, decryptText } = require("./pii");
const orderModels = require("./orders/models");

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
    marketingAgreed: Number(row.marketing_agreed) === 1,
    age14Agreed: Number(row.age_14_agreed) === 1,
    withdrawnAt: row.withdrawn_at || "",
    kakaoId: row.kakao_id || "",
    naverId: row.naver_id || "",
    googleId: row.google_id || "",
    createdAt: row.created_at
  };
}

function mapOrderItemRow(row) {
  if (!row) return null;
  const qty = Number(row.quantity) || 1;
  const unit = Number(row.unit_price) || 0;
  const subtotal = Number(row.subtotal_amount) || unit * qty;
  return {
    id: row.product_id,
    name: row.product_name,
    qty,
    unit,
    total: subtotal,
    option_text: row.option_text || "",
    product_name: row.product_name,
    unit_price: unit,
    quantity: qty,
    subtotal_amount: subtotal
  };
}

function jsonItems(items) {
  return JSON.stringify((items || []).map((item) => ({
    id: item.id || item.product_id,
    name: item.name || item.product_name,
    qty: item.qty || item.quantity,
    unit: item.unit || item.unit_price,
    total: item.total || item.subtotal_amount,
    option_text: item.option_text || "",
    hygiene: Boolean(item.hygiene || item.isHygiene)
  })));
}

function mapOrder(row) {
  if (!row) return null;
  let items = [];
  try { items = JSON.parse(row.items || "[]"); } catch (_e) { items = []; }
  return {
    id: row.id,
    number: row.number,
    orderId: row.number,
    userId: row.user_id,
    type: row.type,
    name: decryptText(row.name),
    phone: decryptText(row.phone),
    address: decryptText(row.address || ""),
    memo: decryptText(row.memo || row.delivery_memo || ""),
    topics: JSON.parse(row.topics || "[]"),
    items,
    total: Number(row.total_amount != null ? row.total_amount : row.total) || 0,
    totalAmount: Number(row.total_amount != null ? row.total_amount : row.total) || 0,
    orderName: row.order_name || "",
    status: normalizeStatus(row.status),
    recipientName: row.recipient_name || decryptText(row.name),
    recipientPhone: row.recipient_phone || decryptText(row.phone),
    postalCode: row.postal_code || row.zipcode || "",
    zipcode: row.zipcode || row.postal_code || "",
    addressBasic: row.address_basic || decryptText(row.address || ""),
    addressDetail: row.address_detail || "",
    paymentKey: row.payment_key || "",
    paidAt: row.paid_at || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    trackingNumber: row.tracking_number || "",
    carrier: row.carrier || "",
    receiptUrl: row.receipt_url || "",
    paymentMethod: row.payment_method || "",
    shippingFee: Number(row.shipping_fee) || 0,
    cancelReason: row.cancel_reason || "",
    previousStatus: row.previous_status || ""
  };
}

function normalizeStatus(status) {
  return orderModels.normalizeStatus(status);
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
        : { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
      keepAlive: true
    });
    driver = "pg";
    await runScript(SCHEMA);
    console.log("DB: PostgreSQL");
  } else {
    throw new Error("DATABASE_URL이 필요합니다. SQLite는 쓰지 않고 Neon Postgres만 사용합니다.");
  }
  await ensureColumns();
  await require("./shared_schema").apply(exec, driver);
  await migrateJson();
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
  try {
    require("./security_log").event("audit", { actor, action, target, ip: ip || "" });
  } catch (_e) {}
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

function truthyFlag(value) {
  return value === true || value === 1 || value === "1" || value === "t" || value === "true";
}

function heriumSelect(herium) {
  const cols = herium.prepare("PRAGMA table_info(accounts_profile)").all().map((col) => col.name);
  const role = cols.includes("role") ? "p.role" : "'member'";
  const status = cols.includes("status") ? "p.status" : "'active'";
  return herium.prepare(
    "SELECT u.username, u.email, u.password, u.first_name, u.is_active, u.is_staff, u.is_superuser, " +
    "p.name AS profile_name, p.phone AS profile_phone, " +
    role + " AS profile_role, " + status + " AS profile_status " +
    "FROM auth_user u LEFT JOIN accounts_profile p ON p.user_id = u.id"
  ).all();
}

function mapHerium(row) {
  if (!row) return null;
  const staff = truthyFlag(row.is_staff) || truthyFlag(row.is_superuser);
  const profileRole = row.profile_role || "member";
  return {
    username: row.username || "",
    email: row.email || "",
    password: row.password || "",
    name: row.profile_name || row.first_name || row.username || "",
    phone: String(row.profile_phone || "").replace(/\D/g, ""),
    isActive: truthyFlag(row.is_active),
    isStaff: staff,
    isSuperuser: truthyFlag(row.is_superuser),
    role: staff || profileRole === "admin" ? "admin" : profileRole,
    status: row.profile_status || "active"
  };
}

function heriumIsAdmin(herium) {
  if (!herium) return false;
  return Boolean(herium.isStaff || herium.isSuperuser || herium.role === "admin");
}

async function findDjangoAccount(login) {
  const loginId = String(login || "").trim();
  if (!loginId || !pool) return null;
  const digits = loginId.replace(/\D/g, "");
  const phone = /^01[016789]\d{7,8}$/.test(digits) ? digits : "";
  try {
    const result = await pool.query(
      "SELECT u.username, u.email, u.password, u.first_name, u.is_active, u.is_staff, u.is_superuser, " +
      "p.name AS profile_name, p.phone AS profile_phone, p.role AS profile_role, p.status AS profile_status " +
      "FROM auth_user u LEFT JOIN accounts_profile p ON p.user_id = u.id " +
      "WHERE lower(u.username) = lower($1) " +
      "OR (COALESCE(u.email, '') <> '' AND lower(u.email) = lower($1)) " +
      "OR ($2 <> '' AND regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') = $2) " +
      "LIMIT 1",
      [loginId, phone]
    );
    return mapHerium(result.rows[0]);
  } catch (err) {
    console.error("auth_user lookup failed", err && err.message);
    return null;
  }
}

async function findHeriumAccount(login) {
  if (driver === "pg") return findDjangoAccount(login);
  const loginId = String(login || "").trim();
  const digits = loginId.replace(/\D/g, "");
  return withHerium((herium) => {
    const hit = heriumSelect(herium).find((row) => {
      if (String(row.username || "").toLowerCase() === loginId.toLowerCase()) return true;
      if (String(row.email || "").toLowerCase() === loginId.toLowerCase()) return true;
      const phone = String(row.profile_phone || "").replace(/\D/g, "");
      return /^01[016789]\d{7,8}$/.test(digits) && phone === digits;
    });
    return mapHerium(hit);
  });
}

async function findHeriumByNamePhone(name, phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const wanted = String(name || "").replace(/\s/g, "");
  if (!digits || !wanted) return null;
  if (driver === "pg" && pool) {
    try {
      const result = await pool.query(
        "SELECT u.username, u.email, u.password, u.first_name, u.is_active, u.is_staff, u.is_superuser, " +
        "p.name AS profile_name, p.phone AS profile_phone, p.role AS profile_role, p.status AS profile_status " +
        "FROM auth_user u LEFT JOIN accounts_profile p ON p.user_id = u.id " +
        "WHERE regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') = $1 LIMIT 8",
        [digits]
      );
      const hit = result.rows.find((row) => {
        const rowName = String(row.profile_name || row.first_name || "").replace(/\s/g, "");
        return rowName === wanted;
      });
      return mapHerium(hit);
    } catch (err) {
      console.error("auth_user name/phone lookup failed", err && err.message);
      return null;
    }
  }
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
  if (login.indexOf("@") > 0) {
    const byEmail = await findUserByEmail(login);
    if (byEmail) return byEmail;
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

async function setUserRole(id, role) {
  const next = String(role || "user") === "admin" ? "admin" : "user";
  if (!id) return;
  await exec("UPDATE users SET role = ? WHERE id = ?", [next, id]);
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
    `INSERT INTO users (id, name, phone, password_hash, role, herium_linked, herium_relation, herium_note, created_at, username, email, kakao_id, naver_id, google_id, guardian_name, age_14_agreed, marketing_agreed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      user.guardianName || null,
      user.age14 ? 1 : 0,
      user.marketing ? 1 : 0
    ]
  );
  return user;
}

async function listProducts() {
  return exec("SELECT * FROM products ORDER BY created_at DESC");
}

async function findProduct(id) {
  const rows = await exec("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function upsertProduct(row) {
  const found = await findProduct(row.id);
  if (found) {
    await exec(
      `UPDATE products SET name=?, price=?, sale_price=?, stock=?, category=?, thumbnail_url=?, description=?, is_hygiene_product=?, is_active=? WHERE id=?`,
      [row.name, row.price, row.salePrice, row.stock, row.category, row.thumbnail || "", row.description || "", row.isHygiene ? 1 : 0, row.isActive ? 1 : 0, row.id]
    );
  } else {
    await exec(
      `INSERT INTO products (id, name, price, sale_price, stock, category, thumbnail_url, description, is_hygiene_product, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.name, row.price, row.salePrice, row.stock, row.category, row.thumbnail || "", row.description || "", row.isHygiene ? 1 : 0, row.isActive ? 1 : 0, new Date().toISOString()]
    );
  }
  await exec("INSERT INTO product_stock (product_id, qty) VALUES (?, ?) ON CONFLICT (product_id) DO UPDATE SET qty = excluded.qty", [row.id, row.stock]);
  return findProduct(row.id);
}

async function getShopProfile(userId) {
  if (!userId) return null;
  const rows = await exec("SELECT * FROM shop_profiles WHERE user_id = ? LIMIT 1", [userId]);
  return rows[0] || null;
}

async function upsertShopProfile(userId, fields) {
  const id = "sp_" + String(userId).replace(/\W/g, "").slice(-16);
  const found = await exec("SELECT id FROM shop_profiles WHERE user_id = ? LIMIT 1", [userId]);
  const values = [
    fields.recipient_name || "",
    fields.recipient_phone || "",
    fields.zipcode || "",
    fields.address_basic || "",
    fields.address_detail || ""
  ];
  if (found[0]) {
    await exec(
      "UPDATE shop_profiles SET recipient_name=?, recipient_phone=?, zipcode=?, address_basic=?, address_detail=? WHERE user_id=?",
      values.concat([userId])
    );
  } else {
    await exec(
      "INSERT INTO shop_profiles (id, user_id, recipient_name, recipient_phone, zipcode, address_basic, address_detail) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, userId].concat(values)
    );
  }
}

async function withdrawUser(user) {
  const masked = ("w" + String(user.id).replace(/\W/g, "").slice(-10)).padEnd(11, "0").slice(0, 11);
  await exec(
    "UPDATE users SET name='탈퇴회원', guardian_name=NULL, email=NULL, phone=?, password_hash=?, withdrawn_at=? WHERE id=?",
    [masked, user.passwordHash, new Date().toISOString(), user.id]
  );
}

async function companyContent() {
  const rows = await exec("SELECT content_key, content FROM site_contents");
  const out = {};
  rows.forEach((row) => { out[row.content_key] = row.content; });
  return out;
}

async function setCompanyContent(items) {
  for (const [key, value] of Object.entries(items || {})) {
    const found = await exec("SELECT id FROM site_contents WHERE content_key = ? LIMIT 1", [key]);
    if (found[0]) await exec("UPDATE site_contents SET content = ?, updated_at = ? WHERE content_key = ?", [value, new Date().toISOString(), key]);
    else await exec(
      "INSERT INTO site_contents (id, content_key, title, content, image_url, updated_at) VALUES (?, ?, ?, ?, '', ?)",
      ["sc_" + crypto.randomUUID(), key, key, value, new Date().toISOString()]
    );
  }
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

async function attachItems(order) {
  if (!order) return null;
  const prev = {};
  (order.items || []).forEach((item) => { prev[item.id] = item; });
  try {
    const rows = await exec("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    if (rows.length) {
      order.items = rows.map((row) => {
        const item = mapOrderItemRow(row);
        const old = prev[item.id] || {};
        item.hygiene = Boolean(old.hygiene || old.isHygiene);
        return item;
      });
    }
  } catch (_e) {}
  if (!order.orderName) order.orderName = orderModels.orderNameFromItems(order.items);
  return order;
}

async function listOrders(opts) {
  const all = opts && opts.all;
  const userId = opts && opts.userId;
  const status = String((opts && opts.status) || "").trim();
  let rows;
  if (all) {
    if (status === "SHIPPING") {
      rows = await exec("SELECT * FROM orders WHERE status IN ('SHIPPING','SHIPPED') ORDER BY created_at DESC");
    } else if (status === "CANCELLED") {
      rows = await exec("SELECT * FROM orders WHERE status IN ('CANCELLED','CANCELED') ORDER BY created_at DESC");
    } else if (status) {
      rows = await exec("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC", [status]);
    } else {
      rows = await exec("SELECT * FROM orders ORDER BY created_at DESC");
    }
  } else {
    rows = await exec("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId]);
  }
  const orders = [];
  for (const row of rows) orders.push(await attachItems(mapOrder(row)));
  return orders;
}

async function findOrderById(id) {
  const rows = await exec("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  return attachItems(mapOrder(rows[0]));
}

async function findOrderByNumber(number) {
  const rows = await exec("SELECT * FROM orders WHERE number = ? LIMIT 1", [number]);
  return attachItems(mapOrder(rows[0]));
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

async function insertOrderItems(tx, orderId, items) {
  for (const item of items || []) {
    const qty = Number(item.qty || item.quantity) || 1;
    const unit = Number(item.unit || item.unit_price) || 0;
    const subtotal = Number(item.total || item.subtotal_amount) || unit * qty;
    await tx(
      "INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, option_text, subtotal_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "oi_" + crypto.randomUUID(),
        orderId,
        item.id || item.product_id || null,
        item.name || item.product_name || "상품",
        unit,
        qty,
        item.option_text || "",
        subtotal
      ]
    );
  }
}

async function writeReadyOrderRow(tx, order) {
  const sealed = sealOrder(order);
  const now = order.createdAt || new Date().toISOString();
  const orderName = order.orderName || orderModels.orderNameFromItems(order.items);
  const total = order.total || 0;
  await tx(
    `INSERT INTO orders (id, number, user_id, type, name, phone, address, memo, topics, items, total, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.id,
      order.number,
      order.userId || null,
      order.type || "order",
      sealed.name,
      sealed.phone,
      sealed.address,
      sealed.memo,
      JSON.stringify(order.topics || []),
      jsonItems(order.items),
      total,
      "READY",
      now
    ]
  );
  await tx(
    `UPDATE orders SET
      order_name=?, total_amount=?, shipping_fee=?, recipient_name=?, recipient_phone=?,
      zipcode=?, postal_code=?, address_basic=?, address_detail=?, delivery_memo=?, updated_at=?
     WHERE id=?`,
    [
      orderName,
      total,
      Number(order.shippingFee) || 0,
      order.name || "",
      order.phone || "",
      order.zipcode || "",
      order.zipcode || "",
      order.address || "",
      order.addressDetail || "",
      order.memo || "",
      now,
      order.id
    ]
  );
}

async function createReadyOrder(order, items) {
  return withTransaction(async (tx) => {
    await writeReadyOrderRow(tx, Object.assign({}, order, { items: items || order.items }));
    await insertOrderItems(tx, order.id, items || order.items);
    return mapOrder({
      id: order.id,
      number: order.number,
      user_id: order.userId || null,
      type: order.type || "order",
      name: order.name,
      phone: order.phone,
      address: order.address || "",
      memo: order.memo || "",
      topics: JSON.stringify(order.topics || []),
      items: jsonItems(items || order.items),
      total: order.total || 0,
      total_amount: order.total || 0,
      order_name: order.orderName || "",
      status: "READY",
      created_at: order.createdAt
    });
  });
}

async function createPendingCheckout(order, items) {
  return withTransaction(async (tx) => {
    const existing = await tx("SELECT * FROM orders WHERE number = ? LIMIT 1", [order.number]);
    let orderId = order.id;
    if (existing.rows[0]) {
      orderId = existing.rows[0].id;
      order.id = orderId;
      await tx(
        `UPDATE orders SET recipient_name=?, recipient_phone=?, zipcode=?, postal_code=?, address_basic=?, address_detail=?, delivery_memo=?, total=?, total_amount=?, shipping_fee=?, updated_at=? WHERE id=?`,
        [
          order.name || "",
          order.phone || "",
          order.zipcode || "",
          order.zipcode || "",
          order.address || "",
          order.addressDetail || "",
          order.memo || "",
          order.total || 0,
          order.total || 0,
          Number(order.shippingFee) || 0,
          new Date().toISOString(),
          orderId
        ]
      );
    } else {
      await writeReadyOrderRow(tx, Object.assign({}, order, { items: items || order.items }));
      await insertOrderItems(tx, order.id, items || order.items);
    }
    const payRows = await tx("SELECT id FROM payments WHERE toss_order_id = ? LIMIT 1", [order.number]);
    if (payRows.rows[0]) return { stockHeld: false, reused: true };

    let held = false;
    for (const item of items) {
      const found = await tx("SELECT qty FROM product_stock WHERE product_id = ?", [item.id]);
      const product = await tx("SELECT stock FROM products WHERE id = ?", [item.id]);
      if (!found.rows.length && !product.rows.length) continue;
      const updated = await tx(
        "UPDATE product_stock SET qty = qty - ? WHERE product_id = ? AND qty >= ?",
        [item.qty, item.id, item.qty]
      );
      await tx("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", [item.qty, item.id, item.qty]);
      if (!updated.changes) {
        const err = new Error("재고가 부족한 상품이 있습니다.");
        err.status = 409;
        throw err;
      }
      held = true;
    }
    await tx(
      `INSERT INTO payments (id, order_id, toss_order_id, payment_key, amount, status, method, stock_held, created_at, approved_at)
       VALUES (?, ?, ?, NULL, ?, 'PENDING', NULL, ?, ?, NULL)`,
      ["pay_" + crypto.randomUUID(), orderId, order.number, order.total || 0, held ? 1 : 0, order.createdAt || new Date().toISOString()]
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
    const fulfillment = ["PREPARING", "SHIPPING", "SHIPPED", "DELIVERED"];
    let orderStatus = next.orderStatus;
    if (fulfillment.indexOf(order.status) >= 0 && orderStatus === "PAID") orderStatus = order.status;
    if (next.releaseStock && Number(payRows.rows[0].stock_held) === 1) {
      for (const item of order.items || []) {
        const found = await tx("SELECT qty FROM product_stock WHERE product_id = ?", [item.id]);
        if (!found.rows.length) continue;
        await tx("UPDATE product_stock SET qty = qty + ? WHERE product_id = ?", [item.qty, item.id]);
        await tx("UPDATE products SET stock = stock + ? WHERE id = ?", [item.qty, item.id]);
      }
      await tx("UPDATE payments SET stock_held = 0 WHERE id = ?", [payment.id]);
    }
    const paidAt = orderStatus === "PAID" ? (next.approvedAt || new Date().toISOString()) : null;
    await tx("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?", [orderStatus, new Date().toISOString(), order.id]);
    if (next.paymentKey) {
      try { await tx("UPDATE orders SET payment_key = ? WHERE id = ?", [next.paymentKey, order.id]); } catch (_e) {}
    }
    if (paidAt) {
      try { await tx("UPDATE orders SET paid_at = COALESCE(paid_at, ?) WHERE id = ?", [paidAt, order.id]); } catch (_e) {}
    }
    await tx(
      "UPDATE payments SET status = ?, payment_key = COALESCE(?, payment_key), method = COALESCE(?, method), approved_at = COALESCE(?, approved_at) WHERE id = ?",
      [next.paymentStatus, next.paymentKey || null, next.method || null, next.approvedAt || null, payment.id]
    );
    return { id: order.id, status: orderStatus, amount: payment.amount };
  });
}

async function finalizePaidOrder(orderNumber, payload) {
  return withTransaction(async (tx) => {
    const lock = driver === "pg" ? " FOR UPDATE" : "";
    const orderRows = await tx("SELECT * FROM orders WHERE number = ?" + lock, [orderNumber]);
    if (!orderRows.rows[0]) {
      const err = new Error("주문을 찾을 수 없습니다.");
      err.status = 404;
      throw err;
    }
    const order = mapOrder(orderRows.rows[0]);
    if (order.status === "PAID") {
      return { already: true, id: order.id, status: "PAID", amount: order.total };
    }
    if (order.status !== "READY" && order.status !== "PENDING") {
      const err = new Error("결제할 수 없는 주문 상태입니다.");
      err.status = 409;
      throw err;
    }
    const itemRows = await tx("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    const items = itemRows.rows.length ? itemRows.rows.map(mapOrderItemRow) : (order.items || []);
    const payRows = await tx("SELECT * FROM payments WHERE toss_order_id = ?" + lock, [orderNumber]);
    const payment = mapPayment(payRows.rows[0]);
    const reserved = payment && Number(payRows.rows[0].stock_held) === 1;
    if (!reserved) {
      for (const item of items) {
        const qty = Number(item.qty) || 1;
        const productId = item.id;
        if (!productId) continue;
        await tx("SELECT id FROM products WHERE id = ?" + lock, [productId]);
        await tx("SELECT product_id FROM product_stock WHERE product_id = ?" + lock, [productId]);
        const stockHit = await tx(
          "UPDATE product_stock SET qty = qty - ? WHERE product_id = ? AND qty >= ?",
          [qty, productId, qty]
        );
        const productHit = await tx(
          "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
          [qty, productId, qty]
        );
        if (stockHit.changes === 0 && productHit.changes === 0) {
          const counted = await tx("SELECT id FROM products WHERE id = ?", [productId]);
          const stocked = await tx("SELECT product_id FROM product_stock WHERE product_id = ?", [productId]);
          if (counted.rows.length || stocked.rows.length) {
            const err = new Error("재고가 부족한 상품이 있습니다.");
            err.status = 409;
            throw err;
          }
        }
      }
    }
    const now = new Date().toISOString();
    const paidAt = payload.approvedAt || now;
    await tx(
      "UPDATE orders SET status = ?, payment_key = ?, payment_method = COALESCE(?, payment_method), receipt_url = COALESCE(?, receipt_url), paid_at = COALESCE(paid_at, ?), updated_at = ? WHERE id = ?",
      ["PAID", payload.paymentKey, payload.method || null, payload.receiptUrl || null, paidAt, now, order.id]
    );
    if (payment) {
      await tx(
        "UPDATE payments SET status = ?, payment_key = ?, method = COALESCE(?, method), stock_held = 1, approved_at = COALESCE(?, approved_at) WHERE id = ?",
        ["PAID", payload.paymentKey, payload.method || null, paidAt, payment.id]
      );
    } else {
      await tx(
        `INSERT INTO payments (id, order_id, toss_order_id, payment_key, amount, status, method, stock_held, created_at, approved_at)
         VALUES (?, ?, ?, ?, ?, 'PAID', ?, 1, ?, ?)`,
        [
          "pay_" + crypto.randomUUID(),
          order.id,
          order.number,
          payload.paymentKey,
          payload.amount || order.total,
          payload.method || "",
          now,
          paidAt
        ]
      );
    }
    return { already: false, id: order.id, status: "PAID", amount: order.total };
  });
}

async function updateOrderStatus(id, status, extra) {
  const rows = await exec("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) return null;
  extra = extra || {};
  const sets = ["status = ?", "updated_at = ?"];
  const vals = [status, new Date().toISOString()];
  if (extra.tracking_number != null) {
    sets.push("tracking_number = ?");
    vals.push(extra.tracking_number);
  }
  if (extra.carrier != null) {
    sets.push("carrier = ?");
    vals.push(extra.carrier);
  }
  if (extra.cancel_reason != null) {
    sets.push("cancel_reason = ?");
    vals.push(extra.cancel_reason);
  }
  if (extra.previous_status != null) {
    sets.push("previous_status = ?");
    vals.push(extra.previous_status);
  }
  vals.push(id);
  await exec("UPDATE orders SET " + sets.join(", ") + " WHERE id = ?", vals);
  const next = await exec("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  return attachItems(mapOrder(next[0] || Object.assign({}, rows[0], { status: status })));
}

async function clearPurchasedCart(userId, productIds) {
  if (!userId) return;
  const ids = (productIds || []).map((id) => String(id || "")).filter(Boolean);
  if (!ids.length) return;
  try {
    for (const productId of ids) {
      await exec("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId]);
    }
  } catch (_e) {}
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
  heriumIsAdmin,
  setUserRole,
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
  createReadyOrder,
  createPendingCheckout,
  applyPaymentResult,
  finalizePaidOrder,
  listOrders,
  updateOrderStatus,
  clearPurchasedCart,
  writeAudit,
  findNoEmailMember,
  openPasswordHelp,
  listPasswordHelp,
  findOpenPasswordHelp,
  closePasswordHelp,
  listProducts,
  findProduct,
  upsertProduct,
  getShopProfile,
  upsertShopProfile,
  withdrawUser,
  companyContent,
  setCompanyContent
};
