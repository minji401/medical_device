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

function cart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}
function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
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
  renderCart();
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
    ["account.html", "마이페이지", "account"],
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
  <footer class="site-footer"><div class="wrap">
    <div class="footer-grid">
      <div>
        <h4>현대 의료기</h4>
        <p class="foot-phone">054-334-9986</p>
        <p>평일 09:00–18:00 · 토요일 09:00–13:00<br>점심 12:30–13:30 · 일/공휴일 휴무</p>
      </div>
      <div>
        <h4>이용안내</h4>
        <p><a href="guide.html">급여·비급여 이용안내</a></p>
        <p><a href="shop.html">복지용구 · 비급여 · 장애인 용품</a></p>
        <p><a href="login.html">로그인 · 주문조회</a></p>
        <p><a href="sitemap.html">사이트맵</a></p>
        <p><a href="consult.html">방문설치 상담</a></p>
      </div>
      <div>
        <h4>고객지원</h4>
        <p>카카오톡 @현대의료기</p>
        <p>info@example.com</p>
        <p><a href="https://heriumcare.com/main.html" target="_blank" rel="noopener">헤리움 케어센터</a></p>
      </div>
      <div>
        <h4>사업소</h4>
        <p>경북 영천시 역전로 16 (완산동 1081-5)<br>대표 강시중<br>팩스 054-334-9985</p>
      </div>
    </div>
    <div class="legal">
      상호 현대의료기 | 대표 강시중 | 사업자등록번호 123-45-67890 | 대표전화 054-334-9986<br>
      헤리움 케어센터와 같은 자리에서 복지용구·일반의료기·장애인 용품을 안내합니다. 상품 가격과 급여 기준은 공단 고시에 따라 달라질 수 있습니다.
    </div>
  </div></footer>
  <div class="float-cs">
    <a class="kakao" href="consult.html">카카오 상담</a>
    <a class="call" href="tel:054-334-9986">전화상담</a>
  </div>
  <nav class="mobile-nav">
    <a href="index.html">🏠<br>홈</a>
    <a href="shop.html">🛍️<br>상품군</a>
    <a href="guide.html">📋<br>급여안내</a>
    <a href="account.html">👤<br>마이</a>
    <a href="#" data-open-cart>🛒<br>장바구니</a>
  </nav>
  <div class="cart-drawer" id="cart-drawer">
    <aside class="drawer">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>장바구니</h3>
        <button class="icon-btn" data-close-cart>✕</button>
      </div>
      <div id="cart-list"></div>
      <div class="cart-total" id="cart-total"></div>
      <a class="btn btn-teal btn-lg" style="width:100%" href="checkout.html">주문 접수하기</a>
    </aside>
  </div>`;
}

async function api(path, opts) {
  const res = await fetch(path, Object.assign({
    credentials: "include",
    headers: { "Content-Type": "application/json" }
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
  const raw = getParam("next") || "account.html";
  if (!/^[a-z0-9_-]+\.html(?:[#?].*)?$/i.test(raw)) return "account.html";
  return raw;
}

function showFormError(id, msg) {
  const el = document.querySelector(id);
  if (!el) return toast(msg);
  el.hidden = !msg;
  el.textContent = msg || "";
}

function statusLabel(status) {
  return { received: "접수", reviewing: "확인 중", confirmed: "안내 완료", cancelled: "취소" }[status] || status;
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
    if (link) {
      if (user) {
        link.href = "account.html";
        link.title = "마이페이지";
        link.textContent = user.name + "님";
      } else {
        link.href = "login.html";
        link.title = "로그인";
        link.textContent = "로그인";
      }
    }
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

function productCard(p) {
  const g = productGroup(p);
  return `<article class="card">
    <a href="product.html#id=${p.id}">
      <div class="thumb">
        <div class="badges">${(p.badges || []).map((b) => `<span class="badge ${b}">${badgeLabel(b)}</span>`).join("")}</div>
        ${ICONS[p.category] || ICONS.bed}
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

