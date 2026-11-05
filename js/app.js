const ICONS = {
  bed: `<svg viewBox="0 0 64 64" fill="none"><rect x="8" y="28" width="48" height="14" rx="3" fill="#b38b4d"/><rect x="12" y="18" width="18" height="12" rx="3" fill="#c9a56a"/><circle cx="16" cy="46" r="4" fill="#2b261f"/><circle cx="48" cy="46" r="4" fill="#2b261f"/></svg>`,
  grab: `<svg viewBox="0 0 64 64" fill="none"><rect x="14" y="28" width="36" height="8" rx="4" fill="#b38b4d"/><circle cx="18" cy="32" r="6" fill="#c9a56a"/><circle cx="46" cy="32" r="6" fill="#c9a56a"/></svg>`,
  walker: `<svg viewBox="0 0 64 64" fill="none"><path d="M16 18h8v28h-8zM40 18h8v28h-8z" fill="#b38b4d"/><rect x="16" y="24" width="32" height="6" fill="#c9a56a"/><circle cx="20" cy="50" r="5" fill="#2b261f"/><circle cx="44" cy="50" r="5" fill="#2b261f"/></svg>`,
  bath: `<svg viewBox="0 0 64 64" fill="none"><rect x="18" y="22" width="28" height="6" rx="2" fill="#c9a56a"/><rect x="16" y="28" width="32" height="16" rx="3" fill="#b38b4d"/><rect x="20" y="44" width="6" height="10" fill="#2b261f"/><rect x="38" y="44" width="6" height="10" fill="#2b261f"/></svg>`,
  cane: `<svg viewBox="0 0 64 64" fill="none"><path d="M28 12c8 0 14 6 14 14v4h-8v-4c0-3.3-2.7-6-6-6s-6 2.7-6 6v26h-8V26c0-8 6-14 14-14z" fill="#b38b4d"/></svg>`,
  chair: `<svg viewBox="0 0 64 64" fill="none"><circle cx="24" cy="46" r="10" stroke="#b38b4d" stroke-width="4"/><circle cx="48" cy="48" r="7" stroke="#b38b4d" stroke-width="4"/><path d="M20 20h16v16H18" stroke="#c9a56a" stroke-width="4" fill="none"/><path d="M36 24h12v16" stroke="#2b261f" stroke-width="4" fill="none"/></svg>`,
  cushion: `<svg viewBox="0 0 64 64" fill="none"><rect x="12" y="16" width="40" height="32" rx="8" fill="#b38b4d"/><circle cx="24" cy="32" r="4" fill="#f7f5ee"/><circle cx="32" cy="32" r="4" fill="#f7f5ee"/><circle cx="40" cy="32" r="4" fill="#f7f5ee"/></svg>`,
  mattress: `<svg viewBox="0 0 64 64" fill="none"><rect x="8" y="22" width="48" height="20" rx="8" fill="#c9a56a"/><path d="M8 32c6-8 10 8 16 0s10 8 16 0 10 8 16 0" stroke="#b38b4d" stroke-width="3" fill="none"/></svg>`,
  commode: `<svg viewBox="0 0 64 64" fill="none"><rect x="18" y="14" width="28" height="8" rx="2" fill="#c9a56a"/><rect x="16" y="22" width="32" height="22" rx="4" fill="#b38b4d"/><rect x="26" y="28" width="12" height="10" rx="3" fill="#f7f5ee"/></svg>`,
  mat: `<svg viewBox="0 0 64 64" fill="none"><rect x="10" y="16" width="44" height="32" rx="6" fill="#c9a56a"/><path d="M18 24h28M18 32h28M18 40h28" stroke="#b38b4d" stroke-width="3"/></svg>`,
  ramp: `<svg viewBox="0 0 64 64" fill="none"><path d="M8 48h48L20 16H8v32z" fill="#b38b4d"/><path d="M20 16l36 32" stroke="#c9a56a" stroke-width="4"/></svg>`,
  pant: `<svg viewBox="0 0 64 64" fill="none"><path d="M18 12h28l-4 40H22L18 12z" fill="#b38b4d"/><path d="M32 12v18" stroke="#f7f5ee" stroke-width="3"/></svg>`,
  measure: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="18" stroke="#b38b4d" stroke-width="4"/><path d="M32 20v14l10 6" stroke="#2b261f" stroke-width="4" fill="none"/></svg>`,
  resp: `<svg viewBox="0 0 64 64" fill="none"><rect x="14" y="16" width="20" height="32" rx="6" fill="#b38b4d"/><path d="M34 28h12v8H34" fill="#c9a56a"/><circle cx="48" cy="32" r="6" fill="#2b261f"/></svg>`,
  physio: `<svg viewBox="0 0 64 64" fill="none"><rect x="10" y="28" width="44" height="12" rx="6" fill="#b38b4d"/><circle cx="20" cy="34" r="8" fill="#c9a56a"/><circle cx="44" cy="34" r="8" fill="#c9a56a"/></svg>`,
  massage: `<svg viewBox="0 0 64 64" fill="none"><rect x="18" y="14" width="28" height="36" rx="10" fill="#b38b4d"/><circle cx="28" cy="28" r="4" fill="#f7f5ee"/><circle cx="36" cy="28" r="4" fill="#f7f5ee"/></svg>`,
  support: `<svg viewBox="0 0 64 64" fill="none"><path d="M20 14h24v12c0 14-4 24-12 28-8-4-12-14-12-28V14z" fill="#b38b4d"/><path d="M24 22h16" stroke="#f7f5ee" stroke-width="3"/></svg>`,
  rehab: `<svg viewBox="0 0 64 64" fill="none"><circle cx="18" cy="40" r="8" stroke="#b38b4d" stroke-width="4"/><circle cx="46" cy="40" r="8" stroke="#b38b4d" stroke-width="4"/><path d="M18 40h28M24 22h16" stroke="#c9a56a" stroke-width="4"/></svg>`,
  supply: `<svg viewBox="0 0 64 64" fill="none"><rect x="12" y="16" width="40" height="32" rx="6" fill="#c9a56a"/><rect x="20" y="24" width="24" height="6" fill="#b38b4d"/><rect x="20" y="34" width="16" height="6" fill="#b38b4d"/></svg>`,
  senior: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="18" r="8" fill="#c9a56a"/><path d="M20 52c2-12 8-18 12-18s10 6 12 18" fill="#b38b4d"/><rect x="18" y="36" width="28" height="6" rx="3" fill="#2b261f"/></svg>`,
  ewc: `<svg viewBox="0 0 64 64" fill="none"><circle cx="22" cy="46" r="10" stroke="#b38b4d" stroke-width="4"/><circle cx="48" cy="48" r="7" stroke="#b38b4d" stroke-width="4"/><path d="M20 18h18v16H18" stroke="#c9a56a" stroke-width="4" fill="none"/><rect x="38" y="20" width="10" height="6" fill="#2b261f"/></svg>`,
  sco: `<svg viewBox="0 0 64 64" fill="none"><circle cx="16" cy="46" r="8" fill="#2b261f"/><circle cx="48" cy="46" r="8" fill="#2b261f"/><path d="M14 36h28l8-12h-10" stroke="#b38b4d" stroke-width="4" fill="none"/><rect x="24" y="22" width="12" height="10" fill="#c9a56a"/></svg>`,
  dwc: `<svg viewBox="0 0 64 64" fill="none"><circle cx="24" cy="46" r="10" stroke="#b38b4d" stroke-width="4"/><circle cx="48" cy="48" r="7" stroke="#b38b4d" stroke-width="4"/><path d="M20 20h16v16H18" stroke="#c9a56a" stroke-width="4" fill="none"/></svg>`,
  hear: `<svg viewBox="0 0 64 64" fill="none"><path d="M36 16a14 14 0 0 0-14 14v8h8v-8a6 6 0 1 1 12 0v18a6 6 0 0 1-8 5" stroke="#b38b4d" stroke-width="4" fill="none"/><circle cx="28" cy="50" r="4" fill="#c9a56a"/></svg>`,
  pos: `<svg viewBox="0 0 64 64" fill="none"><rect x="20" y="12" width="24" height="14" rx="4" fill="#c9a56a"/><rect x="16" y="26" width="32" height="20" rx="4" fill="#b38b4d"/><rect x="22" y="46" width="6" height="8" fill="#2b261f"/><rect x="36" y="46" width="6" height="8" fill="#2b261f"/></svg>`,
  walkd: `<svg viewBox="0 0 64 64" fill="none"><path d="M16 18h8v28h-8zM40 18h8v28h-8z" fill="#b38b4d"/><rect x="16" y="24" width="32" height="6" fill="#c9a56a"/></svg>`,
  ortho: `<svg viewBox="0 0 64 64" fill="none"><path d="M28 8h8v20l8 24h-8l-4-12-4 12h-8l8-24V8z" fill="#b38b4d"/></svg>`,
  sens: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="10" stroke="#b38b4d" stroke-width="4"/><path d="M8 32c8-14 16-20 24-20s16 6 24 20c-8 14-16 20-24 20S16 46 8 32z" stroke="#c9a56a" stroke-width="3" fill="none"/></svg>`
};

const CART_KEY = "oncare-cart";
const CHECKOUT_ITEMS_KEY = "oncare-checkout-items";
const CART_STORAGE_KEYS = ["oncare-cart", "hyundai_cart_items", "cart", "oncare-checkout-items", "oncare-checkout-ids"];

function cart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (_e) {
    return [];
  }
}
let cartSaveTimer = 0;
function persistCartIfLoggedIn(items, immediate) {
  if (!window.currentUser || !window.currentUser.id) return;
  clearTimeout(cartSaveTimer);
  const run = () => {
    api("/api/cart", { method: "PUT", body: JSON.stringify({ items: items || cart() }) }).catch(() => {});
  };
  if (immediate) run();
  else cartSaveTimer = setTimeout(run, 250);
}
function saveCart(items, immediate) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
  persistCartIfLoggedIn(items, immediate);
}
async function loadUserCart() {
  if (!window.currentUser || !window.currentUser.id) return;
  try {
    const data = await api("/api/cart");
    const items = (data.items || []).map((item) => ({
      id: item.id || item.product_id,
      qty: Math.max(1, Math.min(20, Number(item.qty || item.quantity) || 1))
    })).filter((item) => item.id);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
    renderCart();
    if (typeof window.__renderCheckout === "function") window.__renderCheckout();
  } catch (_e) {}
}
function wipeClientCart() {
  CART_STORAGE_KEYS.forEach((key) => {
    try { localStorage.removeItem(key); } catch (_e) {}
    try { sessionStorage.removeItem(key); } catch (_e) {}
  });
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = "0";
    el.style.display = "none";
  });
}
async function logout() {
  try { await api("/api/logout", { method: "POST", body: "{}" }); } catch (_e) {}
  try { localStorage.removeItem("sso_access_token"); } catch (_e) {}
  wipeClientCart();
  location.href = "index.html";
}
function checkoutItems() {
  try {
    const picked = JSON.parse(sessionStorage.getItem(CHECKOUT_ITEMS_KEY) || "[]");
    if (Array.isArray(picked) && picked.length) return picked;
  } catch (_e) {}
  return cart();
}
function rememberCheckoutItems(items) {
  try { sessionStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(items || [])); } catch (_e) {}
}
function removeOrderedFromCart(productIds) {
  const drop = new Set((productIds || []).map((id) => String(id)));
  if (!drop.size) {
    try {
      (JSON.parse(sessionStorage.getItem(CHECKOUT_ITEMS_KEY) || "[]") || []).forEach((item) => drop.add(String(item.id)));
    } catch (_e) {}
  }
  if (drop.size) saveCart(cart().filter((item) => !drop.has(String(item.id))), true);
  try { sessionStorage.removeItem(CHECKOUT_ITEMS_KEY); } catch (_e) {}
}
function addToCart(id, qty = 1) {
  const items = cart();
  const found = items.find((i) => i.id === id);
  if (found) found.qty += qty;
  else items.push({ id, qty });
  saveCart(items);
  renderCart();
  toast("장바구니에 담았습니다.");
}
function removeFromCart(id) {
  saveCart(cart().filter((i) => i.id !== id));
  syncCheckoutItemQty(id, 0);
  renderCart();
  if (typeof window.__renderCheckout === "function") window.__renderCheckout();
}
function setCartQty(id, qty) {
  const next = Math.max(1, Math.min(20, Number(qty) || 1));
  const items = cart();
  const found = items.find((item) => String(item.id) === String(id));
  if (found) found.qty = next;
  else items.push({ id, qty: next });
  saveCart(items);
  syncCheckoutItemQty(id, next);
  renderCart();
  if (typeof window.__renderCheckout === "function") window.__renderCheckout();
}
function syncCheckoutItemQty(id, qty) {
  try {
    const picked = JSON.parse(sessionStorage.getItem(CHECKOUT_ITEMS_KEY) || "[]");
    if (!Array.isArray(picked) || !picked.length) return;
    const next = qty < 1
      ? picked.filter((item) => String(item.id) !== String(id))
      : picked.map((item) => String(item.id) === String(id) ? Object.assign({}, item, { qty }) : item);
    sessionStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(next));
  } catch (_e) {}
}
function updateCartCount() {
  const n = cart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = n;
    el.style.display = n ? "grid" : "none";
  });
}
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
}

function headerHTML(page) {
  const nav = [
    ["index.html", "홈", "home"],
    ["shop.html#group=welfare", "복지용구", "welfare"],
    ["shop.html#group=uninsured", "비급여", "uninsured"],
    ["shop.html#group=disability", "장애인 용품", "disability"],
    ["guide.html", "이용안내", "guide"],
    ["consult.html", "상담신청", "consult"],
    ["mypage.html", "마이페이지", "account"],
    ["about.html", "사업소 소개", "about"]
  ];
  return `
  <div class="topbar"><div class="wrap">
    <div>헤리움 케어센터와 함께하는 복지용구 · 일반의료기 · 장애인 용품</div>
    <div class="topbar-right">
      <a href="https://heriumcare.com/main.html" target="_blank" rel="noopener">헤리움 케어센터</a>
      <span>평일 09:00–18:00</span>
      <a href="consult.html">상담문의</a>
    </div>
  </div></div>
  <header class="site-header">
    <div class="wrap header-main">
      <button class="icon-btn menu-toggle" data-open-nav aria-label="메뉴">☰</button>
      <a class="logo" href="index.html">
        <span class="logo-mark">현</span>
        <span><strong>현대 의료기</strong><span class="en">HYUNDAI MEDICAL</span><span class="ko">복지용구 · 일반의료기 · 장애인 용품</span></span>
      </a>
      <form class="search" action="shop.html" data-search>
        <input name="q" placeholder="혈압계, 전동침대, 보청기 검색" value="${getParam("q") || ""}" />
        <button type="submit">검색</button>
      </form>
      <div class="header-actions">
        <a class="phone-chip" href="tel:054-334-9986">
          <span>📞</span>
          <span><small>전문상담</small><b>054-334-9986</b></span>
        </a>
        <a class="auth-chip" id="auth-link" href="login.html" title="로그인">로그인</a>
        <button class="auth-chip" id="logout-link" type="button" data-logout hidden>로그아웃</button>
        <button class="icon-btn" data-open-cart aria-label="장바구니">🛒<span class="cart-count" data-cart-count>0</span></button>
      </div>
    </div>
    <nav class="nav" id="main-nav"><div class="wrap">
      ${nav.map(([href, label, key]) => `<a href="${href}" class="${page === key ? "active" : ""}">${label}</a>`).join("")}
    </div></nav>
  </header>`;
}

function footerHTML() {
  return `
  <footer class="site-footer">
    <div class="footer-inner wrap">
      <div class="business-info">
        <p><strong>상호명:</strong> <span data-company="shop_company_name">[상호명]</span> | <strong>대표자:</strong> <span data-company="shop_owner">[대표자 성명]</span> | <strong>개인정보보호책임자:</strong> <span data-company="shop_privacy_officer">[책임자 성명]</span></p>
        <p><strong>사업자등록번호:</strong> <span data-company="shop_biz_no">[000-00-00000]</span> | <strong>통신판매업신고:</strong> <span data-company="shop_online_sales_no">[제 0000-0000호]</span></p>
        <p><strong>사업장 주소:</strong> <span data-company="shop_address">[사업장 주소 입력]</span> | <strong>고객센터:</strong> <span data-company="shop_phone">[전화번호]</span> (평일 09:00~18:00)</p>
        <p><strong>이메일:</strong> <span data-company="shop_email">[고객센터 이메일]</span></p>
      </div>
      <div class="footer-links">
        <a href="/terms/">이용약관</a> |
        <a href="/privacy/"><strong>개인정보처리방침</strong></a> |
        <a href="/returns/">교환 및 반품 안내</a>
      </div>
      <p class="copyright">© 현대의료기. All rights reserved.</p>
    </div>
  </footer>
  <div class="float-cs">
    <a class="kakao" href="consult.html">카카오 상담</a>
    <a class="call" href="tel:054-334-9986">전화상담</a>
  </div>
  <nav class="mobile-nav">
    <a href="index.html">🏠<br>홈</a>
    <a href="shop.html">🛍️<br>상품군</a>
    <a href="guide.html">📋<br>급여안내</a>
    <a href="mypage.html">👤<br>마이</a>
    <a href="#" data-open-cart>🛒<br>장바구니</a>
  </nav>
  <div class="cart-drawer" id="cart-drawer">
    <aside class="drawer">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>장바구니</h3>
        <button class="icon-btn" data-close-cart>✕</button>
      </div>
      <label class="cart-select-all" id="cart-select-bar">
        <input type="checkbox" id="cart-select-all" checked /> 전체 선택
      </label>
      <div id="cart-list"></div>
      <div class="cart-total" id="cart-total"></div>
      <button class="btn btn-teal btn-lg" type="button" data-cart-checkout style="width:100%">선택 상품 주문하기</button>
    </aside>
  </div>`;
}

function passwordRuleError(password) {
  const value = String(password || "");
  if (value.length < 8 || value.length > 16 || !/[A-Za-z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return "영문, 숫자, 특수문자를 포함하여 8~16자로 입력해 주세요.";
  }
  return "";
}

function nameRuleError(name) {
  const compact = String(name || "").replace(/\s+/g, "");
  if (!/^[가-힣A-Za-z]{2,40}$/.test(compact)) {
    return "이름은 한글 또는 영문 2자 이상으로 입력해 주세요.";
  }
  return "";
}

function emailRuleError(email) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || "").trim())) {
    return "이메일 형식을 확인해 주세요.";
  }
  return "";
}

function phoneRuleError(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!/^010\d{8}$/.test(digits)) {
    return "연락처는 010-0000-0000 형식으로 입력해 주세요.";
  }
  return "";
}

function bindPasswordChecks(input) {
  const list = document.querySelector("#pw-checks");
  if (!input || !list) return;
  const apply = () => {
    const v = input.value || "";
    const checks = {
      len: v.length >= 8 && v.length <= 16,
      letter: /[A-Za-z]/.test(v),
      digit: /\d/.test(v),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(v)
    };
    list.querySelectorAll("[data-check]").forEach((li) => {
      li.classList.toggle("ok", !!checks[li.dataset.check]);
    });
  };
  input.addEventListener("input", apply);
  apply();
}

function ensurePostcodeLayer() {
  let wrap = document.getElementById("postcode-layer");
  if (wrap) return wrap;
  wrap = document.createElement("div");
  wrap.id = "postcode-layer";
  wrap.hidden = true;
  wrap.innerHTML = `<div class="postcode-dim" data-postcode-close></div>
    <div class="postcode-panel" role="dialog" aria-modal="true" aria-label="주소 검색">
      <button type="button" class="postcode-close" data-postcode-close>닫기</button>
      <div data-postcode-box style="width:100%;height:min(460px,70vh)"></div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.addEventListener("click", (e) => {
    if (e.target.closest("[data-postcode-close]")) wrap.hidden = true;
  });
  return wrap;
}

