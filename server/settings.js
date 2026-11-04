module.exports = {
  TOSS_CLIENT_KEY: process.env.TOSS_CLIENT_KEY || "",
  TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY || "",
  SITE_URL: (process.env.SITE_URL || "https://hyundaimedi.com").replace(/\/$/, "")
};