function renderCart() {
  const list = document.querySelector("#cart-list");
  if (!list) return;
  const items = cart();
  if (!items.length) {
    list.innerHTML = `<p class="empty">장바구니가 비어 있습니다.</p>`;
    document.querySelector("#cart-total").textContent = "";
    return;
  }
  let sum = 0;
  list.innerHTML = items.map((i) => {
    const p = productById(i.id);
    if (!p) return "";
    const unit = isWelfare(p) ? copay(p.price) : p.price;
    const pay = unit * i.qty;
    sum += pay;
    return `<div class="cart-item">
      <div class="thumb" style="aspect-ratio:1;border-radius:12px">${ICONS[p.category] || ICONS.bed}</div>
      <div>
        <b>${p.name}</b>
        <div>${i.qty}개 · ${isWelfare(p) ? "본인부담" : "판매가"} ${won(pay)}</div>
      </div>
      <button class="icon-btn" data-remove="${p.id}">✕</button>
    </div>`;
  }).join("");
  document.querySelector("#cart-total").textContent = "예상 합계 " + won(sum);
}

function mountShell(page) {
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");
  if (header) header.innerHTML = headerHTML(page);
  if (footer) footer.innerHTML = footerHTML();
  updateCartCount();
  renderCart();
  refreshAuth();
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
    const remove = e.target.closest("[data-remove]");
    if (remove) removeFromCart(remove.dataset.remove);
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
  const list = productsByFilter({ group, category, mode, q });
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
  if (!window.__shopHashBound) {
    window.__shopHashBound = true;
    window.addEventListener("hashchange", () => {
      if (/shop/i.test(location.pathname)) initShop();
    });
  }
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
  box.innerHTML = `
    <div class="crumbs"><a href="index.html">홈</a> · <a href="shop.html#group=${g}">${groupName(g)}</a> · ${categoryName(p.category)}</div>
    <div class="product-layout">
      <div class="gallery">${ICONS[p.category] || ICONS.bed}</div>
      <div class="buybox">
        <div class="meta">★ ${p.rating} · 후기 ${p.reviews} · ${groupName(g)} · ${p.mode === "rent" ? "대여상품" : "구매상품"}</div>
        <h1>${p.name}</h1>
        <p>${p.desc}</p>
        <div class="price-box">${priceBox}</div>
        <ul class="spec">${Object.entries(p.specs).map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("")}</ul>
        <div class="qty">
          <button type="button" id="minus">−</button>
          <strong id="qty">1</strong>
          <button type="button" id="plus">+</button>
        </div>
        <div class="card-actions">
          <button class="btn btn-outline btn-lg" id="add-btn">장바구니</button>
          <a class="btn btn-teal btn-lg" href="consult.html?item=${encodeURIComponent(p.name)}">바로 상담</a>
        </div>
      </div>
    </div>`;
  let qty = 1;
  box.querySelector("#plus").onclick = () => { qty += 1; box.querySelector("#qty").textContent = qty; };
  box.querySelector("#minus").onclick = () => { qty = Math.max(1, qty - 1); box.querySelector("#qty").textContent = qty; };
  box.querySelector("#add-btn").onclick = () => addToCart(p.id, qty);
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
    if (user) location.href = loginNext();
  });
  const form = document.querySelector("#login-form");
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#login-error", "");
    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ login: form.login.value, password: form.password.value })
      });
      location.href = loginNext();
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
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#signup-error", "");
    try {
      await api("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          username: form.username.value,
          name: form.name.value,
          phone: form.phone.value,
          password: form.password.value
        })
      });
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
  bindPasswordToggles();
  const form = document.querySelector("#reset-form");
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    showFormError("#reset-error", "");
    try {
      await api("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({
          login: form.login.value,
          name: form.name.value,
          phone: form.phone.value,
          password: form.password.value
        })
      });
      toast("비밀번호를 바꿨습니다. 다시 로그인해 주세요.");
      location.href = "login.html";
    } catch (err) {
      showFormError("#reset-error", err.message);
    }
  };
}

