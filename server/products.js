const crypto = require("crypto");
const db = require("./db");

const HYGIENE_CATS = { supply: true, pant: true };

function parseImages(row, catalog) {
  const out = [];
  function push(url) {
    const value = String(url || "").trim();
    if (value && out.indexOf(value) < 0) out.push(value);
  }
  const raw = row && row.images;
  if (Array.isArray(raw)) raw.forEach(push);
  else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) parsed.forEach(push);
      else push(raw);
    } catch (_e) {
      String(raw).split(/[\n,]/).forEach(push);
    }
  }
  push(row && (row.image_url || row.thumbnail_url));
  push(catalog && (catalog.thumbnail || catalog.image_url));
  return out;
}

function parseImageInput(body) {
  if (!body) return [];
  if (Array.isArray(body.images)) return body.images.map((v) => String(v || "").trim()).filter(Boolean);
  if (typeof body.images === "string" && body.images.trim()) {
    try {
      const parsed = JSON.parse(body.images);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v || "").trim()).filter(Boolean);
    } catch (_e) {}
    return body.images.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

function overlay(catalog, row) {
  if (!row) {
    const images = parseImages(null, catalog);
    return Object.assign({}, catalog, { images, thumbnail: (images[0] || catalog.thumbnail || "") });
  }
  const images = parseImages(row, catalog);
  return Object.assign({}, catalog, {
    name: row.name || catalog.name,
    price: Number(row.price) || catalog.price,
    salePrice: row.sale_price == null ? catalog.salePrice : Number(row.sale_price),
    stock: Number(row.stock),
    thumbnail: images[0] || row.thumbnail_url || row.image_url || catalog.thumbnail || "",
    image_url: images[0] || row.image_url || row.thumbnail_url || "",
    images,
    desc: row.description || catalog.desc,
    isHygiene: Number(row.is_hygiene_product) === 1 || Boolean(HYGIENE_CATS[catalog.category]),
    isActive: Number(row.is_active) !== 0
  });
}

async function all(catalog) {
  const rows = await db.listProducts();
  const byId = {};
  rows.forEach((row) => { byId[row.id] = row; });
  return (catalog.PRODUCTS || []).map((p) => overlay(p, byId[p.id])).filter((p) => p.isActive !== false);
}

async function one(catalog, id) {
  const base = catalog.productById(id);
  if (!base) return null;
  const row = await db.findProduct(id);
  return overlay(base, row);
}

async function seed(catalog) {
  const existing = await db.listProducts();
  if (existing.length) return;
  for (const p of catalog.PRODUCTS || []) {
    await db.upsertProduct({
      id: p.id,
      name: p.name,
      price: p.price,
      salePrice: null,
      stock: 30,
      category: p.category,
      thumbnail: "",
      description: p.desc || "",
      isHygiene: Boolean(HYGIENE_CATS[p.category]),
      isActive: true
    });
  }
}

async function save(body) {
  const id = String(body.id || "p_" + crypto.randomUUID());
  const images = parseImageInput(body);
  const thumbnail = String(body.thumbnail_url || body.image_url || images[0] || "").trim();
  if (thumbnail && images.indexOf(thumbnail) < 0) images.unshift(thumbnail);
  return db.upsertProduct({
    id,
    name: String(body.name || "").trim(),
    price: Number(body.price) || 0,
    salePrice: body.sale_price == null || body.sale_price === "" ? null : Number(body.sale_price),
    stock: Math.max(0, Number(body.stock) || 0),
    category: String(body.category || ""),
    thumbnail,
    images,
    description: String(body.description || ""),
    isHygiene: Boolean(body.is_hygiene_product),
    isActive: body.is_active !== false && body.is_active !== 0 && body.is_active !== "0"
  });
}

function compactText(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

async function search(catalog, q) {
  const cleanKeyword = String(q || "").replace(/\s+/g, "");
  if (!cleanKeyword) return all(catalog);
  const needle = cleanKeyword.toLowerCase();
  const dbHits = await db.searchProducts(cleanKeyword);
  const hitIds = {};
  dbHits.forEach((row) => { hitIds[row.id] = row; });
  const catName = {};
  (catalog.CATEGORIES || []).forEach((c) => { catName[c.id] = c.name; });
  const list = await all(catalog);
  const matched = list.filter((p) => {
    if (hitIds[p.id]) return true;
    const hay = compactText([p.name, p.desc, p.description, p.category, catName[p.category] || ""].join(""));
    return hay.indexOf(needle) >= 0;
  });
  dbHits.forEach((row) => {
    if (matched.some((p) => p.id === row.id)) return;
    matched.push(overlay({
      id: row.id,
      name: row.name,
      category: row.category,
      desc: row.description || "",
      price: Number(row.price) || 0,
      mode: "buy",
      badges: [],
      rating: 0,
      reviews: 0,
      specs: {}
    }, row));
  });
  return matched;
}

module.exports = { all, one, seed, save, overlay, search, parseImages };
