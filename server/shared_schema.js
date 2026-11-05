const TABLES = [
  `CREATE TABLE IF NOT EXISTS care_consultations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    relation_type TEXT NOT NULL DEFAULT '',
    care_level TEXT NOT NULL DEFAULT '',
    mobility_status TEXT NOT NULL DEFAULT '',
    preferred_date TEXT,
    preferred_time_slot TEXT,
    privacy_agreed INTEGER NOT NULL DEFAULT 0,
    confirmed_datetime TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    sms_sent_at TEXT,
    sms_content TEXT,
    sms_ok INTEGER,
    admin_memo TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS care_schedules (
    id TEXT PRIMARY KEY,
    consultation_id TEXT,
    title TEXT NOT NULL,
    start_datetime TEXT NOT NULL,
    end_datetime TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '기타',
    memo TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS site_contents (
    id TEXT PRIMARY KEY,
    content_key TEXT NOT NULL UNIQUE,
    title TEXT,
    content TEXT,
    image_url TEXT,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS shop_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    recipient_name TEXT NOT NULL DEFAULT '',
    recipient_phone TEXT NOT NULL DEFAULT '',
    zipcode TEXT NOT NULL DEFAULT '',
    address_basic TEXT NOT NULL DEFAULT '',
    address_detail TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    sale_price INTEGER,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT '',
    thumbnail_url TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    is_hygiene_product INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    option_text TEXT NOT NULL DEFAULT '',
    subtotal_amount INTEGER NOT NULL DEFAULT 0
  )`
];

const USER_COLUMNS = [
  ["marketing_agreed", "INTEGER NOT NULL DEFAULT 0"],
  ["age_14_agreed", "INTEGER NOT NULL DEFAULT 0"],
  ["withdrawn_at", "TEXT"]
];

const ORDER_COLUMNS = [
  ["payment_key", "TEXT"],
  ["zipcode", "TEXT"],
  ["postal_code", "TEXT"],
  ["address_basic", "TEXT"],
  ["address_detail", "TEXT"],
  ["tracking_number", "TEXT"],
  ["carrier", "TEXT"],
  ["receipt_url", "TEXT"],
  ["payment_method", "TEXT"],
  ["shipping_fee", "INTEGER DEFAULT 0"],
  ["cancel_reason", "TEXT"],
  ["cancelled_by", "TEXT"],
  ["cancelled_at", "TEXT"],
  ["previous_status", "TEXT"],
  ["recipient_name", "TEXT"],
  ["recipient_phone", "TEXT"],
  ["order_name", "TEXT"],
  ["total_amount", "INTEGER"],
  ["delivery_memo", "TEXT"],
  ["paid_at", "TEXT"],
  ["updated_at", "TEXT"]
];

const ORDER_ITEM_COLUMNS = [
  ["option_text", "TEXT"],
  ["subtotal_amount", "INTEGER"]
];

async function apply(exec, driver) {
  for (const sql of TABLES) await exec(sql);
  const cols = USER_COLUMNS.concat([]);
  for (const [name, type] of USER_COLUMNS) {
    try {
      if (driver === "pg") await exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS " + name + " " + type);
      else await exec("ALTER TABLE users ADD COLUMN " + name + " " + type);
    } catch (_e) {}
  }
  for (const [name, type] of ORDER_COLUMNS) {
    try {
      if (driver === "pg") {
        const pgType = name === "cancelled_at" ? "TIMESTAMPTZ" : type;
        await exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS " + name + " " + pgType);
      } else {
        await exec("ALTER TABLE orders ADD COLUMN " + name + " " + type);
      }
    } catch (_e) {}
  }
  for (const [name, type] of ORDER_ITEM_COLUMNS) {
    try {
      if (driver === "pg") await exec("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS " + name + " " + type);
      else await exec("ALTER TABLE order_items ADD COLUMN " + name + " " + type);
    } catch (_e) {}
  }
  try {
    await exec("UPDATE orders SET total_amount = total WHERE total_amount IS NULL");
  } catch (_e) {}
  try {
    await exec("CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)");
  } catch (_e) {}
  try {
    await exec(`CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      option_text TEXT,
      created_at TEXT,
      updated_at TEXT
    )`);
  } catch (_e) {}
  try {
    await exec("CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id)");
    await exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id)");
  } catch (_e) {}
  try {
    await exec(`CREATE TABLE IF NOT EXISTS senior_profiles (
      id BIGSERIAL PRIMARY KEY,
      guardian_id INTEGER NOT NULL,
      shared_user_id TEXT NOT NULL DEFAULT '',
      name VARCHAR(50) NOT NULL,
      relationship VARCHAR(30) NOT NULL DEFAULT '기타',
      birth_date DATE,
      care_grade VARCHAR(20) NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  } catch (_e) {}
  const consultCols = [
    ["sms_ok", "INTEGER"],
    ["sms_sent_at", "TEXT"],
    ["sms_content", "TEXT"],
    ["admin_memo", "TEXT"],
    ["patient_id", "TEXT"],
    ["senior_name", "TEXT"],
    ["consult_kind", "TEXT"]
  ];
  for (const [name, type] of consultCols) {
    try {
      if (driver === "pg") await exec("ALTER TABLE care_consultations ADD COLUMN IF NOT EXISTS " + name + " " + type);
      else await exec("ALTER TABLE care_consultations ADD COLUMN " + name + " " + type);
    } catch (_e) {}
  }
  void cols;
}

module.exports = { apply };
