const crypto = require("crypto");

function enabled(provider) {
  if (provider === "kakao") return Boolean(process.env.KAKAO_CLIENT_ID);
  if (provider === "naver") return Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
  if (provider === "google") return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return false;
}

function redirectUri(site, provider) {
  return site + "/api/auth/" + provider + "/callback";
}

function authorizeUrl(site, provider, state) {
  const redirect = encodeURIComponent(redirectUri(site, provider));
  if (provider === "kakao") {
    return "https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=" +
      encodeURIComponent(process.env.KAKAO_CLIENT_ID) + "&redirect_uri=" + redirect + "&state=" + encodeURIComponent(state);
  }
  if (provider === "naver") {
    return "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" +
      encodeURIComponent(process.env.NAVER_CLIENT_ID) + "&redirect_uri=" + redirect + "&state=" + encodeURIComponent(state);
  }
  return "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=" +
    encodeURIComponent("openid email profile") + "&client_id=" +
    encodeURIComponent(process.env.GOOGLE_CLIENT_ID) + "&redirect_uri=" + redirect + "&state=" + encodeURIComponent(state);
}

async function readJson(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.message || "소셜 로그인에 실패했습니다.");
  return data;
}

async function profile(site, provider, code) {
  const redirect = redirectUri(site, provider);
  if (provider === "kakao") {
    const token = await readJson("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET || "",
        redirect_uri: redirect,
        code
      })
    });
    const me = await readJson("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: "Bearer " + token.access_token }
    });
    const acc = me.kakao_account || {};
    const name = (acc.profile && acc.profile.nickname) || "카카오회원";
    return { id: String(me.id), name, email: acc.email || "", phone: acc.phone_number || "" };
  }
  if (provider === "naver") {
    const token = await readJson("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        redirect_uri: redirect,
        code
      })
    });
    const me = await readJson("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: "Bearer " + token.access_token }
    });
    const acc = me.response || {};
    return { id: String(acc.id || ""), name: acc.name || acc.nickname || "네이버회원", email: acc.email || "", phone: acc.mobile || "" };
  }
  const token = await readJson("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirect,
      code
    })
  });
  const me = await readJson("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: "Bearer " + token.access_token }
  });
  return { id: String(me.id || ""), name: me.name || "구글회원", email: me.email || "", phone: "" };
}

function randomState() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = { enabled, authorizeUrl, profile, randomState };
