const crypto = require("crypto");

let bcrypt = null;
try { bcrypt = require("bcryptjs"); } catch (_e) { bcrypt = null; }

const SCRYPT = { N: 16384, r: 8, p: 1 };

function hashPassword(password) {
  if (bcrypt) return bcrypt.hashSync(String(password), 12);
  const saltHex = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, saltHex, 64, SCRYPT);
  return saltHex + ":" + hash.toString("hex");
}

function verifyPassword(password, stored) {
  const raw = String(stored || "");
  if (raw.startsWith("$2a$") || raw.startsWith("$2b$") || raw.startsWith("$2y$")) {
    if (!bcrypt) return false;
    try { return bcrypt.compareSync(String(password), raw); } catch (_e) { return false; }
  }
  const cut = raw.indexOf(":");
  if (cut < 1) return false;
  const saltHex = raw.slice(0, cut);
  const hashHex = raw.slice(cut + 1);
  try {
    const actual = crypto.scryptSync(password, saltHex, 64, SCRYPT);
    const expected = Buffer.from(hashHex, "hex");
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch (_e) {
    return false;
  }
}

function needsRehash(stored) {
  return Boolean(bcrypt) && !String(stored || "").startsWith("$2");
}

module.exports = { hashPassword, verifyPassword, needsRehash };