function fillPostcode(form, data) {
  const road = data.roadAddress || data.jibunAddress || "";
  if (form.zipcode) form.zipcode.value = data.zonecode || "";
  if (form.address_basic) form.address_basic.value = road;
  else if (form.address) form.address.value = road;
  if (form.address_detail) form.address_detail.focus();
}

function bindPostcode(btn, form) {
  if (!btn || !form) return;
  btn.onclick = function () {
    function openMap() {
      const wrap = ensurePostcodeLayer();
      const box = wrap.querySelector("[data-postcode-box]");
      box.innerHTML = "";
      wrap.hidden = false;
      new window.daum.Postcode({
        oncomplete: function (data) {
          fillPostcode(form, data);
          wrap.hidden = true;
        },
        onclose: function () {
          wrap.hidden = true;
        },
        width: "100%",
        height: "100%"
      }).embed(box);
    }
    if (window.daum && window.daum.Postcode) { openMap(); return; }
    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.charset = "UTF-8";
    script.onload = openMap;
    script.onerror = function () {
      toast("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    };
    document.body.appendChild(script);
  };
}

async function api(path, opts) {
  const headers = { "Content-Type": "application/json", "X-Requested-With": "fetch" };
  try {
    const token = localStorage.getItem("sso_access_token");
    if (token) headers.Authorization = "Bearer " + token;
  } catch (_e) {}
  const res = await fetch(path, Object.assign({
    credentials: "include",
    headers
  }, opts || {}));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "요청에 실패했습니다.");
  return data;
}

async function apiMe() {
  try {
    const data = await api("/api/me");
    return data.user || null;
  } catch (_e) {
    return null;
  }
}

function loginNext() {
  let raw = String(getParam("next") || "").trim();
  if (!raw) return "mypage.html";
  raw = raw.replace(/^\/+/, "");
  if (/^account\.html/i.test(raw)) return "mypage.html";
  const file = String(raw.split(/[#?]/)[0] || "");
  if (!/^[a-z0-9_-]+(\.html)?$/i.test(file)) return "mypage.html";
  return raw;
}

function isAdminUser(user) {
  return Boolean(user && (user.isAdmin || user.role === "admin"));
}

function afterLoginRedirect(user) {
  const next = loginNext();
  const file = String(next.split(/[#?]/)[0] || "");
  const adminReturn = /^admin(\.html)?$/i.test(file) || (!/\.html$/i.test(file) && file !== "mypage");
  if (adminReturn && !isAdminUser(user)) {
    showFormError("#login-error", "관리자 권한이 없는 계정입니다. 헤리움 관리자 계정으로 로그인해 주세요.");
    return;
  }
  if (adminReturn && isAdminUser(user)) {
    location.href = file.indexOf(".html") >= 0 ? file : "/" + file;
    return;
  }
  location.href = next;
}

function showFormError(id, msg) {
  const el = document.querySelector(id);
  if (!el) return toast(msg);
  el.hidden = !msg;
  el.textContent = msg || "";
}

function statusLabel(status) {
  return {
    READY: "결제대기",
    PENDING: "결제대기",
    PAID: "결제완료",
    PREPARING: "배송준비중",
    SHIPPING: "배송중",
    SHIPPED: "배송중",
    DELIVERED: "배송완료",
    CANCEL_REQUESTED: "취소요청",
    CANCELLED: "취소완료",
    CANCELED: "취소완료",
    received: "결제대기",
    reviewing: "배송준비중",
    confirmed: "배송준비중",
    cancelled: "취소완료"
  }[status] || status;
}

function statusClass(status) {
  return {
    READY: "is-prep",
    PENDING: "is-prep",
    PAID: "is-paid",
    PREPARING: "is-prep",
    SHIPPING: "is-ship",
    SHIPPED: "is-ship",
    DELIVERED: "is-done",
    CANCEL_REQUESTED: "is-cancel",
    CANCELLED: "is-cancel",
    CANCELED: "is-cancel"
  }[status] || "is-prep";
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function refreshAuth() {
  return apiMe().then((user) => {
    window.currentUser = user;
    const link = document.querySelector("#auth-link");
    const logoutBtn = document.querySelector("#logout-link");
    if (link) {
      if (user) {
        link.href = "mypage.html";
        link.title = "마이페이지";
        link.textContent = (user.name || user.username || "회원") + "님";
      } else {
        link.href = "login.html";
        link.title = "로그인";
        link.textContent = "로그인";
      }
    }
    if (logoutBtn) logoutBtn.hidden = !user;
    if (user) return loadUserCart().then(() => user);
    return user;
  });
}

function getParam(key) {
  const fromSearch = new URLSearchParams(location.search).get(key);
  if (fromSearch) return fromSearch;
  const hash = location.hash.replace(/^#/, "").replace(/^\?/, "");
  return hash ? new URLSearchParams(hash).get(key) : null;
}

function shopBase() {
  const path = location.pathname.replace(/\\/g, "/");
  if (/shop\.html$/i.test(path)) return "shop.html";
  if (/\/shop$/i.test(path) || /(?:^|\/)shop$/i.test(path)) return "shop";
  return "shop.html";
}

function badgeLabel(b) {
  return { hot: "인기", rent: "대여", ship: "오늘출발", cash: "비급여", aid: "보조기기" }[b] || b;
}

function priceHTML(p) {
  const g = productGroup(p);
  const period = p.period ? p.period + " " : "";
  if (g === "welfare") {
    return `<div class="full">${p.mode === "rent" ? "월 대여가 " : "판매가 "}${won(p.price)}</div>
        <div class="now">${period}${won(copay(p.price))}</div>
        <small>일반 대상자 본인부담금 15%</small>`;
  }
  if (g === "disability") {
    return `<div class="full plain">${p.mode === "rent" ? "월 대여가" : "판매가"}</div>
        <div class="now">${won(p.price)}</div>
        <small>보조기기 급여 가능 여부 상담</small>`;
  }
  return `<div class="full plain">${p.mode === "rent" ? "월 대여가" : "판매가"}</div>
        <div class="now">${won(p.price)}</div>
        <small>비급여 · 일반 구매</small>`;
}

function productImages(p) {
  const out = [];
  function push(url) {
    const value = String(url || "").trim();
    if (value && out.indexOf(value) < 0) out.push(value);
  }
  if (p && Array.isArray(p.images)) p.images.forEach(push);
  push(p && (p.thumbnail || p.thumbnail_url || p.image_url));
  return out;
}

function thumbHTML(p, className) {
  const cls = className || "thumb";
  const images = productImages(p);
  const fallback = ICONS[(p && p.category) || "bed"] || ICONS.bed;
  if (images[0]) return `<div class="${cls}"><img src="${esc(images[0])}" alt="${esc((p && p.name) || "")}"></div>`;
  return `<div class="${cls}">${fallback}</div>`;
}

function galleryHTML(p) {
  const images = productImages(p);
  const fallback = ICONS[p.category] || ICONS.bed;
  if (!images.length) {
    return `<div class="gallery">${fallback}</div>`;
  }
  const thumbs = images.map((url, i) =>
    `<button type="button" class="gallery-thumb ${i === 0 ? "is-active" : ""}" data-gallery-src="${esc(url)}"><img src="${esc(url)}" alt=""></button>`
  ).join("");
  return `<div class="gallery has-photo">
    <div class="gallery-main"><img id="gallery-main-img" src="${esc(images[0])}" alt="${esc(p.name)}"></div>
    ${images.length > 1 ? `<div class="gallery-thumbs">${thumbs}</div>` : ""}
  </div>`;
}

function bindGallery(root) {
  const main = root.querySelector("#gallery-main-img");
  if (!main) return;
  root.querySelectorAll("[data-gallery-src]").forEach((btn) => {
    const show = () => {
      const src = btn.getAttribute("data-gallery-src");
      if (!src || main.getAttribute("src") === src) return;
      main.style.opacity = "0";
      setTimeout(() => {
        main.src = src;
        main.style.opacity = "1";
      }, 160);
      root.querySelectorAll("[data-gallery-src]").forEach((el) => el.classList.toggle("is-active", el === btn));
    };
    btn.addEventListener("mouseenter", show);
    btn.addEventListener("focus", show);
    btn.addEventListener("click", show);
  });
}

let catalogHydrate = null;
function hydrateCatalog() {
  if (catalogHydrate) return catalogHydrate;
  catalogHydrate = api("/api/products").then((data) => {
    (data.products || []).forEach((row) => {
      const local = productById(row.id);
      if (!local) return;
      if (row.thumbnail) local.thumbnail = row.thumbnail;
      if (row.images) local.images = row.images;
      if (row.desc) local.desc = row.desc;
      if (row.stock != null) local.stock = row.stock;
      if (row.isHygiene != null) local.isHygiene = row.isHygiene;
    });
    renderCart();
    if (typeof window.__renderCheckout === "function") window.__renderCheckout();
  }).catch(() => {});
  return catalogHydrate;
}

function maskName(name) {
  const text = String(name || "").trim();
  if (!text) return "구매자";
  if (text.length === 1) return "*";
  if (text.length === 2) return text[0] + "*";
  return text[0] + "*" + text.slice(-1);
}

function starIcons(n) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function productCard(p) {
  const g = productGroup(p);
  const images = productImages(p);
  const visual = images[0]
    ? `<img src="${esc(images[0])}" alt="${esc(p.name)}">`
    : (ICONS[p.category] || ICONS.bed);
  return `<article class="card">
    <a href="product.html#id=${p.id}">
      <div class="thumb">
        <div class="badges">${(p.badges || []).map((b) => `<span class="badge ${b}">${badgeLabel(b)}</span>`).join("")}</div>
        ${visual}
      </div>
    </a>
    <div class="card-body">
      <div class="card-cat">${groupName(g)} · ${categoryName(p.category)} · ${p.mode === "rent" ? "대여" : p.mode === "both" ? "구매/대여" : "구매"}</div>
      <h3><a href="product.html#id=${p.id}">${p.name}</a></h3>
      <div class="price-row">${priceHTML(p)}</div>
      <div class="card-actions">
        <button class="btn btn-outline" data-add="${p.id}">담기</button>
        <a class="btn btn-teal" href="product.html#id=${p.id}">자세히</a>
      </div>
    </div>
  </article>`;
}

function renderCards(selector, list) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = list.length ? list.map(productCard).join("") : `<p class="empty">해당하는 상품이 없습니다.</p>`;
}

function cartLinePay(item) {
  const p = productById(item.id);
  if (!p) return 0;
  const unit = isWelfare(p) ? copay(p.price) : (p.salePrice || p.price);
  return unit * (Number(item.qty) || 1);
}

function selectedCartIds() {
  const boxes = document.querySelectorAll("[data-cart-check]");
  if (!boxes.length) return cart().map((item) => String(item.id));
  return Array.from(boxes).filter((box) => box.checked).map((box) => box.getAttribute("data-cart-check"));
}

function updateCartTotals() {
  const totalEl = document.querySelector("#cart-total");
  const bar = document.querySelector("#cart-select-bar");
  const items = cart();
  const boxes = document.querySelectorAll("[data-cart-check]");
  const all = document.querySelector("#cart-select-all");
  if (bar) bar.hidden = !items.length;
  if (!items.length) {
    if (totalEl) totalEl.innerHTML = "";
    return;
  }
  const selected = new Set(selectedCartIds());
  if (all && boxes.length) {
    all.checked = Array.from(boxes).every((box) => box.checked);
    all.indeterminate = Array.from(boxes).some((box) => box.checked) && !all.checked;
  }
  const goods = items.reduce((sum, item) => selected.has(String(item.id)) ? sum + cartLinePay(item) : sum, 0);
  const ship = goods >= 50000 || goods <= 0 ? 0 : 3000;
  const pay = goods + ship;
  if (totalEl) {
    totalEl.innerHTML = `<div class="cart-summary-row">선택 상품 금액 ${won(goods)}</div>
      <div class="cart-summary-row">배송비 ${ship ? won(ship) : "무료"}</div>
      <div>최종 결제 예정 금액 ${won(pay)}</div>`;
  }
}

function startSelectedCheckout() {
  const selected = new Set(selectedCartIds());
  const items = cart().filter((item) => selected.has(String(item.id)) && productById(item.id));
  if (!items.length) {
    toast("주문할 상품을 선택해 주세요.");
    return;
  }
  rememberCheckoutItems(items.map((item) => ({ id: item.id, qty: item.qty })));
  location.href = "checkout.html";
}

function renderCart() {
  const list = document.querySelector("#cart-list");
  if (!list) return;
  const items = cart();
  const prev = Array.from(document.querySelectorAll("[data-cart-check]")).reduce((set, box) => {
    if (box.checked) set.add(box.getAttribute("data-cart-check"));
    return set;
  }, new Set());
  const hadBoxes = document.querySelectorAll("[data-cart-check]").length > 0;
  if (!items.length) {
    list.innerHTML = `<p class="empty">장바구니가 비어 있습니다.</p>`;
    updateCartTotals();
    return;
  }
  list.innerHTML = items.map((i) => {
    const p = productById(i.id);
    if (!p) return "";
    const pay = cartLinePay(i);
    const checked = !hadBoxes || prev.has(String(p.id));
    return `<div class="cart-item">
      <label class="cart-check"><input type="checkbox" data-cart-check="${esc(p.id)}" ${checked ? "checked" : ""} /></label>
      ${thumbHTML(p, "cart-item-thumb")}
      <div>
        <b>${esc(p.name)}</b>
        <div>${isWelfare(p) ? "본인부담" : "판매가"} ${won(pay)}</div>
        <div class="qty-ctrl">
          <button type="button" data-qty="-1" data-qty-id="${esc(p.id)}" aria-label="수량 줄이기" ${i.qty <= 1 ? "disabled" : ""}>−</button>
          <span>${i.qty}</span>
          <button type="button" data-qty="1" data-qty-id="${esc(p.id)}" aria-label="수량 늘리기">+</button>
        </div>
      </div>
      <button class="icon-btn cart-remove" data-remove="${esc(p.id)}" aria-label="상품 삭제">삭제</button>
    </div>`;
  }).join("");
  updateCartTotals();
}

function applyRegistrationGate() {
  return fetch("/api/public-config", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      if (!data || data.registrationOpen !== false) return true;
      document.querySelectorAll("a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (/(^|\/)signup\.html$/.test(href)) link.hidden = true;
      });
      const form = document.querySelector("#signup-form");
      const note = document.querySelector("#signup-closed");
      if (form) form.hidden = true;
      if (note) note.hidden = false;
      return false;
    })
    .catch(() => true);
}

function mountShell(page) {
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");
  if (header) header.innerHTML = headerHTML(page);
  if (footer) footer.innerHTML = footerHTML();
  api("/api/company").then((data) => {
    const company = (data && data.company) || {};
    document.querySelectorAll("[data-company]").forEach((el) => {
      const value = company[el.getAttribute("data-company")];
      if (value) el.textContent = value;
    });
  }).catch(() => {});
  updateCartCount();
  renderCart();
  hydrateCatalog();
  refreshAuth();
  applyRegistrationGate();
  if (window.__shellBound) return;
  window.__shellBound = true;

  document.body.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-search]");
    if (!form) return;
    e.preventDefault();
    const q = (form.q && form.q.value || "").trim();
    location.href = shopQuery({ q });
  });
  document.body.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) addToCart(add.dataset.add);
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      e.preventDefault();
      if (qtyBtn.disabled) return;
      const id = qtyBtn.getAttribute("data-qty-id");
      const step = Number(qtyBtn.getAttribute("data-qty")) || 0;
      const item = cart().find((row) => String(row.id) === String(id));
      const current = item && item.qty ? item.qty : 1;
      if (step < 0 && current <= 1) return;
      setCartQty(id, current + step);
      return;
    }
    const remove = e.target.closest("[data-remove]");
    if (remove) removeFromCart(remove.dataset.remove);
    if (e.target.closest("[data-logout]")) {
      e.preventDefault();
      logout();
      return;
    }
    if (e.target.closest("[data-cart-checkout]")) {
      e.preventDefault();
      startSelectedCheckout();
      return;
    }
    if (e.target.closest("[data-open-cart]")) {
      e.preventDefault();
      document.querySelector("#cart-drawer").classList.add("open");
      renderCart();
    }
    if (e.target.closest("[data-close-cart]") || e.target.id === "cart-drawer") {
      document.querySelector("#cart-drawer").classList.remove("open");
    }
    if (e.target.closest("[data-open-nav]")) {
      const nav = document.querySelector("#main-nav");
      nav.style.display = nav.style.display === "block" ? "" : "block";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const drawer = document.querySelector("#cart-drawer");
    if (drawer) drawer.classList.remove("open");
  });
  document.body.addEventListener("change", (e) => {
    if (e.target.id === "cart-select-all") {
      document.querySelectorAll("[data-cart-check]").forEach((box) => {
        box.checked = e.target.checked;
      });
      updateCartTotals();
      return;
    }
    if (e.target.closest("[data-cart-check]")) updateCartTotals();
  });
}

