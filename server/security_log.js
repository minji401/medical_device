function event(kind, fields) {
  const row = Object.assign(
    { ts: new Date().toISOString(), kind: String(kind || "event") },
    fields || {}
  );
  console.log(JSON.stringify(row));
}

module.exports = { event };
