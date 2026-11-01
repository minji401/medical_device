const crypto = require("crypto");
const db = require("./db");

const HYGIENE_CATS = { supply: true, pant: true };

function overlay(catalog, row) {
  if (!row) return catalog;
  return Object.assign({}, catalog, {
    name: row.name || catalog.name,
    price: Number(row.price) || catalog.price,
    salePrice: row.sale_price == null ? catalog.salePrice : Number(row.sale_price),
    stock: Number(row.stock),
    thumbnail: row.thumbnail_url || catalog.thumbnail,
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
  return db.upsertProduct({
    id,
    name: String(body.name || "").trim(),
    price: Number(body.price) || 0,
    salePrice: body.sale_price == null || body.sale_price === "" ? null : Number(body.sale_price),
    stock: Math.max(0, Number(body.stock) || 0),
    category: String(body.category || ""),
    thumbnail: String(body.thumbnail_url || ""),
    description: String(body.description || ""),
    isHygiene: Boolean(body.is_hygiene_product),
    isActive: body.is_active !== false && body.is_active !== 0 && body.is_active !== "0"
  });
}

module.exports = { all, one, seed, save, overlay };
