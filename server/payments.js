const crypto = require("crypto");
const { readPrepare } = require("./schemas");
const { tooMany } = require("./guard");
const { cleanText } = require("./pii");
const db = require("./db");
const settings = require("./settings");
const { newOrderId, cancelPolicy } = require("./orders/models");
const { withShipping, trackingUrl } = require("./shipping");

const TOSS_API = "https://api.tosspayments.com/v1/payments";

function tossKeys() {
  return {
    client: settings.TOSS_CLIENT_KEY,
    secret: settings.TOSS_SECRET_KEY
  };
}

function authHeader() {
  return "Basic " + Buffer.from(tossKeys().secret + ":").toString("base64");
}

function httpStatus(err, fallback) {
  const n = Number(err && err.status);
  if (n >= 400 && n < 600) return n;
  return fallback || 500;
}

function sendJsonError(res, err, fallback) {
  const status = httpStatus(err, 500);
  const message = String((err && err.message) || fallback || "결제 처리 중 오류가 발생했습니다.");
  console.error("payments:", message);
  if (!res || res.headersSent) return;
  try {
    res.status(status).json({ error: message });
  } catch (_e) {}
}

async function tossRequest(path, options) {
  try {
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
      err.status = res.status >= 400 ? res.status : 502;
      throw err;
    }
    return data;
  } catch (err) {
    if (err && err.status) throw err;
    const wrap = new Error("결제사와 연결하지 못했습니다.");
    wrap.status = 502;
    throw wrap;
  }
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
  if (!order) return null;
  let cancel = { canCancel: false, canRequest: false, mode: "none", message: "" };
  try { cancel = cancelPolicy(order); } catch (_e) {}
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
    createdAt: order.createdAt,
    orderId: order.orderId || order.number,
    orderName: order.orderName || "",
    paidAt: order.paidAt || "",
    trackingNumber: order.trackingNumber || "",
    carrier: order.carrier || "",
    trackingUrl: trackingUrl(order.carrier, order.trackingNumber),
    receiptUrl: order.receiptUrl || "",
    paymentMethod: order.paymentMethod || "",
    shippingFee: Number(order.shippingFee) || 0,
    recipientName: order.recipientName || order.name || "",
    recipientPhone: mask ? maskPhone(order.recipientPhone || order.phone) : (order.recipientPhone || order.phone || ""),
    addressBasic: mask ? maskAddress(order.addressBasic || order.address) : (order.addressBasic || order.address || ""),
    addressDetail: mask ? "" : (order.addressDetail || ""),
    postalCode: order.postalCode || order.zipcode || "",
    cancelReason: order.cancelReason || "",
    previousStatus: order.previousStatus || "",
    title: ((order.items || [])[0] && (order.items || [])[0].name) || (order.type === "consult" ? "상담 신청" : "주문"),
    cancel
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
      orderStatus: "CANCELLED",
      paymentStatus: "CANCELED",
      releaseStock: true,
      paymentKey,
      method
    };
  }
  return null;
}

async function applyVerified(tossPayment) {
  try {
    if (!tossPayment || !tossPayment.orderId) return null;
    const saved = await db.findPaymentByTossOrderId(tossPayment.orderId);
    if (!saved) return null;
    const order = await db.findOrderByNumber(tossPayment.orderId);
    const expected = order
      ? Number(order.totalAmount != null ? order.totalAmount : order.total)
      : saved.amount;
    if (Number(tossPayment.totalAmount) !== Number(expected) || Number(tossPayment.totalAmount) !== Number(saved.amount)) {
      return null;
    }
    const next = nextFromToss(tossPayment);
    if (!next) return null;
    return await db.applyPaymentResult(tossPayment.orderId, next);
  } catch (err) {
    console.error("applyVerified failed", err && err.message);
    return null;
  }
}

async function cancelTossPayment(paymentKey, reason) {
  if (!paymentKey || !tossKeys().secret) return;
  await tossRequest("/" + encodeURIComponent(paymentKey) + "/cancel", {
    method: "POST",
    body: { cancelReason: String(reason || "주문 저장 실패 자동취소").slice(0, 200) }
  });
}

