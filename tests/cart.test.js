const test = require("node:test");
const assert = require("node:assert/strict");
const { start, request } = require("./helpers");

test("cart requires a logged-in user", async () => {
  const server = await start();
  try {
    const res = await fetch(server.base + "/api/cart", {
      headers: { "X-Requested-With": "fetch" }
    });
    assert.equal(res.status, 401);
  } finally {
    await server.stop();
  }
});