function initHome() {
  mountShell("home");
  const lineups = document.querySelector("#lineup-grid");
  if (lineups) {
    lineups.innerHTML = GROUPS.map((g) => `
      <a class="lineup lineup-${g.id}" href="${g.href}">
        <span class="tag">${g.blurb}</span>
        <h3>${g.name}</h3>
        <p>${g.note}</p>
        <span class="link-more">상품 보기</span>
      </a>`).join("");
  }
  renderCards("#best-grid", productsByFilter({ featured: true }).slice(0, 4));
  renderCards("#uninsured-grid", productsByFilter({ group: "uninsured", featured: true }).slice(0, 4));
  renderCards("#disability-grid", productsByFilter({ group: "disability" }).slice(0, 4));
  renderCards("#buy-grid", productsByFilter({ group: "welfare", mode: "buy" }).slice(0, 4));
  renderCards("#rent-grid", productsByFilter({ group: "welfare", mode: "rent" }).slice(0, 4));
  const cats = document.querySelector("#cat-grid");
  if (cats) {
    const picks = [
      ...CATEGORIES.filter((c) => c.group === "welfare").slice(0, 4),
      ...CATEGORIES.filter((c) => c.group === "uninsured").slice(0, 4),
      ...CATEGORIES.filter((c) => c.group === "disability").slice(0, 4)
    ];
    cats.innerHTML = picks.map((c) => `
      <a class="cat" href="shop.html#group=${c.group}&category=${c.id}">
        <div class="cat-ico">${ICONS[c.id] || ICONS.bed}</div>
        <b>${c.name}</b>
        <small>${groupName(c.group)}</small>
      </a>`).join("");
  }
}

const PAGE_SIZE = 24;

