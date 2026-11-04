const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "products");

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    const err = new Error("이미지(jpg, png, webp)만 올릴 수 있습니다.");
    err.status = 400;
    cb(err);
  }
}).single("image");

function saveProductImage(file) {
  if (!file || !file.buffer) {
    const err = new Error("파일을 선택해 주세요.");
    err.status = 400;
    throw err;
  }
  if (file.buffer.length > 5 * 1024 * 1024) {
    const err = new Error("파일은 5MB 이하만 올릴 수 있습니다.");
    err.status = 400;
    throw err;
  }
  const ext = ALLOWED[file.mimetype];
  if (!ext) {
    const err = new Error("이미지(jpg, png, webp)만 올릴 수 있습니다.");
    err.status = 400;
    throw err;
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = Date.now() + "-" + crypto.randomBytes(6).toString("hex") + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.buffer);
  return "/uploads/products/" + name;
}

module.exports = { uploadImage, saveProductImage };
