const crypto = require("crypto");

let bcrypt = null;
try { bcrypt = require("bcryptjs"); } catch (_e) { bcrypt = null; }

let argon2 = null;
try { argon2 = require("argon2"); } catch (_e) { argon2 = null; }

const SCRYPT = { N: 16384, r: 8, p: 1 };

function hashPassword(password) {
  if (bcrypt) return bcrypt.hashSync(String(password), 12);
  const saltHex = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, saltHex, 64, SCRYPT);
  return saltHex + ":" + hash.toString("hex");
}

function verifyScryptOrBcrypt(password, stored) {
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

function verifyPassword(password, stored) {
  return verifyScryptOrBcrypt(password, stored);
}

function verifyPbkdf2Sha256(password, encoded) {
  const match = String(encoded || "").match(/^pbkdf2_sha256\$(\d+)\$([^$]+)\$(.+)$/);
  if (!match) return false;
  const iterations = Number(match[1]);
  const salt = match[2];
  let expected;
  try {
    expected = Buffer.from(match[3], "base64");
  } catch (_e) {
    return false;
  }
  if (!iterations || !salt || !expected.length) return false;
  const actual = crypto.pbkdf2Sync(String(password), salt, iterations, expected.length, "sha256");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

async function verifyArgon2Django(password, encoded) {
  if (!argon2) return false;
  let phc = String(encoded || "");
  if (phc.startsWith("argon2$")) phc = phc.slice("argon2".length);
  if (!phc.startsWith("$argon2")) return false;
  try {
    return await argon2.verify(phc, String(password));
  } catch (_e) {
    return false;
  }
}

function verifyBcryptDjango(password, encoded) {
  if (!bcrypt) return false;
  const raw = String(encoded || "");
  try {
    if (raw.startsWith("bcrypt_sha256$")) {
      const hashed = crypto.createHash("sha256").update(String(password), "utf8").digest("hex");
      const bcryptHash = raw.slice(raw.indexOf("$2"));
      return bcrypt.compareSync(hashed, bcryptHash);
    }
    if (raw.startsWith("bcrypt$")) {
      const bcryptHash = raw.slice(raw.indexOf("$2"));
      return bcrypt.compareSync(String(password), bcryptHash);
    }
  } catch (_e) {}
  return false;
}

async function verifyDjangoPassword(password, encoded) {
  const raw = String(encoded || "");
  if (!raw || raw.charAt(0) === "!") return false;
  if (raw.startsWith("pbkdf2_sha256$")) return verifyPbkdf2Sha256(password, raw);
  if (raw.startsWith("argon2") || raw.startsWith("$argon2")) return verifyArgon2Django(password, raw);
  if (raw.startsWith("bcrypt")) return verifyBcryptDjango(password, raw);
  return false;
}

async function verifyAnyPassword(password, stored) {
  if (verifyScryptOrBcrypt(password, stored)) return true;
  return verifyDjangoPassword(password, stored);
}

function needsRehash(stored) {
  return Boolean(bcrypt) && !String(stored || "").startsWith("$2");
}

module.exports = { hashPassword, verifyPassword, verifyDjangoPassword, verifyAnyPassword, needsRehash };
