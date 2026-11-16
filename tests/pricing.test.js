const test = require("node:test");
const assert = require("node:assert/strict");
const { readPrepare } = require("../server/schemas");
const { start, request, db } = require("./helpers");

test("prepare schema rejects an empty cart", () => {
  const parsed = readPrepare({ name: "홍길동", phone: "01012345678", address: "서울시 종로구", items: [] });
  assert.ok(parsed.error);
});

test("a client amount that does not match the catalog is rejected", async () => {
  const server = await start();
  try {
    await db.upsertProduct({
      id: "walker-frame",
      name: "접이식 실내용 워커",
      price: 34500,
      salePrice: null,
      stock: 5,
      category: "walker",
      thumbnail: "",
      description: "",
      isHygiene: false,
      isActive: true
    });
    const res = await request(server.base, "POST", "/api/payments/prepare", {
      body: {
        name: "홍길동",
        phone: "01012345678",
        address: "서울시 종로구 1",
        items: [{ id: "walker-frame", qty: 1 }],
        amount: 1
      }
    });
    assert.equal(res.status, 400);
    assert.match(res.data.error, /금액/);
  } finally {
    await server.stop();
  }
});

test("a sold-out catalog item is rejected", async () => {
  const server = await start();
  try {
    await db.upsertProduct({
      id: "walker-frame",
      name: "접이식 실내용 워커",
      price: 34500,
      salePrice: null,
      stock: 0,
      category: "walker",
      thumbnail: "",
      description: "",
      isHygiene: false,
      isActive: true
    });
    const res = await request(server.base, "POST", "/api/payments/prepare", {
      body: {
        name: "홍길동",
        phone: "01012345678",
        address: "서울시 종로구 1",
        items: [{ id: "walker-frame", qty: 1 }]
      }
    });
    assert.equal(res.status, 409);
    assert.match(res.data.error, /품절/);
  } finally {
    await server.stop();
  }
});
