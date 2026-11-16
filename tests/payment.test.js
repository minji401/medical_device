const test = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("./helpers");

test("a neon database url is refused before any connection", async () => {
  process.env.DATABASE_URL = "postgres://user:pass@ep-example.neon.tech/neondb";
  await assert.rejects(() => db.init(), /Neon/);
  delete process.env.DATABASE_URL;
});
