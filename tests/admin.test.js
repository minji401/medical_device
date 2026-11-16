const test = require("node:test");
const assert = require("node:assert/strict");
const { start, request, db } = require("./helpers");

async function tokenFor(server, email, phone, role) {
  const created = await request(server.base, "POST", "/api/signup", {
    body: {
      name: "홍길동",
      email,
      phone,
      password: "GoodPass1!",
      passwordConfirm: "GoodPass1!",
      age14: true
    }
  });
  assert.equal(created.status, 200, JSON.stringify(created.data));
  if (role === "admin") await db.setUserRole(created.data.user.id, "admin");
  return created.data.token;
}

test("admin product api rejects anonymous and normal members", async () => {
  const server = await start();
  try {
    const anon = await request(server.base, "POST", "/api/admin/products", {
      body: { name: "테스트", price: 1000 }
    });
    assert.equal(anon.status, 401);

    const token = await tokenFor(server, "member-admin-check@example.com", "01055550001", "user");
    const member = await request(server.base, "POST", "/api/admin/products", {
      token,
      body: { name: "테스트", price: 1000 }
    });
    assert.equal(member.status, 403);
  } finally {
    await server.stop();
  }
});

test("direct cancel http path rejects an order that is not paid", async () => {
  const server = await start();
  try {
    const token = await tokenFor(server, "admin-cancel@example.com", "01055550002", "admin");
    await db.createOrder({
      id: "o_ready",
      number: "ORD-READY-1",
      userId: null,
      type: "order",
      name: "홍길동",
      phone: "01012345678",
      address: "서울시 종로구",
      memo: "",
      topics: [],
      items: [],
      total: 1000,
      status: "READY",
      createdAt: new Date().toISOString()
    });
    const res = await request(server.base, "POST", "/api/admin/orders/o_ready/cancel-direct", {
      token,
      body: { reason: "품절" }
    });
    assert.equal(res.status, 400);
  } finally {
    await server.stop();
  }
});