async function confirmTossOrder({ paymentKey, orderId, amount, ip }) {
  try {
    const key = String(paymentKey || "").trim();
    const number = String(orderId || "").trim();
    const claimed = Number(amount);
    if (!key || !number) {
      const err = new Error("결제 정보가 없습니다.");
      err.status = 400;
      throw err;
    }
    let order = null;
    try {
      order = await db.findOrderByNumber(number);
    } catch (err) {
      const wrap = new Error("주문 정보를 확인하지 못했습니다.");
      wrap.status = 500;
      throw wrap;
    }
    if (!order) {
      const err = new Error("주문을 찾을 수 없습니다.");
      err.status = 404;
      throw err;
    }
    if (order.status === "PAID") {
      const paidIds = (order.items || []).map((item) => item.id || item.product_id).filter(Boolean);
      return { ok: true, already: true, status: "PAID", orderId: order.number, amount: order.total, productIds: paidIds };
    }
    if (order.status !== "READY" && order.status !== "PENDING") {
      const err = new Error("결제할 수 없는 주문 상태입니다.");
      err.status = 409;
      throw err;
    }
    const expected = Number(order.totalAmount != null ? order.totalAmount : order.total);
    const goods = (order.items || []).reduce((sum, item) => {
      const line = Number(item.total || item.subtotal_amount);
      if (Number.isFinite(line) && line > 0) return sum + line;
      return sum + (Number(item.unit || item.unit_price) || 0) * (Number(item.qty || item.quantity) || 1);
    }, 0);
    const fee = Number(order.shippingFee) || 0;
    const recomputed = goods + fee;
    if (!Number.isInteger(claimed) || claimed !== expected || (recomputed > 0 && recomputed !== expected)) {
      try {
        await db.writeAudit("system", "payment_tamper", number + ":expected=" + expected + ":claimed=" + claimed, ip || "");
      } catch (_e) {}
      console.error("payment amount mismatch", number, expected, claimed);
      const err = new Error("결제 금액이 주문 금액과 다릅니다.");
      err.status = 400;
      err.tamper = true;
      throw err;
    }
    if (!tossKeys().secret) {
      const err = new Error("결제 설정이 없습니다.");
      err.status = 503;
      throw err;
    }
    let tossPayment = null;
    try {
      tossPayment = await tossRequest("/confirm", {
        method: "POST",
        body: { paymentKey: key, orderId: number, amount: expected }
      });
    } catch (_err) {
      tossPayment = await tossRequest("/" + encodeURIComponent(key)).catch(() => null);
      if (!tossPayment || String(tossPayment.orderId) !== number || Number(tossPayment.totalAmount) !== expected) {
        const err = new Error("결제가 승인되지 않았습니다.");
        err.status = 400;
        throw err;
      }
    }
    if (!tossPayment || String(tossPayment.orderId) !== number || Number(tossPayment.totalAmount) !== expected) {
      try {
        await db.writeAudit("system", "payment_tamper", number + ":toss=" + (tossPayment && tossPayment.totalAmount), ip || "");
      } catch (_e) {}
      try { await cancelTossPayment(key, "금액 불일치 자동취소"); } catch (_e) {}
      const err = new Error("결제 금액이 주문 금액과 다릅니다.");
      err.status = 400;
      err.tamper = true;
      throw err;
    }
    try {
      const receiptUrl = (tossPayment.receipt && tossPayment.receipt.url) || "";
      const saved = await db.finalizePaidOrder(number, {
        paymentKey: key,
        method: tossPayment.method || "",
        receiptUrl,
        approvedAt: tossPayment.approvedAt || new Date().toISOString(),
        amount: expected
      });
      try {
        const paid = await db.findOrderByNumber(number);
        if (paid && paid.userId) {
          const productIds = (paid.items || []).map((item) => item.id || item.product_id).filter(Boolean);
          await db.clearPurchasedCart(paid.userId, productIds);
        }
      } catch (cartErr) {
        console.error("cart clear after confirm", cartErr && cartErr.message);
      }
      const productIds = (order.items || []).map((item) => item.id || item.product_id).filter(Boolean);
      return { ok: true, already: Boolean(saved && saved.already), status: "PAID", orderId: number, amount: expected, productIds };
    } catch (err) {
      try {
        await cancelTossPayment(key, "주문 저장 실패 자동취소");
      } catch (cancelErr) {
        console.error("망취소 실패", number, cancelErr && cancelErr.message);
      }
      err.status = err.status || 500;
      throw err;
    }
  } catch (err) {
    if (err && err.status) throw err;
    const wrap = new Error("결제를 확인하지 못했습니다.");
    wrap.status = 500;
    console.error("confirmTossOrder", err && err.message);
    throw wrap;
  }
}

