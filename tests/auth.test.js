const test = require("node:test");
const assert = require("node:assert/strict");
const { start, request } = require("./helpers");

function signupBody(email) {
  return {
    name: "홍길동",
    email,
    phone: "01012345678",
    password: "GoodPass1!",
    passwordConfirm: "GoodPass1!",
    age14: true
  };
}

test("signup, login, and logout", async () => {
  const server = await start();
  try {
    const created = await request(server.base, "POST", "/api/signup", {
      body: signupBody("member@example.com")
    });
    assert.equal(created.status, 200, JSON.stringify(created.data));
    assert.ok(created.data.token);

    const me = await request(server.base, "GET", "/api/me", { token: created.data.token });
    assert.equal(me.data.user.email, "member@example.com");

    const wrong = await request(server.base, "POST", "/api/login", {
      body: { login: "member@example.com", password: "WrongPass1!" }
    });
    assert.equal(wrong.status, 401);

    const logged = await request(server.base, "POST", "/api/login", {
      body: { login: "member@example.com", password: "GoodPass1!" }
    });
    assert.equal(logged.status, 200, JSON.stringify(logged.data));
    assert.ok(logged.data.token);

    const out = await request(server.base, "POST", "/api/logout", { token: logged.data.token });
    assert.equal(out.status, 200);
    assert.equal(out.data.ok, true);
  } finally {
    await server.stop();
  }
});

test("signup rejects a password that misses the policy", async () => {
  const server = await start();
  try {
    const bad = await request(server.base, "POST", "/api/signup", {
      body: Object.assign(signupBody("short@example.com"), {
        phone: "01012348765",
        password: "short",
        passwordConfirm: "short"
      })
    });
    assert.equal(bad.status, 400);
  } finally {
    await server.stop();
  }
});
