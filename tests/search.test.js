const test = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("./helpers");

test("search ignores spaces in the product name", async () => {
  await db.init();
  await db.upsertProduct({
    id: "bed-space",
    name: "전동 침대",
    price: 1000,
    salePrice: null,
    stock: 3,
    category: "bed",
    thumbnail: "",
    description: "가정용 의료 침대",
    isHygiene: false,
    isActive: true
  });
  const hits = await db.searchProducts("전동침대");
  assert.ok(hits.some((row) => row.id === "bed-space"));
  const missed = await db.searchProducts("없는상품");
  assert.equal(missed.some((row) => row.id === "bed-space"), false);
});
