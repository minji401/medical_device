const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "data");
const USERS = path.join(DIR, "users.json");
const ORDERS = path.join(DIR, "orders.json");

function ensure() {
  fs.mkdirSync(DIR, { recursive: true });
  if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, "[]");
  if (!fs.existsSync(ORDERS)) fs.writeFileSync(ORDERS, "[]");
}

function read(file) {
  ensure();
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function write(file, data) {
  ensure();
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function users() {
  return read(USERS);
}

function saveUsers(list) {
  write(USERS, list);
}

function orders() {
  return read(ORDERS);
}

function saveOrders(list) {
  write(ORDERS, list);
}

module.exports = { users, saveUsers, orders, saveOrders, ensure };