function initAccount() {
  mountShell("account");
  refreshAuth().then(async (user) => {
    if (!user) {
      location.href = "login.html#next=account.html";
      return;
    }
    document.querySelector("#account-name").textContent = user.name + "님";
    const bits = [];
    if (user.username) bits.push("아이디 " + user.username);
    bits.push(user.phone || "휴대폰 미등록");
    if (user.role === "admin") bits.push("관리자");
    document.querySelector("#account-phone").textContent = bits.join(" · ");
    document.querySelector("#logout-btn").onclick = async () => {
      await api("/api/logout", { method: "POST", body: "{}" });
      location.href = "index.html";
    };
    try {
      const data = await api("/api/orders");
      const box = document.querySelector("#order-list");
      if (!data.orders.length) {
        box.innerHTML = `<p class="empty">아직 접수된 주문이 없습니다.</p>`;
        return;
      }
      box.innerHTML = data.orders.map((o) => {
        const items = (o.items || []).map((i) => `${esc(i.name)} × ${i.qty}`).join("<br>");
        const topics = (o.topics || []).map(esc).join(", ");
        const admin = user.role === "admin"
          ? `<div class="order-admin">
              <label>상태
                <select data-order-status="${esc(o.id)}">
                  ${["received", "reviewing", "confirmed", "cancelled"].map((s) =>
                    `<option value="${s}" ${s === o.status ? "selected" : ""}>${statusLabel(s)}</option>`
                  ).join("")}
                </select>
              </label>
            </div>`
          : "";
        return `<article class="panel order-card">
          <div class="order-top">
            <div>
              <b>${esc(o.number)}</b>
              <span class="status-pill">${statusLabel(o.status)}</span>
            </div>
            <small>${esc((o.createdAt || "").replace("T", " ").slice(0, 16))}</small>
          </div>
          <p>${o.type === "consult" ? "상담 신청" : "상품 주문"} · ${esc(o.name)} · ${esc(o.phone)}</p>
          ${o.address ? `<p>${esc(o.address)}</p>` : ""}
          ${topics ? `<p>관심 품목: ${topics}</p>` : ""}
          ${items ? `<p>${items}</p>` : ""}
          ${o.total ? `<p><b>예상 합계 ${won(o.total)}</b> (결제 전 접수)</p>` : ""}
          ${o.memo ? `<p class="muted">${esc(o.memo)}</p>` : ""}
          ${admin}
        </article>`;
      }).join("");
      box.onchange = async (e) => {
        const sel = e.target.closest("[data-order-status]");
        if (!sel) return;
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
    } catch (err) {
      toast(err.message);
    }
  });
}

function initCheckout() {
  mountShell("shop");
  refreshAuth().then((user) => {
    if (!user) {
      location.href = "login.html#next=checkout.html";
      return;
    }
    const form = document.querySelector("#checkout-form");
    if (form) {
      form.name.value = user.name;
      form.phone.value = user.phone || "";
    }
    const items = cart();
    const box = document.querySelector("#checkout-items");
    const totalEl = document.querySelector("#checkout-total");
    if (!items.length) {
      box.innerHTML = `<p class="empty">장바구니가 비어 있습니다. <a href="shop.html">상품 보러 가기</a></p>`;
      if (form) form.querySelector("button[type=submit]").disabled = true;
      return;
    }
    let sum = 0;
    box.innerHTML = items.map((i) => {
      const p = productById(i.id);
      if (!p) return "";
      const unit = isWelfare(p) ? copay(p.price) : p.price;
      const pay = unit * i.qty;
      sum += pay;
      return `<div class="cart-item">
        <div class="thumb" style="aspect-ratio:1;border-radius:12px">${ICONS[p.category] || ICONS.bed}</div>
        <div><b>${esc(p.name)}</b><div>${i.qty}개 · ${won(pay)}</div></div>
      </div>`;
    }).join("");
    totalEl.textContent = "예상 합계 " + won(sum) + " · 결제 전 접수";
    form.onsubmit = async (e) => {
      e.preventDefault();
      showFormError("#checkout-error", "");
      try {
        const result = await api("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            type: "order",
            name: form.name.value,
            phone: form.phone.value,
            address: form.address.value,
            memo: form.memo.value,
            items
          })
        });
        saveCart([]);
        toast("주문이 접수되었습니다. " + result.order.number);
        location.href = "account.html";
      } catch (err) {
        showFormError("#checkout-error", err.message);
      }
    };
  });
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
    ["account.html", "마이페이지 · 주문조회"]
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
}

window.Oncare = { initHome, initShop, initProduct, initGuide, initConsult, initAbout, initSitemap, initLogin, initSignup, initFindId, initFindPassword, initAccount, initCheckout };
