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

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role || "user",
    heriumLinked: Boolean(Number(row.herium_linked)),
    heriumRelation: row.herium_relation || "",
    heriumNote: row.herium_note || "",
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
}

async function findUserById(id) {
  const rows = await exec("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return mapUser(rows[0]);
}

async function findUserByPhone(phone) {
  const rows = await exec("SELECT * FROM users WHERE phone = ? LIMIT 1", [phone]);
  return mapUser(rows[0]);
}

async function createUser(user) {
  await exec(
    `INSERT INTO users (id, name, phone, password_hash, role, herium_linked, herium_relation, herium_note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.name,
      user.phone,
      user.passwordHash,
      user.role || "user",
      user.heriumLinked ? 1 : 0,
      user.heriumRelation || "",
      user.heriumNote || "",
      user.createdAt
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
  createUser,
  createOrder,
  listOrders,
  updateOrderStatus
};