function shopQuery({ group, category, mode, q, page }) {
  const p = new URLSearchParams();
  if (group && group !== "all") p.set("group", group);
  if (category && category !== "all") p.set("category", category);
  if (mode && mode !== "all") p.set("mode", mode);
  if (q) p.set("q", q);
  if (page && page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? shopBase() + "#" + s : shopBase();
}

function initShop() {
  const group = getParam("group") || "all";
  const mode = getParam("mode") || "all";
  const category = getParam("category") || "all";
  const q = getParam("q") || "";
  const page = Math.max(1, Number(getParam("page") || 1));
  mountShell(group === "all" ? "shop" : group);
  const groupChips = document.querySelector("#group-chips");
  if (groupChips) {
    const items = [{ id: "all", name: "전체 상품군" }, ...GROUPS.map((g) => ({ id: g.id, name: g.name }))];
    groupChips.innerHTML = items.map((g) =>
      `<a class="chip ${g.id === group ? "active" : ""}" href="${shopQuery({ group: g.id, q })}">${g.name}</a>`
    ).join("");
  }
  const modeChips = document.querySelector("#mode-chips");
  if (modeChips) {
    modeChips.innerHTML = "";
    if (group === "welfare" || group === "all") {
      [["all", "구매·대여 전체"], ["buy", "구매"], ["rent", "대여"]].forEach(([id, label]) => {
        const a = document.createElement("a");
        a.className = "chip" + (mode === id ? " active" : "");
        a.href = shopQuery({ group, category, mode: id, q });
        a.textContent = label;
        modeChips.appendChild(a);
      });
    } else {
      modeChips.innerHTML = `<span class="chip active">일반 구매</span>`;
    }
  }
  const chips = document.querySelector("#filter-chips");
  if (chips) {
    const items = [{ id: "all", name: "전체 품목" }, ...categoriesByGroup(group)];
    chips.innerHTML = items.map((c) =>
      `<a class="chip ${c.id === category ? "active" : ""}" href="${shopQuery({ group, category: c.id, mode, q })}">${c.name}</a>`
    ).join("");
  }
  function paintShop(list) {
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const safePage = Math.min(page, pages);
    const slice = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const title = document.querySelector("#shop-title");
    if (title) {
      title.textContent = q
        ? `"${q}" 검색 결과`
        : category !== "all"
          ? categoryName(category)
          : group === "uninsured"
            ? "비급여 · 일반의료기 · 노인생활용품"
            : group === "disability"
              ? "장애인 용품"
              : mode === "rent"
                ? "복지용구 대여"
                : group === "welfare"
                  ? "복지용구"
                  : "전체 상품";
    }
    const count = document.querySelector("#shop-count");
    if (count) count.textContent = `${list.length}개 상품${pages > 1 ? ` · ${safePage}/${pages}페이지` : ""}`;
    renderCards("#shop-grid", slice);
    const pager = document.querySelector("#shop-pager");
    if (pager) {
      if (pages <= 1) pager.innerHTML = "";
      else {
        const links = [];
        if (safePage > 1) links.push(`<a class="chip" href="${shopQuery({ group, category, mode, q, page: safePage - 1 })}">이전</a>`);
        for (let i = 1; i <= pages; i++) {
          if (pages > 8 && Math.abs(i - safePage) > 2 && i !== 1 && i !== pages) {
            if (links[links.length - 1] !== `<span class="chip muted">…</span>`) links.push(`<span class="chip muted">…</span>`);
            continue;
          }
          links.push(`<a class="chip ${i === safePage ? "active" : ""}" href="${shopQuery({ group, category, mode, q, page: i })}">${i}</a>`);
        }
        if (safePage < pages) links.push(`<a class="chip" href="${shopQuery({ group, category, mode, q, page: safePage + 1 })}">다음</a>`);
        pager.innerHTML = links.join("");
      }
    }
  }
  paintShop(productsByFilter({ group, category, mode, q }));
  if (q) {
    api("/api/products/search?q=" + encodeURIComponent(q)).then((data) => {
      const next = [];
      const seen = {};
      (data.products || []).forEach((row) => {
        const local = productById(row.id);
        if (!local || seen[local.id]) return;
        if (row.images) local.images = row.images;
        if (row.thumbnail) local.thumbnail = row.thumbnail;
        const pg = productGroup(local);
        if (group && group !== "all" && pg !== group) return;
        if (category && category !== "all" && local.category !== category) return;
        if (mode && mode !== "all" && local.mode !== mode && local.mode !== "both") return;
        seen[local.id] = true;
        next.push(local);
      });
      if (next.length) paintShop(next);
    }).catch(() => {});
  }
  if (!window.__shopHashBound) {
    window.__shopHashBound = true;
    window.addEventListener("hashchange", () => {
      if (/shop/i.test(location.pathname)) initShop();
    });
  }
}

function bindProductTabs(root) {
  const tabs = root.querySelectorAll("[data-product-tab]");
  function show(name) {
    tabs.forEach((tab) => {
      const on = tab.getAttribute("data-product-tab") === name;
      tab.classList.toggle("is-active", on);
    });
    root.querySelectorAll("[data-product-pane]").forEach((pane) => {
      pane.hidden = pane.getAttribute("data-product-pane") !== name;
    });
  }
  tabs.forEach((tab) => {
    tab.onclick = () => show(tab.getAttribute("data-product-tab"));
  });
  show("detail");
}

function initProduct() {
  const p = productById(getParam("id"));
  mountShell(p ? productGroup(p) : "shop");
  const box = document.querySelector("#product");
  if (!p || !box) {
    if (box) box.innerHTML = `<p class="empty">상품을 찾을 수 없습니다.</p>`;
    return;
  }
  const g = productGroup(p);
  const pay15 = copay(p.price, 0.15);
  const pay9 = copay(p.price, 0.09);
  const pay6 = copay(p.price, 0.06);
  document.title = p.name + " | 현대 의료기";
  const priceBox = g === "welfare"
    ? `<div class="full">${p.period ? "월 대여가" : "판매가"} ${won(p.price)}</div>
          <div class="now">${p.period ? "월 " : ""}${won(pay15)}</div>
          <small>일반 15% 기준 본인부담금 · 감경 9% ${won(pay9)} · 6% ${won(pay6)} · 기초 0원</small>`
    : g === "disability"
      ? `<div class="full">판매가</div>
          <div class="now">${won(p.price)}</div>
          <small>장애인 보조기기 급여 대상 여부는 장애 유형·소견서로 안내합니다. 표시 가격은 상담 전 예시입니다.</small>`
      : `<div class="full">판매가</div>
          <div class="now">${won(p.price)}</div>
          <small>비급여 일반 구매 상품입니다. 장기요양 한도와 별개입니다.</small>`;
  const specRows = Object.entries(p.specs || {}).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
  box.innerHTML = `
    <div class="crumbs"><a href="index.html">홈</a> · <a href="shop.html#group=${g}">${groupName(g)}</a> · ${categoryName(p.category)}</div>
    <div class="product-layout">
      ${galleryHTML(p)}
      <div class="buybox">
        <div class="meta" id="product-meta">★ ${p.rating} · 후기 ${p.reviews} · ${groupName(g)} · ${p.mode === "rent" ? "대여상품" : "구매상품"}</div>
        <h1>${p.name}</h1>
        <p>${p.desc}</p>
        <div class="price-box">${priceBox}</div>
        <ul class="spec">${Object.entries(p.specs || {}).map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("")}</ul>
        <div class="qty">
          <button type="button" id="minus">−</button>
          <strong id="qty">1</strong>
          <button type="button" id="plus">+</button>
        </div>
        <div class="card-actions">
          <button class="btn btn-outline btn-lg" id="add-btn">장바구니</button>
          <a class="btn btn-teal btn-lg" href="consult.html?item=${encodeURIComponent(p.name)}">바로 상담</a>
        </div>
        <div id="stock-note"></div>
      </div>
    </div>
    <nav class="product-tabs" id="product-tabs">
      <button type="button" class="product-tab is-active" data-product-tab="detail">상세정보</button>
      <button type="button" class="product-tab" data-product-tab="review" id="tab-review-btn">상품후기 (${p.reviews || 0})</button>
      <button type="button" class="product-tab" data-product-tab="qna" id="tab-qna-btn">상품문의 (0)</button>
      <button type="button" class="product-tab" data-product-tab="shipping">배송/교환/환불</button>
    </nav>
    <section class="product-pane" data-product-pane="detail">
      <h2>상세정보</h2>
      <p>${esc(p.desc)}</p>
      <table class="spec-table">${specRows || "<tr><th>상품명</th><td>" + esc(p.name) + "</td></tr>"}</table>
    </section>
    <section class="product-pane" data-product-pane="review" hidden>
      <div class="review-summary" id="review-summary">★ ${p.rating} / 5.0 · 후기 ${p.reviews || 0}건</div>
      <p><button class="btn btn-teal" type="button" id="review-write-btn">구매 후기 작성</button></p>
      <div id="review-list"><p class="muted">후기를 불러오는 중…</p></div>
    </section>
    <section class="product-pane" data-product-pane="qna" hidden>
      <p><button class="btn btn-teal" type="button" id="qna-write-btn">문의하기</button></p>
      <form class="form" id="qna-form" hidden>
        <label>문의 내용</label>
        <textarea name="content" rows="4" required placeholder="상품에 대해 궁금한 점을 남겨 주세요."></textarea>
        <label class="check"><input type="checkbox" name="is_secret" /> 비밀글</label>
        <p class="form-error" id="qna-error" hidden></p>
        <button class="btn btn-teal" type="submit">문의 등록</button>
      </form>
      <div id="qna-list"><p class="muted">문의를 불러오는 중…</p></div>
    </section>
    <section class="product-pane" data-product-pane="shipping" hidden>
      <h2>배송 / 교환 / 환불 안내</h2>
      <ul>
        <li>기본 배송비: 3,000원 (50,000원 이상 결제 시 무료배송)</li>
        <li>배송 기간: 영업일 기준 1~3일 소요 (도서산간 추가 소요 가능)</li>
        <li>교환/반품: 수령 후 7일 이내 가능. 단순 변심 시 왕복 택배비 6,000원</li>
      </ul>
      <div class="policy-box">
        <h3>의료/위생용품 특약</h3>
        <p class="hygiene-note">환자용 기저귀, 매트리스, 욕창예방기구 등 위생용품은 개봉 후 단순 변심 반품이 불가합니다. 피부 접촉·멸균 소모품도 포장 개봉 시 반품이 제한됩니다.</p>
      </div>
    </section>
    <div class="admin-modal" id="review-modal" hidden>
      <div class="postcode-dim" data-review-close></div>
      <div class="admin-modal-box">
        <h2>구매 후기 작성</h2>
        <form class="form" id="review-form">
          <label>별점</label>
          <select name="rating">
            <option value="5">★★★★★ 5</option>
            <option value="4">★★★★☆ 4</option>
            <option value="3">★★★☆☆ 3</option>
            <option value="2">★★☆☆☆ 2</option>
            <option value="1">★☆☆☆☆ 1</option>
          </select>
          <label>구매 옵션</label>
          <input name="option_text" placeholder="예: 대여 / 본품" />
          <label>후기 내용</label>
          <textarea name="content" rows="4" required></textarea>
          <p class="form-error" id="review-error" hidden></p>
          <div class="card-actions">
            <button class="btn btn-teal" type="submit">등록</button>
            <button class="btn btn-outline" type="button" data-review-close>닫기</button>
          </div>
        </form>
      </div>
    </div>`;
  bindGallery(box);
  bindProductTabs(box);
  let qty = 1;
  box.querySelector("#plus").onclick = () => { qty += 1; box.querySelector("#qty").textContent = qty; };
  box.querySelector("#minus").onclick = () => { qty = Math.max(1, qty - 1); box.querySelector("#qty").textContent = qty; };
  box.querySelector("#add-btn").onclick = () => addToCart(p.id, qty);

  async function loadReviews() {
    const data = await api("/api/products/" + encodeURIComponent(p.id) + "/reviews");
    const count = data.count || 0;
    const avg = data.average || p.rating || 0;
    const reviewBtn = box.querySelector("#tab-review-btn");
    if (reviewBtn) reviewBtn.textContent = "상품후기 (" + count + ")";
    const summary = box.querySelector("#review-summary");
    if (summary) summary.innerHTML = `<span class="star-row">${starIcons(avg)}</span> <b>${avg.toFixed ? avg.toFixed(1) : avg}</b> / 5.0 · 총 ${count}건`;
    const meta = box.querySelector("#product-meta");
    if (meta) meta.textContent = `★ ${avg} · 후기 ${count} · ${groupName(g)} · ${p.mode === "rent" ? "대여상품" : "구매상품"}`;
    const list = box.querySelector("#review-list");
    if (!data.reviews || !data.reviews.length) {
      list.innerHTML = `<p class="muted">아직 등록된 후기가 없습니다.</p>`;
      return;
    }
    list.innerHTML = data.reviews.map((r) => `
      <article class="review-card">
        <div class="star-row">${starIcons(r.rating)}</div>
        <b>${esc(r.author || maskName(r.authorName))}</b>
        <small class="muted">${esc(String(r.createdAt || "").replace("T", " ").slice(0, 16))}${r.optionText ? " · " + esc(r.optionText) : ""}</small>
        <p>${esc(r.content)}</p>
      </article>`).join("");
  }

  async function loadQna(user) {
    const data = await api("/api/products/" + encodeURIComponent(p.id) + "/inquiries");
    const items = data.inquiries || [];
    const qnaBtn = box.querySelector("#tab-qna-btn");
    if (qnaBtn) qnaBtn.textContent = "상품문의 (" + items.length + ")";
    const list = box.querySelector("#qna-list");
    if (!items.length) {
      list.innerHTML = `<p class="muted">등록된 문의가 없습니다.</p>`;
      return;
    }
    list.innerHTML = items.map((q) => `
      <article class="qna-card">
        <div>
          ${q.isSecret ? `<span class="lock-icon" title="비밀글">🔒</span>` : ""}
          <span class="qna-badge ${q.status === "ANSWERED" ? "is-done" : ""}">${q.status === "ANSWERED" ? "답변완료" : "답변대기"}</span>
          <b>${esc(q.author)}</b>
          <small class="muted">${esc(String(q.createdAt || "").replace("T", " ").slice(0, 16))}</small>
        </div>
        <p>${esc(q.content)}</p>
        ${q.answer ? `<div class="qna-answer"><b>판매자 답변</b><p>${esc(q.answer)}</p></div>` : ""}
        ${isAdminUser(user) && !q.answer ? `<form class="form" data-qna-answer="${esc(q.id)}"><input name="answer" placeholder="답변 입력" required /><button class="btn btn-outline" type="submit">답변 저장</button></form>` : ""}
      </article>`).join("");
    list.querySelectorAll("[data-qna-answer]").forEach((form) => {
      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api("/api/admin/inquiries/" + encodeURIComponent(form.getAttribute("data-qna-answer")) + "/answer", {
            method: "POST",
            body: JSON.stringify({ answer: form.answer.value })
          });
          toast("답변을 저장했습니다.");
          loadQna(user);
        } catch (err) {
          toast(err.message);
        }
      };
    });
  }

  hydrateCatalog().then(() => {
    const gallery = box.querySelector(".gallery");
    if (gallery) gallery.outerHTML = galleryHTML(p);
    bindGallery(box);
  });

  api("/api/products/" + encodeURIComponent(p.id)).then((data) => {
    const row = data.product || {};
    if (row.images) p.images = row.images;
    if (row.thumbnail) p.thumbnail = row.thumbnail;
    const gallery = box.querySelector(".gallery");
    if (gallery) gallery.outerHTML = galleryHTML(p);
    bindGallery(box);
    const stock = Number(row.stock);
    const note = box.querySelector("#stock-note");
    const add = box.querySelector("#add-btn");
    if (row.isHygiene) {
      box.querySelectorAll(".hygiene-note").forEach((hy) => { hy.hidden = false; });
    }
    if (stock === 0) {
      note.innerHTML = '<p class="soldout">품절</p>';
      add.disabled = true;
      add.textContent = "품절";
    } else if (stock <= 10) {
      note.innerHTML = '<p class="low-stock">품절 임박: 잔여 ' + stock + "개 남음</p>";
    }
    const reviewBtn = box.querySelector("#tab-review-btn");
    if (reviewBtn && row.reviewCount != null) reviewBtn.textContent = "상품후기 (" + row.reviewCount + ")";
    const qnaBtn = box.querySelector("#tab-qna-btn");
    if (qnaBtn && row.qnaCount != null) qnaBtn.textContent = "상품문의 (" + row.qnaCount + ")";
    refreshAuth().then((user) => {
      if (isAdminUser(user)) {
        const link = document.createElement("a");
        link.href = "admin.html#id=" + encodeURIComponent(p.id);
        link.className = "admin-edit";
        link.textContent = "수정하기";
        box.querySelector(".buybox").appendChild(link);
      }
      loadReviews().catch(() => {});
      loadQna(user).catch(() => {});
    });
  }).catch(() => {
    loadReviews().catch(() => {});
    loadQna(null).catch(() => {});
  });

  const modal = box.querySelector("#review-modal");
  box.querySelector("#review-write-btn").onclick = () => {
    if (!window.currentUser) {
      location.href = "login.html#next=" + encodeURIComponent("product.html#id=" + p.id);
      return;
    }
    if (modal) modal.hidden = false;
  };
  box.querySelectorAll("[data-review-close]").forEach((el) => {
    el.onclick = () => { if (modal) modal.hidden = true; };
  });
  const reviewForm = box.querySelector("#review-form");
  if (reviewForm) {
    reviewForm.onsubmit = async (e) => {
      e.preventDefault();
      showFormError("#review-error", "");
      try {
        await api("/api/products/" + encodeURIComponent(p.id) + "/reviews", {
          method: "POST",
          body: JSON.stringify({
            rating: reviewForm.rating.value,
            option_text: reviewForm.option_text.value,
            content: reviewForm.content.value
          })
        });
        toast("후기를 등록했습니다.");
        if (modal) modal.hidden = true;
        reviewForm.reset();
        loadReviews();
      } catch (err) {
        showFormError("#review-error", err.message);
      }
    };
  }
  const qnaBtn = box.querySelector("#qna-write-btn");
  const qnaForm = box.querySelector("#qna-form");
  if (qnaBtn && qnaForm) {
    qnaBtn.onclick = () => {
      if (!window.currentUser) {
        location.href = "login.html#next=" + encodeURIComponent("product.html#id=" + p.id);
        return;
      }
      qnaForm.hidden = !qnaForm.hidden;
    };
    qnaForm.onsubmit = async (e) => {
      e.preventDefault();
      showFormError("#qna-error", "");
      try {
        await api("/api/products/" + encodeURIComponent(p.id) + "/inquiries", {
          method: "POST",
          body: JSON.stringify({
            content: qnaForm.content.value,
            is_secret: qnaForm.is_secret.checked
          })
        });
        toast("문의를 등록했습니다.");
        qnaForm.reset();
        qnaForm.hidden = true;
        loadQna(window.currentUser);
      } catch (err) {
        showFormError("#qna-error", err.message);
      }
    };
  }

  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id);
  renderCards("#related", (related.length ? related : PRODUCTS.filter((x) => productGroup(x) === g && x.id !== p.id)).slice(0, 4));
}

