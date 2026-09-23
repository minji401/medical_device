const fs = require("fs");
const path = require("path");

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
    name: row.name,
    phone: row.phone,
    address: row.address || "",
    memo: row.memo || "",
    topics: JSON.parse(row.topics || "[]"),
    items: JSON.parse(row.items || "[]"),
    total: Number(row.total) || 0,
    status: row.status,
    createdAt: row.created_at
  };
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
    ["address", "TEXT"]
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
  const rows = await exec("SELECT * FROM users WHERE email = ? LIMIT 1", [value]);
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

async function createOrder(order) {
  await exec(
    `INSERT INTO orders (id, number, user_id, type, name, phone, address, memo, topics, items, total, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.id,
      order.number,
      order.userId || null,
      order.type,
      order.name,
      order.phone,
      order.address || "",
      order.memo || "",
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

async function updateOrderStatus(id, status) {
  const rows = await exec("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) return null;
  await exec("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  return mapOrder(Object.assign({}, rows[0], { status: status }));
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
  createUser,
  createOrder,
  listOrders,
  updateOrderStatus
};
