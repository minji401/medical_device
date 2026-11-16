const test = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("./helpers");

test("direct cancel restores stock for a paid order", async () => {
  await db.init();
  await db.upsertProduct({
    id: "cane-4",
    name: "안정형 네발지팡이",
    price: 12000,
    salePrice: null,
    stock: 2,
    category: "cane",
    thumbnail: "",
    description: "",
    isHygiene: false,
    isActive: true
  });
  await db.createOrder({
    id: "o_cancel",
    number: "ORD-CANCEL-1",
    userId: null,
    type: "order",
    name: "홍길동",
    phone: "01012345678",
    address: "서울시 종로구",
    memo: "",
    topics: [],
    items: [{ id: "cane-4", name: "안정형 네발지팡이", qty: 1, unit: 12000, total: 12000 }],
    total: 12000,
    status: "PAID",
    createdAt: new Date().toISOString()
  });
  const result = await db.cancelDirectOrder("o_cancel", { reason: "품절", cancelledBy: "ADMIN" });
  assert.equal(result.order.status, "CANCELLED");
  const product = await db.findProduct("cane-4");
  assert.equal(Number(product.stock), 3);
});