function initGuide() {
  mountShell("guide");
  const rate = document.querySelector("#rate");
  const price = document.querySelector("#price");
  const out = document.querySelector("#calc-out");
  function run() {
    const p = Number(price.value || 0);
    const r = Number(rate.value);
    const pay = Math.round(p * r);
    const left = Math.max(0, 1600000 - pay);
    out.innerHTML = `<div>예상 본인부담금</div><b>${won(pay)}</b><p>연간 한도 160만 원 기준, 이 상품 이용 후 남은 한도는 약 ${won(left)}입니다. 실제 잔액은 공단·사업소 조회가 필요합니다.</p>`;
  }
  if (rate && price) {
    rate.onchange = run;
    price.oninput = run;
    run();
  }
  const quiz = document.querySelector("#quiz");
  if (quiz) {
    const q = [
      ["거동이 불편해 일상생활에 다른 사람의 도움이 필요하신가요?", ["거의 항상 필요해요", "가끔 필요해요", "아직은 괜찮아요"]],
      ["최근 6개월 내 낙상이나 욕창이 걱정되셨나요?", ["네, 걱정됩니다", "조금 있습니다", "없습니다"]],
      ["65세 이상이거나 노인성 질환이 있으신가요?", ["65세 이상입니다", "65세 미만이지만 노인성 질환이 있습니다", "해당 없습니다"]]
    ];
    let step = 0, score = 0;
    const render = () => {
      if (step >= q.length) {
        const likely = score >= 4;
        quiz.innerHTML = `<div class="calc-result"><b>${likely ? "장기요양 인정 상담을 권합니다" : "먼저 생활 환경 점검부터 도와드릴게요"}</b><p>${likely ? "거동·낙상·돌봄 부담이 있다면 등급 신청과 복지용구 이용을 함께 안내드립니다." : "등급이 없어도 일반 의료기 구매와 단기 대여는 가능합니다."}</p><a class="btn btn-teal" href="consult.html">상담 신청</a></div>`;
        return;
      }
      quiz.innerHTML = `<h3>${q[step][0]}</h3><div class="quiz">${q[step][1].map((a, i) => `<button data-s="${2 - i}">${a}</button>`).join("")}</div>`;
    };
    quiz.onclick = (e) => {
      const b = e.target.closest("button[data-s]");
      if (!b) return;
      score += Number(b.dataset.s);
      step += 1;
      render();
    };
    render();
  }
}

function initConsult() {
  mountShell("consult");
  const item = getParam("item");
  if (item) {
    const t = document.querySelector("#message");
    if (t) t.value = `${item} 상담 부탁드립니다.`;
    document.querySelectorAll(".check input").forEach((el) => {
      if (item.includes(el.value)) el.checked = true;
    });
  }
  refreshAuth().then((user) => {
    const form = document.querySelector("#consult-form");
    if (!form) return;
    if (user) {
      if (form.name && !form.name.value) form.name.value = user.name;
      if (form.phone && !form.phone.value) form.phone.value = user.phone;
    }
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!form.agree.checked) return toast("개인정보 수집에 동의해 주세요.");
        const topics = [...form.querySelectorAll(".checks input:checked")].map((el) => el.value);
      try {
        await api("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            type: "consult",
            name: form.name.value,
            phone: form.phone.value,
            memo: form.message.value,
            topics,
            items: []
          })
        });
        toast("상담 신청이 접수되었습니다.");
        form.reset();
      } catch (err) {
        toast(err.message);
      }
    };
  });
}

function bindPasswordToggles(root) {
  (root || document).querySelectorAll("[data-toggle-pw]").forEach((btn) => {
    btn.onclick = () => {
      const input = btn.parentElement.querySelector("input");
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
    };
  });
}

function bindSocialLinks(root) {
  const next = loginNext();
  (root || document).querySelectorAll("[data-social]").forEach((el) => {
    const provider = el.getAttribute("data-social");
    el.href = "/api/auth/" + provider + "?next=" + encodeURIComponent(next);
  });
}

function initLogin() {
  mountShell("account");
  bindPasswordToggles();
  bindSocialLinks();
  const err = getParam("error");
  if (err) showFormError("#login-error", err);
  refreshAuth().then((user) => {
    if (user) afterLoginRedirect(user);
  });
  const form = document.querySelector("#login-form");
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#login-error", "");
    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ login: form.login.value, password: form.password.value })
      });
      if (data.token) try { localStorage.setItem("sso_access_token", data.token); } catch (_e) {}
      afterLoginRedirect(data.user || { isAdmin: false });
    } catch (err) {
      showFormError("#login-error", err.message);
    }
  };
}

function initSignup() {
  mountShell("account");
  bindPasswordToggles();
  bindSocialLinks();
  refreshAuth().then((user) => {
    if (user) location.href = loginNext();
  });
  const form = document.querySelector("#signup-form");
  if (!form) return;
  bindPasswordChecks(form.password);
  bindPostcode(document.querySelector("#signup-postcode-btn"), form);
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#signup-error", "");
    const emailRule = emailRuleError(form.email.value);
    if (emailRule) {
      showFormError("#signup-error", emailRule);
      return;
    }
    const nameRule = nameRuleError(form.name.value);
    if (nameRule) {
      showFormError("#signup-error", nameRule);
      return;
    }
    const phoneRule = phoneRuleError(form.phone.value);
    if (phoneRule) {
      showFormError("#signup-error", phoneRule);
      return;
    }
    if (form.password.value !== form.passwordConfirm.value) {
      showFormError("#signup-error", "비밀번호가 일치하지 않습니다.");
      return;
    }
    const rule = passwordRuleError(form.password.value);
    if (rule) {
      showFormError("#signup-error", rule);
      return;
    }
    if (!form.age14 || !form.age14.checked) {
      showFormError("#signup-error", "만 14세 이상만 가입할 수 있습니다.");
      return;
    }
    if (!form.agree.checked) {
      showFormError("#signup-error", "이용약관 및 개인정보처리방침에 동의해 주세요.");
      return;
    }
    try {
      const data = await api("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.value,
          name: form.name.value,
          phone: form.phone.value,
          age14: true,
          marketing: form.marketing ? form.marketing.checked : false,
          password: form.password.value,
          passwordConfirm: form.passwordConfirm.value,
          zipcode: form.zipcode ? form.zipcode.value : "",
          address_basic: form.address_basic ? form.address_basic.value : "",
          address_detail: form.address_detail ? form.address_detail.value : ""
        })
      });
      if (data.token) try { localStorage.setItem("sso_access_token", data.token); } catch (_e) {}
      location.href = loginNext();
    } catch (err) {
      showFormError("#signup-error", err.message);
    }
  };
}

function initFindId() {
  mountShell("account");
  const form = document.querySelector("#find-id-form");
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#find-id-error", "");
    const result = document.querySelector("#find-id-result");
    if (result) {
      result.hidden = true;
      result.textContent = "";
    }
    try {
      const data = await api("/api/find-id", {
        method: "POST",
        body: JSON.stringify({ name: form.name.value, phone: form.phone.value })
      });
      if (result) {
        result.hidden = false;
        result.textContent = data.username
          ? "아이디는 " + data.username + " 입니다."
          : "휴대폰 번호로 로그인할 수 있습니다.";
      }
    } catch (err) {
      showFormError("#find-id-error", err.message);
    }
  };
}

function initFindPassword() {
  mountShell("account");
  const form = document.querySelector("#find-password-form");
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#find-password-error", "");
    const result = document.querySelector("#find-password-result");
    if (result) {
      result.hidden = true;
      result.textContent = "";
    }
    try {
      const data = await api("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: form.email.value })
      });
      if (result) {
        result.hidden = false;
        result.textContent = data.message || "가입된 이메일이라면 재설정 링크를 보냈습니다.";
      }
    } catch (err) {
      showFormError("#find-password-error", err.message);
    }
  };
  const help = document.querySelector("#password-help-form");
  if (!help) return;
  help.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#password-help-error", "");
    const result = document.querySelector("#password-help-result");
    if (result) {
      result.hidden = true;
      result.textContent = "";
    }
    try {
      const data = await api("/api/password-help", {
        method: "POST",
        body: JSON.stringify({ name: help.name.value, phone: help.phone.value })
      });
      if (result) {
        result.hidden = false;
        result.textContent = data.message || "요청을 접수했습니다.";
      }
    } catch (err) {
      showFormError("#password-help-error", err.message);
    }
  };
}

function initResetPassword() {
  mountShell("account");
  const form = document.querySelector("#reset-password-form");
  if (!form) return;
  const token = new URLSearchParams(location.search).get("token") || "";
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#reset-error", "");
    if (!token) {
      showFormError("#reset-error", "재설정 링크가 올바르지 않습니다. 비밀번호 찾기에서 다시 요청해 주세요.");
      return;
    }
    if (form.password.value !== form.passwordConfirm.value) {
      showFormError("#reset-error", "비밀번호가 서로 다릅니다.");
      return;
    }
    const rule = passwordRuleError(form.password.value);
    if (rule) {
      showFormError("#reset-error", rule);
      return;
    }
    try {
      await api("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: form.password.value })
      });
      toast("비밀번호를 바꿨습니다. 다시 로그인해 주세요.");
      location.href = "login.html";
    } catch (err) {
      showFormError("#reset-error", err.message);
    }
  };
}

