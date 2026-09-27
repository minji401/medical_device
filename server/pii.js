const crypto = require("crypto");

const PREFIX = "enc1:";
const DEV_KEY = Buffer.from("0123456789abcdef0123456789abcdef");

function key() {
  const raw = String(process.env.DATA_ENCRYPTION_KEY || "").trim();
  if (raw) {
    const decoded = Buffer.from(raw, "base64");
    if (decoded.length !== 32) {
      throw new Error("DATA_ENCRYPTION_KEY는 32바이트를 base64로 넣은 값이어야 합니다.");
    }
    return decoded;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATA_ENCRYPTION_KEY가 필요합니다.");
  }
  return DEV_KEY;
}

function encryptText(value) {
  const text = value == null ? "" : String(value);
  if (!text || text.startsWith(PREFIX)) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, enc, tag]).toString("base64");
}

function decryptText(value) {
  const text = value == null ? "" : String(value);
  if (!text.startsWith(PREFIX)) return text;
  const blob = Buffer.from(text.slice(PREFIX.length), "base64");
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(blob.length - 16);
  const data = blob.subarray(12, blob.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

function cleanText(value, limit) {
  const text = String(value || "").replace(/\u0000/g, "").trim().slice(0, limit);
  if (/<\s*\/?\s*script/i.test(text)) {
    const err = new Error("허용되지 않는 내용입니다.");
    err.status = 400;
    throw err;
  }
  return text;
}

module.exports = { encryptText, decryptText, cleanText };
