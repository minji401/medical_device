const crypto = require("crypto");
const { readPrepare } = require("./schemas");
const { tooMany } = require("./guard");
const { cleanText } = require("./pii");
const db = require("./db");

const TOSS_API = "https://api.tosspayments.com/v1/payments";

function tossKeys() {
  return {
    client: process.env.TOSS_CLIENT_KEY || "",
    secret: process.env.TOSS_SECRET_KEY || ""
  };
}

function authHeader() {
  return "Basic " + Buffer.from(tossKeys().secret + ":").toString("base64");
}

async function tossRequest(path, options) {
  const res = await fetch(TOSS_API + path, {
    method: (options && options.method) || "GET",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json"
    },
    body: options && options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "결제사 응답을 확인하지 못했습니다.");
    err.status = res.status;
    throw err;
  }
  return data;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 8) return "";
  return digits.slice(0, 3) + "-****-" + digits.slice(-4);
}

function maskAddress(address) {
  const parts = String(address || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return parts.slice(0, 2).join(" ") + " ****";
}

function publicOrder(order, mask) {
  return {
    id: order.id,
    number: order.number,
    type: order.type,
    name: order.name,
    phone: mask ? maskPhone(order.phone) : order.phone,
    address: mask ? maskAddress(order.address) : order.address,
    memo: order.memo,
    topics: order.topics || [],
    items: order.items,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt
  };
}

function nextFromToss(payment) {
  const status = String(payment.status || "");
  const method = payment.method || "";
  const paymentKey = payment.paymentKey || "";
  if (status === "DONE") {
    return {
      orderStatus: "PAID",
      paymentStatus: "PAID",
      releaseStock: false,
      paymentKey,
      method,
      approvedAt: payment.approvedAt || new Date().toISOString()
    };
  }
  if (status === "WAITING_FOR_DEPOSIT") {
    return {
      orderStatus: "PENDING",
      paymentStatus: "PENDING",
      releaseStock: false,
      paymentKey,
      method: method || "가상계좌"
    };
  }
  if (status === "PARTIAL_CANCELED") {
    return {
      orderStatus: "PAID",
      paymentStatus: "PARTIAL_CANCELED",
      releaseStock: false,
      paymentKey,
      method
    };
  }
  if (status === "CANCELED" || status === "EXPIRED" || status === "ABORTED") {
    return {
      orderStatus: "CANCELED",
      paymentStatus: "CANCELED",
      releaseStock: true,
      paymentKey,
      method
    };
  }
  return null;
}

async function applyVerified(tossPayment) {
  const saved = await db.findPaymentByTossOrderId(tossPayment.orderId);
  if (!saved) return null;
  if (Number(tossPayment.totalAmount) !== saved.amount) return null;
  const next = nextFromToss(tossPayment);
  if (!next) return null;
  return db.applyPaymentResult(tossPayment.orderId, next);
}

function attach(app, deps) {
  const { buildItems, currentUser, normalizePhone, validPhone, updateBuyerProfile, SITE } = deps;

  app.post("/api/payments/prepare", async (req, res) => {
    if (!tossKeys().client || !tossKeys().secret) {
      return res.status(503).json({ error: "카드 결제를 열려면 토스페이먼츠 키가 필요합니다. 키를 등록한 뒤에 결제창이 열립니다." });
    }
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (tooMany("pay-prepare", ip, 8, 10 * 60 * 1000)) {
      return res.status(429).json({ error: "잠시 후 다시 시도해 주세요." });
    }
    const parsed = readPrepare(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const user = await currentUser(req);
    let name = parsed.data.name;
    const phone = normalizePhone(parsed.data.phone);
    let address = parsed.data.address;
    let memo = parsed.data.memo || "";
    try {
      name = cleanText(name, 40);
      address = cleanText(address, 200);
      memo = cleanText(memo, 1000);
    } catch (err) {
      return res.status(400).json({ error: err.message || "입력 내용을 확인해 주세요." });
    }
    if (name.length < 2) return res.status(400).json({ error: "이름을 입력해 주세요." });
    if (!validPhone(phone)) return res.status(400).json({ error: "휴대폰 번호를 확인해 주세요." });
    if (address.length < 5) return res.status(400).json({ error: "배송·설치 주소를 입력해 주세요." });

    const requested = parsed.data.items;
    const built = buildItems(requested);
    if (!built.items.length || built.items.length !== requested.filter((row) => row && row.id).length) {
      return res.status(400).json({ error: "주문할 상품을 확인해 주세요." });
    }
    if (parsed.data.amount != null) {
      const claimed = parsed.data.amount;
      if (!Number.isInteger(claimed) || claimed !== built.total) {
        return res.status(400).json({ error: "결제 금액이 상품 가격과 다릅니다. 새로고침 후 다시 시도해 주세요." });
      }
    }

    const order = {
      id: "o_" + crypto.randomUUID(),
      number: "HM" + crypto.randomBytes(12).toString("hex"),
      userId: user ? user.id : null,
      type: "order",
      name,
      phone,
      address,
      memo,
      topics: [],
      items: built.items,
      total: built.total,
      createdAt: new Date().toISOString()
    };
    try {
      await db.createPendingCheckout(order, built.items);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message || "주문을 만들지 못했습니다." });
    }
    if (user) {
      await updateBuyerProfile(user.id, { name, phone, address });
    }
    const customerKey = user
      ? String(user.id).replace(/[^A-Za-z0-9\-_=.@]/g, "").slice(0, 50)
      : "guest" + crypto.randomBytes(8).toString("hex");
    res.json({
      orderId: order.number,
      amount: built.total,
      orderName: built.items.length === 1 ? built.items[0].name : built.items[0].name + " 외 " + (built.items.length - 1) + "건",
      clientKey: tossKeys().client,
      customerKey,
      successUrl: SITE + "/payment-success.html",
      failUrl: SITE + "/payment-fail.html",
      customerName: name,
      customerMobilePhone: phone
    });
  });

  app.post("/api/payments/confirm", async (req, res) => {
    const orderId = String(req.body.orderId || "");
    const paymentKey = String(req.body.paymentKey || "");
    const claimed = Number(req.body.amount);
    const saved = await db.findPaymentByTossOrderId(orderId);
    if (!saved || !paymentKey) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    if (!Number.isInteger(claimed) || claimed !== saved.amount) {
      return res.status(400).json({ error: "결제 금액이 주문 금액과 다릅니다." });
    }
    if (saved.status === "PAID") return res.json({ ok: true, status: "PAID" });
    let tossPayment = null;
    try {
      tossPayment = await tossRequest("/confirm", {
        method: "POST",
        body: { paymentKey, orderId, amount: saved.amount }
      });
    } catch (_err) {
      tossPayment = await tossRequest("/" + encodeURIComponent(paymentKey)).catch(() => null);
      if (!tossPayment || Number(tossPayment.totalAmount) !== saved.amount) {
        await db.applyPaymentResult(orderId, {
          orderStatus: "CANCELED",
          paymentStatus: "CANCELED",
          releaseStock: true
        });
        return res.status(400).json({ error: "결제가 승인되지 않았습니다." });
      }
    }
    if (Number(tossPayment.totalAmount) !== saved.amount) {
      await db.applyPaymentResult(orderId, {
        orderStatus: "CANCELED",
        paymentStatus: "CANCELED",
        releaseStock: true
      });
      return res.status(400).json({ error: "결제 금액이 주문 금액과 다릅니다." });
    }
    const applied = await applyVerified(tossPayment);
    if (!applied) return res.status(400).json({ error: "결제 상태를 저장하지 못했습니다." });
    res.json({ ok: true, status: applied.status, orderId });
  });

  app.post("/api/payments/fail", async (req, res) => {
    const orderId = String(req.body.orderId || "");
    const saved = await db.findPaymentByTossOrderId(orderId);
    if (!saved || saved.status === "PAID") return res.json({ ok: true });
    await db.applyPaymentResult(orderId, {
      orderStatus: "CANCELED",
      paymentStatus: "CANCELED",
      releaseStock: true
    });
    res.json({ ok: true });
  });

  app.post("/api/payments/webhook", async (req, res) => {
    if (!tossKeys().secret) return res.status(200).json({ ok: true });
    const body = req.body || {};
    const data = body.data && body.data.paymentKey ? body.data : body;
    const paymentKey = data && data.paymentKey;
    if (!paymentKey) return res.status(200).json({ ok: true });
    try {
      const looked = await tossRequest("/" + encodeURIComponent(paymentKey));
      await applyVerified(looked);
      res.status(200).json({ ok: true });
    } catch (_err) {
      console.error("payment webhook failed");
      res.status(500).json({ ok: false });
    }
  });
}

async function cancelPaidOrder(order) {
  const saved = await db.findPaymentByTossOrderId(order.number);
  if (saved && saved.paymentKey && saved.status !== "CANCELED" && tossKeys().secret) {
    await tossRequest("/" + encodeURIComponent(saved.paymentKey) + "/cancel", {
      method: "POST",
      body: { cancelReason: "관리자 취소" }
    });
  }
  if (saved) {
    await db.applyPaymentResult(order.number, {
      orderStatus: "CANCELED",
      paymentStatus: "CANCELED",
      releaseStock: true
    });
    return true;
  }
  return false;
}

module.exports = { attach, publicOrder, cancelPaidOrder };