async function renderPasswordHelp() {
  const box = document.querySelector("#password-help");
  if (!box) return;
  let data;
  try {
    data = await api("/api/password-help");
  } catch (_err) {
    return;
  }
  const items = data.items || [];
  box.innerHTML = `
    <div class="section-head" style="margin-top:32px">
      <div>
        <h2>이메일 없는 회원 비밀번호 요청</h2>
        <p>전화로 본인을 확인한 뒤 새 비밀번호를 정하세요. 비밀번호는 전화로만 안내합니다.</p>
      </div>
    </div>
    ${items.length ? items.map((item) => `
      <form class="panel form" data-help-id="${esc(item.id)}" style="margin-top:12px">
        <p><b>${esc(item.name)}</b> · ${esc(item.phone)} · ${item.site === "medical" ? "현대 의료기" : "헤리움"}</p>
        <label>새 비밀번호</label>
        <input name="password" type="password" required autocomplete="new-password" placeholder="대/소문자, 숫자, 특수문자 포함 8자 이상" />
        <label>한 번 더</label>
        <input name="confirm" type="password" required autocomplete="new-password" />
        <p class="form-error" hidden></p>
        <button class="btn btn-teal" type="submit" style="margin-top:12px">저장</button>
      </form>
    `).join("") : `<p class="empty">대기 중인 요청이 없습니다.</p>`}
  `;
  box.querySelectorAll("form").forEach((form) => {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const error = form.querySelector(".form-error");
      const rule = passwordRuleError(form.password.value);
      if (form.password.value !== form.confirm.value) {
        error.hidden = false;
        error.textContent = "비밀번호 확인이 일치하지 않습니다.";
        return;
      }
      if (rule) {
        error.hidden = false;
        error.textContent = rule;
        return;
      }
      error.hidden = true;
      try {
        await api("/api/password-help/" + form.dataset.helpId + "/reset", {
          method: "POST",
          body: JSON.stringify({ password: form.password.value, confirm: form.confirm.value })
        });
        toast("새 비밀번호를 저장했습니다. 회원에게 전화로만 안내하세요.");
        renderPasswordHelp();
      } catch (err) {
        error.hidden = false;
        error.textContent = err.message;
      }
    };
  });
}

const SHIP_CARRIERS = [
  { code: "kr.cjlogistics", name: "CJ대한통운" },
  { code: "kr.epost", name: "우체국택배" },
  { code: "kr.hanjin", name: "한진택배" },
  { code: "kr.logen", name: "로젠택배" },
  { code: "kr.lotte", name: "롯데택배" }
];
const ORDER_PAGE_SIZE = 8;

function cancelReasonLine(order) {
  const status = String(order.status || "");
  if (status !== "CANCELLED" && status !== "CANCELED") return "";
  const reason = String(order.cancelReason || order.cancel_reason || "").trim();
  const by = String(order.cancelledBy || order.cancelled_by || "").toUpperCase();
  if (by === "ADMIN") {
    return `<span class="cancel-desc text-danger">취소 사유: [관리자 직권 취소] ${esc(reason)}</span>`;
  }
  return `<span class="cancel-desc text-muted">취소 사유: ${esc(reason || "고객 직접 취소")}</span>`;
}

function shipFieldsHtml(order, carriers, visible) {
  const list = (carriers && carriers.length ? carriers : SHIP_CARRIERS);
  const opts = list.map((c) =>
    `<option value="${esc(c.code)}" ${c.code === order.carrier ? "selected" : ""}>${esc(c.name)}</option>`
  ).join("");
  return `<div class="order-admin ship-fields" data-ship="${esc(order.id)}" ${visible ? "" : "hidden"}>
    <select data-carrier aria-label="택배사">${opts}</select>
    <input data-tracking placeholder="송장번호" value="${esc(order.trackingNumber || "")}" />
    <button class="btn btn-teal" type="button" data-ship-save="${esc(order.id)}">발송 저장</button>
  </div>`;
}

function bindMypageTabs() {
  const tabs = document.querySelectorAll("[data-mypage-tab]");
  if (!tabs.length) return;
  function show(name) {
    tabs.forEach((tab) => {
      const on = tab.getAttribute("data-mypage-tab") === name;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-mypage-pane]").forEach((pane) => {
      pane.hidden = pane.getAttribute("data-mypage-pane") !== name;
    });
  }
  tabs.forEach((tab) => {
    tab.onclick = () => show(tab.getAttribute("data-mypage-tab"));
  });
  if (location.hash === "#profile") show("profile");
  else show("orders");
}

function mypageOrderCard(o, user, carriers) {
  const first = (o.items || [])[0];
  const extra = Math.max(0, (o.items || []).length - 1);
  const title = first
    ? esc(first.name) + " × " + (first.qty || 1) + (extra ? " 외 " + extra + "건" : "")
    : (o.type === "consult" ? "상담 신청" : "주문");
  const items = (o.items || []).map((i) => `${esc(i.name)} × ${i.qty}`).join("<br>");
  const topics = (o.topics || []).map(esc).join(", ");
  const canTrack = (o.status === "SHIPPING" || o.status === "SHIPPED" || o.status === "DELIVERED") && (o.trackingUrl || o.trackingNumber);
  const track = canTrack
    ? `<a class="btn btn-outline" href="${esc(o.trackingUrl || ("https://tracker.delivery/#/kr.cjlogistics/" + encodeURIComponent(o.trackingNumber)))}" target="_blank" rel="noopener">배송조회</a>`
    : (o.status === "SHIPPING" || o.status === "PREPARING" ? `<span class="muted">운송장 준비 중</span>` : "");
  const receipt = o.receiptUrl
    ? `<a class="btn btn-outline" href="${esc(o.receiptUrl)}" target="_blank" rel="noopener">영수증 보기</a>`
    : "";
  const canShip = o.status === "PAID" || o.status === "PREPARING" || o.status === "SHIPPING";
  const admin = isAdminUser(user)
    ? `<div class="order-admin">
        <label>상태
          <select data-order-status="${esc(o.id)}">
            ${["READY", "PAID", "PREPARING", "SHIPPING", "DELIVERED", "CANCEL_REQUESTED", "CANCELLED"].map((s) =>
              `<option value="${s}" ${s === o.status ? "selected" : ""}>${statusLabel(s)}</option>`
            ).join("")}
          </select>
        </label>
        ${canShip ? shipFieldsHtml(o, carriers, o.status === "SHIPPING") : ""}
      </div>`
    : "";
  return `<article class="panel order-card" id="order-${esc(o.id)}">
    <div class="order-top">
      <div>
        <b>${esc(o.number)}</b>
        <span class="status-pill ${statusClass(o.status)}">${statusLabel(o.status)}</span>
      </div>
      <small>${esc((o.createdAt || "").replace("T", " ").slice(0, 16))}</small>
    </div>
    ${cancelReasonLine(o)}
    <p>${title}</p>
    ${o.total ? `<p><b>${won(o.total)}</b>${o.shippingFee ? ` <small class="muted">(배송비 ${won(o.shippingFee)} 포함)</small>` : ""}</p>` : ""}
    <p class="muted">${o.type === "consult" ? "상담 신청" : "상품 주문"} · ${esc(o.name || "")}${o.paymentMethod ? " · " + esc(o.paymentMethod) : ""}</p>
    ${o.address ? `<p class="muted">${esc(o.address)}</p>` : ""}
    ${topics ? `<p>관심 품목: ${topics}</p>` : ""}
    ${items ? `<p>${items}</p>` : ""}
    ${o.memo ? `<p class="muted">${esc(o.memo)}</p>` : ""}
    <div class="order-actions">
      ${track}
      ${receipt}
      <a class="btn btn-outline" href="#order-${esc(o.id)}">상세보기</a>
      ${o.cancel && o.cancel.canCancel ? `<button class="btn btn-outline" type="button" data-cancel-order="${esc(o.id)}">주문 취소</button>` : ""}
      ${o.cancel && o.cancel.canRequest ? `<button class="btn btn-outline" type="button" data-cancel-request="${esc(o.id)}">취소 요청</button>` : ""}
    </div>
    ${o.cancel && o.cancel.message ? `<p class="muted">${esc(o.cancel.message)}</p>` : ""}
    ${admin}
  </article>`;
}

function initAccount() {
  mountShell("account");
  bindMypageTabs();
  refreshAuth().then(async (user) => {
    if (!user) {
      location.href = "login.html#next=mypage.html";
      return;
    }
    document.querySelector("#account-name").textContent = (user.name || user.username || "회원") + "님";
    const bits = [];
    if (user.email) bits.push(user.email);
    else if (user.username) bits.push(user.username);
    bits.push(user.phone || "휴대폰 미등록");
    if (isAdminUser(user)) bits.push("관리자");
    document.querySelector("#account-phone").textContent = bits.join(" · ");
    const adminPath = user.adminPath || "/hyundai-control-99";
    const adminLink = document.querySelector("#admin-link");
    const dashLink = document.querySelector("#admin-dash-link");
    const adminBanner = document.querySelector("#admin-mypage-banner");
    if (isAdminUser(user)) {
      if (adminLink) {
        adminLink.hidden = false;
        adminLink.href = adminPath;
      }
      if (dashLink) dashLink.href = adminPath;
      if (adminBanner) adminBanner.hidden = false;
      const extras = document.querySelector("#customer-account-extras");
      if (extras) extras.hidden = true;
      const addr = document.querySelector("#profile-address-block");
      if (addr) addr.hidden = true;
      const lead = document.querySelector("#account-lead");
      if (lead) lead.textContent = "현재 관리자 계정으로 접속 중입니다.";
      renderPasswordHelp();
    }
    const logoutBtn = document.querySelector("#logout-btn");
    if (logoutBtn) logoutBtn.onclick = () => logout();
    const withdrawBtn = document.querySelector("#withdraw-btn");
    if (withdrawBtn && !isAdminUser(user)) {
      withdrawBtn.onclick = async () => {
        if (!confirm("정말 탈퇴하시겠습니까? 이름과 연락처는 바로 삭제됩니다.")) return;
        await api("/api/me/withdraw", { method: "POST", body: "{}" });
        try { localStorage.removeItem("sso_access_token"); } catch (_e) {}
        wipeClientCart();
        location.href = "index.html";
      };
    }
    const cartCount = cart().reduce((n, i) => n + (Number(i.qty) || 1), 0);
    let wishCount = 0;
    try { wishCount = (JSON.parse(localStorage.getItem("oncare-wish") || "[]") || []).length; } catch (_e) {}
    const summary = document.querySelector("#wish-cart-summary");
    if (summary) {
      summary.textContent = "장바구니 " + cartCount + "개 · 관심 상품 " + wishCount + "개";
    }
    const cartLink = document.querySelector("#cart-summary-link");
    if (cartLink) cartLink.textContent = "장바구니 보기 (" + cartCount + ")";
    const wishLink = document.querySelector("#wish-summary-link");
    if (wishLink) wishLink.textContent = "관심 상품 보기 (" + wishCount + ")";
    const profile = document.querySelector("#profile-form");
    if (profile) {
      if (profile.username) profile.username.value = user.username || "";
      profile.name.value = user.name || "";
      profile.phone.value = user.phone || "";
      if (profile.email) profile.email.value = user.email || "";
      if (profile.address) profile.address.value = user.address || "";
      if (profile.zipcode) profile.zipcode.value = user.zipcode || "";
      if (profile.address_basic) profile.address_basic.value = user.addressBasic || "";
      if (profile.address_detail) profile.address_detail.value = user.addressDetail || "";
      if (!isAdminUser(user)) bindPostcode(document.querySelector("#profile-postcode-btn"), profile);
      profile.onsubmit = async (e) => {
        e.preventDefault();
        showFormError("#profile-error", "");
        const nameRule = nameRuleError(profile.name.value);
        if (nameRule) {
          showFormError("#profile-error", nameRule);
          return;
        }
        const phoneRule = phoneRuleError(profile.phone.value);
        if (phoneRule) {
          showFormError("#profile-error", phoneRule);
          return;
        }
        const nextPw = profile.newPassword.value || "";
        const rule = passwordRuleError(nextPw);
        if (nextPw && rule) {
          showFormError("#profile-error", rule);
          return;
        }
        try {
          const saved = await api("/api/me", {
            method: "PATCH",
            body: JSON.stringify({
              name: profile.name.value,
              phone: profile.phone.value,
              email: profile.email ? profile.email.value : user.email,
              address: isAdminUser(user) ? (user.address || "") : (profile.address ? profile.address.value : ""),
              zipcode: isAdminUser(user) ? (user.zipcode || "") : (profile.zipcode ? profile.zipcode.value : ""),
              address_basic: isAdminUser(user) ? (user.addressBasic || "") : (profile.address_basic ? profile.address_basic.value : ""),
              address_detail: isAdminUser(user) ? (user.addressDetail || "") : (profile.address_detail ? profile.address_detail.value : ""),
              currentPassword: profile.currentPassword.value,
              password: profile.newPassword.value
            })
          });
          profile.currentPassword.value = "";
          profile.newPassword.value = "";
          document.querySelector("#account-name").textContent = (saved.user.name || saved.user.username || "회원") + "님";
          toast("개인정보를 저장했습니다.");
        } catch (err) {
          showFormError("#profile-error", err.message);
        }
      };
    }
    try {
      const data = await api("/api/orders");
      const box = document.querySelector("#order-list");
      const moreWrap = document.querySelector("#order-more-wrap");
      const moreBtn = document.querySelector("#order-more-btn");
      if (!box) return;
      const orders = data.orders || [];
      const carriers = data.carriers || SHIP_CARRIERS;
      if (!orders.length) {
        box.innerHTML = `<div class="empty-cta"><p class="empty">아직 주문하신 내역이 없습니다.</p><a class="btn btn-teal" href="shop.html">상품 보러가기</a></div>`;
        if (moreWrap) moreWrap.hidden = true;
        return;
      }
      let shown = ORDER_PAGE_SIZE;
      function paintOrders() {
        box.innerHTML = orders.slice(0, shown).map((o) => mypageOrderCard(o, user, carriers)).join("");
        if (moreWrap) moreWrap.hidden = shown >= orders.length;
      }
      paintOrders();
      if (moreBtn) {
        moreBtn.onclick = () => {
          shown += ORDER_PAGE_SIZE;
          paintOrders();
        };
      }
      box.onchange = async (e) => {
        const sel = e.target.closest("[data-order-status]");
        if (!sel) return;
        const card = sel.closest("article");
        const ship = card && card.querySelector("[data-ship]");
        if (sel.value === "SHIPPING") {
          if (ship) ship.hidden = false;
          return;
        }
        if (ship) ship.hidden = true;
        try {
          await api("/api/orders/" + sel.dataset.orderStatus, {
            method: "PATCH",
            body: JSON.stringify({ status: sel.value })
          });
          toast("상태를 바꿨습니다.");
        } catch (err) {
          toast(err.message);
        }
      };
      box.onclick = async (e) => {
        const shipBtn = e.target.closest("[data-ship-save]");
        if (shipBtn) {
          const wrap = shipBtn.closest("[data-ship]");
          const carrier = wrap.querySelector("[data-carrier]").value;
          const tracking = wrap.querySelector("[data-tracking]").value;
          try {
            await api("/api/admin/orders/" + encodeURIComponent(shipBtn.getAttribute("data-ship-save")) + "/ship", {
              method: "POST",
              body: JSON.stringify({ carrier, tracking_number: tracking })
            });
            toast("발송 저장했습니다.");
            location.reload();
          } catch (err) {
            toast(err.message);
          }
          return;
        }
        const cancelBtn = e.target.closest("[data-cancel-order]");
        const requestBtn = e.target.closest("[data-cancel-request]");
        const btn = cancelBtn || requestBtn;
        if (!btn) return;
        const id = btn.getAttribute("data-cancel-order") || btn.getAttribute("data-cancel-request");
        const ask = cancelBtn ? "이 주문을 취소할까요? 결제된 경우 승인이 취소됩니다." : "배송이 시작된 주문입니다. 취소 요청만 접수됩니다. 진행할까요?";
        if (!confirm(ask)) return;
        try {
          const result = await api("/api/orders/" + encodeURIComponent(id) + "/cancel", {
            method: "POST",
            body: JSON.stringify({ request: Boolean(requestBtn) })
          });
          toast(result.message || "처리되었습니다.");
          location.reload();
        } catch (err) {
          toast(err.message);
        }
      };
    } catch (err) {
      toast(err.message);
    }
  });
}