function attach(app, deps) {
  const { buildItems, currentUser, normalizePhone, validPhone, updateBuyerProfile, SITE } = deps;

  app.post("/api/payments/prepare", async (req, res) => {
    try {
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
      let savedOrder = null;
      if (parsed.data.order_id) {
        savedOrder = await db.findOrderByNumber(parsed.data.order_id);
        if (!savedOrder) return res.status(404).json({ error: "가주문을 찾을 수 없습니다." });
        const ready = savedOrder.status === "READY" || savedOrder.status === "PENDING";
        if (!ready) return res.status(409).json({ error: "이미 처리된 주문입니다." });
      }
      let built;
      try {
        built = await buildItems(requested);
      } catch (err) {
        return res.status(err.status || 400).json({ error: err.message || "주문할 상품을 확인해 주세요." });
      }
      if (!built.items.length || built.items.length !== requested.filter((row) => row && row.id).length) {
        return res.status(400).json({ error: "주문할 상품을 확인해 주세요." });
      }
      const priced = withShipping(built.total);
      if (savedOrder && Number(savedOrder.total) !== priced.total) {
        return res.status(400).json({ error: "결제 금액이 상품 가격과 다릅니다. 새로고침 후 다시 시도해 주세요." });
      }
      if (parsed.data.amount != null) {
        const claimed = parsed.data.amount;
        if (!Number.isInteger(claimed) || claimed !== priced.total) {
          return res.status(400).json({ error: "결제 금액이 상품 가격과 다릅니다. 새로고침 후 다시 시도해 주세요." });
        }
      }

      const orderName = built.items.length === 1 ? built.items[0].name : built.items[0].name + " 외 " + (built.items.length - 1) + "건";
      const order = {
        id: savedOrder ? savedOrder.id : "o_" + crypto.randomUUID(),
        number: savedOrder ? savedOrder.number : newOrderId(),
        userId: user ? user.id : (savedOrder && savedOrder.userId) || null,
        type: "order",
        name,
        phone,
        address,
        memo,
        topics: [],
        items: built.items,
        total: priced.total,
        shippingFee: priced.shippingFee,
        orderName: savedOrder && savedOrder.orderName ? savedOrder.orderName : orderName,
        zipcode: parsed.data.zipcode || "",
        addressDetail: parsed.data.address_detail || "",
        createdAt: savedOrder ? savedOrder.createdAt : new Date().toISOString()
      };
      try {
        await db.createPendingCheckout(order, built.items);
      } catch (err) {
        return res.status(err.status || 500).json({ error: err.message || "주문을 만들지 못했습니다." });
      }
      if (user) {
        try {
          await updateBuyerProfile(user.id, { name, phone, address });
          await db.upsertShopProfile(user.id, {
            recipient_name: name,
            recipient_phone: phone,
            address_basic: address,
            address_detail: parsed.data.address_detail || "",
            zipcode: parsed.data.zipcode || ""
          });
        } catch (err) {
          console.error("prepare profile save", err && err.message);
        }
      }
      const customerKey = user
        ? String(user.id).replace(/[^A-Za-z0-9\-_=.@]/g, "").slice(0, 50)
        : "guest" + crypto.randomBytes(8).toString("hex");
      return res.json({
        orderId: order.number,
        amount: priced.total,
        orderName: order.orderName,
        clientKey: tossKeys().client,
        customerKey,
        successUrl: SITE + "/payment-success.html",
        failUrl: SITE + "/payment-fail.html",
        customerName: name,
        customerMobilePhone: phone
      });
    } catch (err) {
      return sendJsonError(res, err, "주문을 준비하지 못했습니다.");
    }
  });

  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const result = await confirmTossOrder({
        paymentKey: req.body && req.body.paymentKey,
        orderId: req.body && req.body.orderId,
        amount: req.body && req.body.amount,
        ip: req.ip || ""
      });
      return res.json(result);
    } catch (err) {
      return sendJsonError(res, err, "결제를 확인하지 못했습니다.");
    }
  });

  app.post("/api/payments/fail", async (req, res) => {
    try {
      const orderId = String((req.body && req.body.orderId) || "");
      if (!orderId) return res.json({ ok: true });
      const saved = await db.findPaymentByTossOrderId(orderId);
      if (!saved || saved.status === "PAID") return res.json({ ok: true });
      await db.applyPaymentResult(orderId, {
        orderStatus: "CANCELLED",
        paymentStatus: "CANCELED",
        releaseStock: true
      });
      return res.json({ ok: true });
    } catch (err) {
      return sendJsonError(res, err, "결제 실패 처리를 하지 못했습니다.");
    }
  });

  app.post("/api/payments/webhook", async (req, res) => {
    try {
      if (!tossKeys().secret) return res.status(200).json({ ok: true });
      const expectedAuth = String(process.env.TOSS_WEBHOOK_SECRET || "").trim();
      if (expectedAuth) {
        const given = String(req.get("authorization") || "");
        const ok = given === expectedAuth || given === "Basic " + Buffer.from(expectedAuth + ":").toString("base64");
        if (!ok) {
          require("./security_log").event("webhook_auth_fail", { ip: req.ip || "" });
          return res.status(401).json({ ok: false });
        }
      }
      const body = req.body || {};
      const data = body.data && body.data.paymentKey ? body.data : body;
      const paymentKey = data && data.paymentKey;
      if (!paymentKey) return res.status(200).json({ ok: true });
      const looked = await tossRequest("/" + encodeURIComponent(paymentKey));
      if (!looked || !looked.orderId) return res.status(200).json({ ok: true });
      const order = await db.findOrderByNumber(looked.orderId);
      if (!order) return res.status(200).json({ ok: true });
      const expected = Number(order.totalAmount != null ? order.totalAmount : order.total);
      if (Number(looked.totalAmount) !== expected) {
        await db.writeAudit("system", "webhook_tamper", looked.orderId + ":" + looked.totalAmount, req.ip || "");
        return res.status(200).json({ ok: true });
      }
      await applyVerified(looked);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("payment webhook failed", err && err.message);
      if (res.headersSent) return;
      return res.status(500).json({ ok: false, error: "웹훅 처리에 실패했습니다." });
    }
  });
}

async function cancelPaidOrder(order) {
  try {
    if (!order || !order.number) return false;
    const saved = await db.findPaymentByTossOrderId(order.number);
    const paymentKey = (saved && saved.paymentKey) || order.paymentKey || "";
    if (paymentKey && (!saved || saved.status !== "CANCELED") && tossKeys().secret) {
      await tossRequest("/" + encodeURIComponent(paymentKey) + "/cancel", {
        method: "POST",
        body: { cancelReason: "관리자 취소 승인" }
      });
    }
    if (saved) {
      await db.applyPaymentResult(order.number, {
        orderStatus: "CANCELLED",
        paymentStatus: "CANCELED",
        releaseStock: true
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error("cancelPaidOrder", err && err.message);
    const wrap = new Error("결제 취소에 실패했습니다.");
    wrap.status = 502;
    throw wrap;
  }
}

module.exports = { attach, publicOrder, cancelPaidOrder, tossKeys, confirmTossOrder };
