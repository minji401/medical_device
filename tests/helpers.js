const http = require("http");
const os = require("os");
const path = require("path");

process.env.NODE_ENV = "test";
process.env.TEST_SQLITE_PATH = path.join(os.tmpdir(), "hyundai-test-" + process.pid + "-" + Date.now() + ".sqlite");

const app = require("../server");
const db = require("../server/db");

async function start() {
  await db.init();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    server,
    base: "http://127.0.0.1:" + port,
    async stop() {
      await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    }
  };
}

async function request(base, method, urlPath, { body, token } = {}) {
  const res = await fetch(base + urlPath, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "fetch",
      ...(token ? { Authorization: "Bearer " + token } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

module.exports = { start, request, db };