function initCheckout() {
  mountShell("shop");
  refreshAuth().then((user) => {
    const form = document.querySelector("#checkout-form");
    if (form) {
      if (user) {
        form.name.value = user.name || "";
        form.phone.value = user.phone || "";
        if (form.zipcode) form.zipcode.value = user.zipcode || "";
        form.address.value = user.addressBasic || user.address || "";
        if (form.address_detail) form.address_detail.value = user.addressDetail || "";
      } else {
        form.setAttribute("autocomplete", "off");
        form.name.value = "";
        form.phone.value = "";
        form.address.value = "";
      }
    }
    const box = document.querySelector("#checkout-items");
    const totalEl = document.querySelector("#checkout-total");
    const checkoutState = { previewTotal: 0 };
    function paintCheckout() {
      const items = checkoutItems();
      if (!box) return items;
      if (!items.length) {
        box.innerHTML = `<p class="empty">장바구니가 비어 있습니다. <a href="shop.html">상품 보러 가기</a></p>`;
        if (form) {
          const submitBtn = form.querySelector("button[type=submit]");
          if (submitBtn) submitBtn.disabled = true;
        }
        if (totalEl) totalEl.innerHTML = "";
        checkoutState.previewTotal = 0;
        return items;
      }
      if (form) {
        const submitBtn = form.querySelector("button[type=submit]");
        if (submitBtn) submitBtn.disabled = false;
      }
      let sum = 0;
      box.innerHTML = items.map((i) => {
        const p = productById(i.id);
        if (!p) return "";
        const unit = isWelfare(p) ? copay(p.price) : (p.salePrice || p.price);
        const pay = unit * i.qty;
        sum += pay;
        return `<div class="cart-item is-checkout">
          ${thumbHTML(p, "cart-item-thumb")}
          <div>
            <b>${esc(p.name)}</b>
            <div>${won(pay)}</div>
            <div class="qty-ctrl">
              <button type="button" data-qty="-1" data-qty-id="${esc(p.id)}" aria-label="수량 줄이기" ${i.qty <= 1 ? "disabled" : ""}>−</button>
              <span>${i.qty}</span>
              <button type="button" data-qty="1" data-qty-id="${esc(p.id)}" aria-label="수량 늘리기">+</button>
            </div>
          </div>
        </div>`;
      }).join("");
      const ship = sum >= 50000 ? 0 : 3000;
      checkoutState.previewTotal = sum + ship;
      if (totalEl) {
        totalEl.innerHTML = `상품 ${won(sum)} · 배송비 ${ship ? won(ship) : "무료"}<br><b>결제 금액 ${won(checkoutState.previewTotal)}</b>`;
      }
      return items;
    }
    window.__renderCheckout = function () {
      paintCheckout();
      if (window.__tossWidgets && checkoutState.previewTotal > 0) {
        window.__tossWidgets.setAmount({ currency: "KRW", value: checkoutState.previewTotal }).catch(() => {});
      }
    };
    let items = paintCheckout();
    if (!items.length) return;
    bindPostcode(document.querySelector("#postcode-btn"), form);
    let tossWidgets = null;
    let tossClientKey = "";
    fetch("/api/public-config", { credentials: "include" }).then(async (res) => {
      const cfg = await res.json();
      tossClientKey = String(cfg.tossClientKey || "").trim();
      if (!tossClientKey || !isTossWidgetKey(tossClientKey)) return;
      const payBox = document.querySelector("#payment-box");
      if (payBox) payBox.hidden = false;
      await loadTossSdk("widget");
      const customerKey = user && user.id
        ? ("u_" + String(user.id).replace(/[^A-Za-z0-9]/g, "")).slice(0, 50)
        : window.TossPayments.ANONYMOUS;
      tossWidgets = window.TossPayments(tossClientKey).widgets({ customerKey });
      window.__tossWidgets = tossWidgets;
      await tossWidgets.setAmount({ currency: "KRW", value: checkoutState.previewTotal });
      await tossWidgets.renderPaymentMethods({ selector: "#payment-method" });
      await tossWidgets.renderAgreement({ selector: "#agreement" });
    }).catch((err) => {
      showFormError("#checkout-error", err.message || "결제 수단을 불러오지 못했습니다.");
    });
    form.onsubmit = async (e) => {
      e.preventDefault();
      showFormError("#checkout-error", "");
      const submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;
      try {
        items = checkoutItems();
        rememberCheckoutItems(items);
        const preorder = await api("/orders/create-preorder/", {
          method: "POST",
          body: JSON.stringify({
            items,
            recipient_name: form.name.value,
            recipient_phone: form.phone.value,
            postal_code: form.zipcode ? form.zipcode.value : "",
            address: form.address.value,
            detail_address: form.address_detail ? form.address_detail.value : "",
            delivery_memo: form.memo.value
          })
        });
        if (!preorder || !preorder.success || !preorder.order_id) {
          throw new Error("가주문을 만들지 못했습니다.");
        }
        if (!tossClientKey) {
          const cfg = await fetch("/api/public-config", { credentials: "include" }).then((res) => res.json());
          tossClientKey = String(cfg.tossClientKey || "").trim();
        }
        if (!tossClientKey) throw new Error("카드 결제를 열려면 토스페이먼츠 키가 필요합니다.");
        if (/^((test|live)_)?(sk|gsk)_/.test(tossClientKey)) {
          throw new Error("결제 클라이언트 키가 올바르지 않습니다. 고객센터에 문의해 주세요.");
        }
        const origin = location.origin;
        const phone = String(form.phone.value || "").replace(/\D/g, "");
        const payRequest = {
          orderId: String(preorder.order_id),
          orderName: String(preorder.order_name || "의료기 주문").slice(0, 100),
          successUrl: origin + "/orders/payment/success",
          failUrl: origin + "/orders/payment/fail"
        };
        if (form.name.value) payRequest.customerName = String(form.name.value).slice(0, 40);
        if (/^01[016789]\d{7,8}$/.test(phone)) payRequest.customerMobilePhone = phone;
        try {
          if (isTossWidgetKey(tossClientKey)) {
            if (!tossWidgets) throw new Error("결제 수단을 불러오는 중입니다. 잠시 후 다시 눌러 주세요.");
            await tossWidgets.setAmount({ currency: "KRW", value: Number(preorder.amount) });
            await tossWidgets.requestPayment(payRequest);
          } else {
            await loadTossSdk("window");
            await window.TossPayments(tossClientKey).requestPayment("카드", Object.assign({
              amount: Number(preorder.amount)
            }, payRequest));
          }
        } catch (tossErr) {
          throw new Error(explainTossError(tossErr));
        }
      } catch (err) {
        if (submitBtn) submitBtn.disabled = false;
        showFormError("#checkout-error", err.message);
      }
    };
  });
}

function isTossWidgetKey(key) {
  return /gck_/i.test(String(key || ""));
}

function explainTossError(err) {
  const code = err && err.code;
  if (code === "USER_CANCEL" || code === "PAY_PROCESS_CANCELED") return "결제가 취소되었습니다.";
  if (code === "NETWORK_ERROR") return "결제창 연결이 차단되었습니다. 새로고침 후 다시 시도해 주세요.";
  if (code === "COMMON_ERROR") return "결제 설정이 결제 방식과 맞지 않습니다. 토스페이먼츠 클라이언트 키(ck/gck)를 확인해 주세요.";
  return (err && err.message) || "결제를 시작하지 못했습니다.";
}

function loadTossSdk(kind) {
  const src = kind === "widget"
    ? "https://js.tosspayments.com/v2/standard"
    : "https://js.tosspayments.com/v1/payment";
  if (window.TossPayments && (kind !== "widget" || window.TossPayments.ANONYMOUS)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("결제 창을 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

function initPaymentSuccess() {
  mountShell("shop");
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId") || "";
  const result = document.querySelector("#payment-result");
  api("/api/payments/confirm", {
    method: "POST",
    body: JSON.stringify({
      paymentKey: params.get("paymentKey") || "",
      orderId,
      amount: Number(params.get("amount"))
    })
  }).then((data) => {
    removeOrderedFromCart(data && data.productIds);
    location.replace("/orders/complete/" + encodeURIComponent(orderId) + "/");
  }).catch((err) => {
    if (result) result.textContent = err.message;
  });
}

function initPaymentFail() {
  mountShell("shop");
  const params = new URLSearchParams(location.search);
  const result = document.querySelector("#payment-result");
  const message = params.get("message");
  if (result && message) result.textContent = message;
}

function initOrderComplete() {
  mountShell("shop");
  const parts = location.pathname.split("/").filter(Boolean);
  const orderId = decodeURIComponent(parts[parts.length - 1] || "");
  const el = document.querySelector("#complete-order-id");
  if (el && orderId) el.textContent = "주문번호 " + orderId;
}

function initAbout() {
  mountShell("about");
}

function initSitemap() {
  mountShell("about");
  const root = document.querySelector("#sitemap-root");
  if (!root) return;
  const pages = [
    ["index.html", "홈"],
    ["shop.html", "전체 상품"],
    ["guide.html", "급여·비급여 이용안내"],
    ["consult.html", "상담 신청"],
    ["about.html", "사업소 소개"],
    ["login.html", "로그인"],
    ["signup.html", "회원가입"],
    ["find-id.html", "아이디 찾기"],
    ["find-password.html", "비밀번호 찾기"],
    ["mypage.html", "마이페이지 · 주문조회"],
    ["privacy.html", "개인정보처리방침"],
    ["terms.html", "이용약관"],
    ["returns.html", "교환 및 반품 안내"]
  ];
  const pageList = pages.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("");
  const groupCols = GROUPS.map((g) => {
    const cats = CATEGORIES.filter((c) => c.group === g.id);
    const items = cats.map((c) =>
      `<li><a href="${shopQuery({ group: g.id, category: c.id })}">${esc(c.name)}</a></li>`
    ).join("");
    return `<article class="panel sitemap-col">
      <h2><a href="${esc(g.href)}">${esc(g.name)}</a></h2>
      <p class="muted">${esc(g.blurb)}</p>
      <ul class="sitemap-list">${items}</ul>
    </article>`;
  }).join("");
  root.innerHTML = `
    <article class="panel sitemap-col">
      <h2>바로가기</h2>
      <ul class="sitemap-list">${pageList}</ul>
    </article>
    ${groupCols}`;
  applyRegistrationGate();
}

function initAdmin() {
  mountShell("account");
  const gate = document.querySelector("#admin-gate");
  const dash = document.querySelector("#admin-dashboard");
  const setAdminHero = (mode) => {
    const title = document.querySelector("#admin-hero-title");
    const lead = document.querySelector("#admin-hero-lead");
    if (mode === "login") {
      if (title) title.textContent = "관리자 로그인";
      if (lead) lead.textContent = "헤리움 관리자 계정으로 로그인해 주세요.";
    } else {
      if (title) title.textContent = "주문·상품·회사 정보 관리";
      if (lead) lead.textContent = "주문 배송·취소와 재고 10개 이하 상품을 관리합니다.";
    }
  };
  const showGate = (msg) => {
    if (dash) dash.hidden = true;
    if (gate) gate.hidden = false;
    setAdminHero("login");
    if (msg) showFormError("#admin-login-error", msg);
  };
  const showDash = () => {
    if (gate) gate.hidden = true;
    if (dash) dash.hidden = false;
    setAdminHero("dash");
  };
  const bindAdminLogin = () => {
    const form = document.querySelector("#admin-login-form");
    if (!form || form.dataset.bound) return;
    form.dataset.bound = "1";
    bindPasswordToggles(form);
    form.onsubmit = async (e) => {
      e.preventDefault();
      showFormError("#admin-login-error", "");
      try {
        const data = await api("/api/login", {
          method: "POST",
          body: JSON.stringify({ login: form.login.value, password: form.password.value })
        });
        if (data.token) try { localStorage.setItem("sso_access_token", data.token); } catch (_e) {}
        if (!isAdminUser(data.user)) {
          showFormError("#admin-login-error", "관리자 권한이 없는 계정입니다. 헤리움 관리자 계정으로 로그인해 주세요.");
          return;
        }
        location.reload();
      } catch (err) {
        showFormError("#admin-login-error", err.message);
      }
    };
  };
  refreshAuth().then(async (user) => {
    if (!isAdminUser(user)) {
      const next = (location.pathname.replace(/^\//, "") || "admin.html");
      const loginHref = "login.html?next=" + encodeURIComponent(next);
      const extra = document.querySelector("#admin-login-page");
      if (extra) extra.href = loginHref;
      bindAdminLogin();
      if (user) {
        showGate("관리자 권한이 없는 계정입니다. 헤리움 관리자 계정으로 다시 로그인해 주세요.");
      } else {
        showGate("");
      }
      return;
    }
    showDash();
    const data = await api("/api/admin/products");
    const low = (data.lowStock || []).map((p) => `<li><b>${esc(p.name)}</b> 잔여 ${p.stock}개</li>`).join("");
    document.querySelector("#admin-low").innerHTML = "<h2>재고 10개 이하</h2>" + (low ? "<ul>" + low + "</ul>" : "<p>해당 상품이 없습니다.</p>");
    const companyData = await api("/api/admin/company").catch(() => ({ company: {} }));
    const companyForm = document.querySelector("#company-form");
    if (companyForm && companyData.company) {
      Object.keys(companyData.company).forEach((key) => {
        if (companyForm[key]) companyForm[key].value = companyData.company[key];
      });
    }
    const form = document.querySelector("#product-form");
    const id = getParam("id");
    if (id && form) form.id.value = id;
    if (!form) return;
    if (id) {
      api("/api/products/" + encodeURIComponent(id)).then((data) => {
        const row = data.product || {};
        if (row.name) form.name.value = row.name;
        if (row.price) form.price.value = row.price;
        if (row.salePrice != null) form.sale_price.value = row.salePrice;
        if (row.stock != null) form.stock.value = row.stock;
        if (row.category) form.category.value = row.category;
        if (form.thumbnail_url) form.thumbnail_url.value = row.thumbnail || row.image_url || "";
        if (form.images) form.images.value = (row.images || []).join("\n");
        if (form.description && row.desc) form.description.value = row.desc;
        form.is_hygiene_product.checked = Boolean(row.isHygiene);
        form.is_active.checked = row.isActive !== false;
      }).catch(() => {});
    }
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api("/api/admin/products/" + encodeURIComponent(form.id.value), {
          method: "PATCH",
          body: JSON.stringify({
            id: form.id.value,
            name: form.name.value,
            price: form.price.value,
            sale_price: form.sale_price.value,
            stock: form.stock.value,
            category: form.category.value,
            thumbnail_url: form.thumbnail_url ? form.thumbnail_url.value : "",
            images: form.images ? form.images.value : "",
            description: form.description ? form.description.value : "",
            is_hygiene_product: form.is_hygiene_product.checked,
            is_active: form.is_active.checked
          })
        });
        toast("상품을 저장했습니다.");
      } catch (err) {
        showFormError("#admin-error", err.message);
      }
    };
    const company = document.querySelector("#company-form");
    company.onsubmit = async (e) => {
      e.preventDefault();
      const body = {};
      ["shop_company_name", "shop_owner", "shop_privacy_officer", "shop_biz_no", "shop_online_sales_no", "shop_medical_sales_no", "shop_phone", "shop_email", "shop_address"].forEach((key) => {
        body[key] = company[key].value;
      });
      await api("/api/admin/company", { method: "POST", body: JSON.stringify(body) });
      toast("회사 정보를 저장했습니다.");
    };
    await loadAdminOrders();
  });
}

async function loadAdminOrders() {
  const box = document.querySelector("#admin-orders");
  if (!box) return;
  const filter = document.querySelector("#admin-order-status");
  const statuses = ["", "PAID", "PREPARING", "SHIPPING", "DELIVERED", "CANCEL_REQUESTED", "CANCELLED"];
  async function render() {
    const status = filter ? filter.value : "";
    const data = await api("/api/admin/orders" + (status ? "?status=" + encodeURIComponent(status) : ""));
    const carriers = data.carriers && data.carriers.length ? data.carriers : SHIP_CARRIERS;
    if (!data.orders.length) {
      box.innerHTML = "<p class=\"muted\">해당 주문이 없습니다.</p>";
      return;
    }
    box.innerHTML = data.orders.map((o) => {
      const items = (o.items || []).map((i) => `${esc(i.name)} × ${i.qty} (${won(i.total || i.unit * i.qty || 0)})`).join("<br>");
      const canShip = o.status === "PAID" || o.status === "PREPARING" || o.status === "SHIPPING";
      const carrierOpts = carriers.map((c) =>
        `<option value="${esc(c.code)}" ${c.code === o.carrier ? "selected" : ""}>${esc(c.name)}</option>`
      ).join("");
      const statusSelect = (canShip || o.status === "DELIVERED")
        ? `<label>상태
            <select data-admin-status="${esc(o.id)}">
              ${["PAID", "PREPARING", "SHIPPING", "DELIVERED"].map((s) =>
                `<option value="${s}" ${s === o.status ? "selected" : ""}>${statusLabel(s)}</option>`
              ).join("")}
            </select>
          </label>`
        : "";
      const shipForm = canShip
        ? `<div class="order-admin ship-fields" data-ship="${esc(o.id)}" ${o.status === "SHIPPING" ? "" : "hidden"}>
            <select data-carrier>${carrierOpts}</select>
            <input data-tracking placeholder="송장번호" value="${esc(o.trackingNumber || "")}" />
            <button class="btn btn-teal" type="button" data-ship-save="${esc(o.id)}">발송 저장</button>
          </div>`
        : "";
      const cancelBtns = o.status === "CANCEL_REQUESTED"
        ? `<div class="order-admin">
            <button class="btn btn-teal" type="button" data-cancel-approve="${esc(o.id)}">취소 승인</button>
            <input data-reject-reason="${esc(o.id)}" placeholder="거절 사유" />
            <select data-restore="${esc(o.id)}">
              <option value="PREPARING">상품준비중으로 복귀</option>
              <option value="SHIPPING">배송중으로 복귀</option>
            </select>
            <button class="btn btn-outline" type="button" data-cancel-reject="${esc(o.id)}">취소 거절</button>
          </div>`
        : "";
      const directCancel = (o.status === "PAID" || o.status === "PREPARING")
        ? `<div class="order-admin"><button class="btn btn-danger" type="button" data-cancel-direct="${esc(o.id)}">관리자 직권 취소</button></div>`
        : "";
      return `<article class="order-card">
        <div class="order-top">
          <div><b>${esc(o.number)}</b> <span class="status-pill ${statusClass(o.status)}">${statusLabel(o.status)}</span></div>
          <small>${esc((o.createdAt || "").replace("T", " ").slice(0, 16))}</small>
        </div>
        <p>주문자 ${esc(o.name || "")} · ${esc(o.phone || "")}</p>
        <p>수령인 ${esc(o.recipientName || o.name || "")} · ${esc(o.recipientPhone || "")}</p>
        <p class="muted">[${esc(o.postalCode || "")}] ${esc(o.addressBasic || o.address || "")} ${esc(o.addressDetail || "")}</p>
        <p>${items || "상품 없음"}</p>
        <p><b>${won(o.total || 0)}</b>${o.shippingFee ? ` · 배송비 ${won(o.shippingFee)}` : " · 배송비 무료"} ${o.paymentMethod ? " · " + esc(o.paymentMethod) : ""}</p>
        ${o.memo ? `<p class="muted">메모: ${esc(o.memo)}</p>` : ""}
        ${cancelReasonLine(o)}
        ${o.status !== "CANCELLED" && o.status !== "CANCELED" && o.cancelReason ? `<p class="muted">거절 사유: ${esc(o.cancelReason)}</p>` : ""}
        <div class="order-admin">${statusSelect}</div>
        ${shipForm}
        ${cancelBtns}
        ${directCancel}
      </article>`;
    }).join("");
  }
  if (filter && !filter.dataset.bound) {
    filter.dataset.bound = "1";
    filter.innerHTML = statuses.map((s) => `<option value="${s}">${s ? statusLabel(s) : "전체 주문"}</option>`).join("");
    filter.onchange = () => render().catch((err) => toast(err.message));
  }
  const modal = document.querySelector("#admin-cancel-modal");
  const cancelForm = document.querySelector("#admin-cancel-form");
  function closeCancelModal() {
    if (modal) modal.hidden = true;
  }
  if (modal && !modal.dataset.bound) {
    modal.dataset.bound = "1";
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-cancel-modal-close]")) closeCancelModal();
    });
  }
  if (cancelForm && !cancelForm.dataset.bound) {
    cancelForm.dataset.bound = "1";
    cancelForm.onsubmit = async (e) => {
      e.preventDefault();
      showFormError("#admin-cancel-error", "");
      const id = cancelForm.order_id.value;
      const reason = cancelForm.reason.value;
      const detailReason = cancelForm.detailReason.value;
      if (!reason) {
        showFormError("#admin-cancel-error", "취소 사유를 선택해 주세요.");
        return;
      }
      if (!confirm("이 주문의 결제를 환불하고 취소할까요?")) return;
      try {
        const result = await api("/api/admin/orders/" + encodeURIComponent(id) + "/cancel-direct", {
          method: "POST",
          body: JSON.stringify({ reason, detailReason })
        });
        toast(result.message || "관리자 취소 및 환불 처리가 완료되었습니다.");
        closeCancelModal();
        await render();
      } catch (err) {
        showFormError("#admin-cancel-error", err.message);
      }
    };
  }
  box.onchange = (e) => {
    const sel = e.target.closest("[data-admin-status]");
    if (!sel) return;
    const card = sel.closest("article");
    const shipBox = card && card.querySelector("[data-ship]");
    if (sel.value === "SHIPPING") {
      if (shipBox) shipBox.hidden = false;
      return;
    }
    if (shipBox) shipBox.hidden = true;
    if (sel.value === "PREPARING" || sel.value === "DELIVERED" || sel.value === "PAID") {
      api("/api/orders/" + encodeURIComponent(sel.getAttribute("data-admin-status")), {
        method: "PATCH",
        body: JSON.stringify({ status: sel.value })
      }).then(() => {
        toast("상태를 바꿨습니다.");
        return render();
      }).catch((err) => toast(err.message));
    }
  };
  box.onclick = async (e) => {
    const ship = e.target.closest("[data-ship-save]");
    const approve = e.target.closest("[data-cancel-approve]");
    const reject = e.target.closest("[data-cancel-reject]");
    const direct = e.target.closest("[data-cancel-direct]");
    try {
      if (direct) {
        if (cancelForm) {
          cancelForm.reset();
          cancelForm.order_id.value = direct.getAttribute("data-cancel-direct");
        }
        showFormError("#admin-cancel-error", "");
        if (modal) modal.hidden = false;
        return;
      }
      if (ship) {
        const wrap = ship.closest("[data-ship]");
        const carrier = wrap.querySelector("[data-carrier]").value;
        const tracking = wrap.querySelector("[data-tracking]").value;
        await api("/api/admin/orders/" + encodeURIComponent(ship.getAttribute("data-ship-save")) + "/ship", {
          method: "POST",
          body: JSON.stringify({ carrier, tracking_number: tracking })
        });
        toast("발송 저장했습니다.");
        await render();
      }
      if (approve) {
        if (!confirm("토스 결제를 취소하고 재고를 복구할까요?")) return;
        await api("/api/admin/orders/" + encodeURIComponent(approve.getAttribute("data-cancel-approve")) + "/cancel/approve", { method: "POST", body: "{}" });
        toast("취소를 승인했습니다.");
        await render();
      }
      if (reject) {
        const id = reject.getAttribute("data-cancel-reject");
        const card = reject.closest("article");
        const reasonEl = card && card.querySelector("[data-reject-reason]");
        const restoreEl = card && card.querySelector("[data-restore]");
        const reason = (reasonEl && reasonEl.value) || "";
        const restore = (restoreEl && restoreEl.value) || "PREPARING";
        await api("/api/admin/orders/" + encodeURIComponent(id) + "/cancel/reject", {
          method: "POST",
          body: JSON.stringify({ reason, restore_status: restore })
        });
        toast("취소 요청을 거절했습니다.");
        await render();
      }
    } catch (err) {
      toast(err.message);
    }
  };
  await render();
}

window.Oncare = { initHome, initShop, initProduct, initGuide, initConsult, initAbout, initSitemap, initLogin, initSignup, initFindId, initFindPassword, initResetPassword, initAccount, initCheckout, initPaymentSuccess, initPaymentFail, initOrderComplete, initAdmin, logout };
