const crypto = require("crypto");
const { z } = require("zod");
const { tooMany } = require("../guard");
const { cleanText } = require("../pii");
const db = require("../db");
const { newOrderId, orderNameFromItems } = require("./models");
const { withShipping } = require("../shipping");

const itemSchema = z.object({
  id: z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/),
  qty: z.coerce.number().int().min(1).max(20).optional(),
  quantity: z.coerce.number().int().min(1).max(20).optional(),
  option_text: z.string().trim().max(120).optional().default("")
});

const preorderSchema = z.object({
  items: z.array(itemSchema).min(1).max(30),
  recipient_name: z.string().trim().max(40).optional().default(""),
  recipient_phone: z.string().trim().max(20).optional().default(""),
  postal_code: z.string().trim().max(10).optional().default(""),
  zipcode: z.string().trim().max(10).optional().default(""),
  address: z.string().trim().max(200).optional().default(""),
  detail_address: z.string().trim().max(120).optional().default(""),
  address_detail: z.string().trim().max(120).optional().default(""),
  delivery_memo: z.string().trim().max(1000).optional().default(""),
  amount: z.coerce.number().int().nonnegative().optional()
});

function createPreorderHandler(deps) {
  const { buildItems, currentUser } = deps;

  return async function createPreorder(req, res) {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (tooMany("preorder", ip, 10, 10 * 60 * 1000)) {
      return res.status(429).json({ success: false, error: "잠시 후 다시 시도해 주세요." });
    }
    const parsed = preorderSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "주문할 상품을 확인해 주세요." });
    }
    const data = parsed.data;
    const requested = data.items.map((row) => ({
      id: row.id,
      qty: row.qty || row.quantity || 1,
      option_text: row.option_text || ""
    }));
    let built;
    try {
      built = await buildItems(requested);
    } catch (err) {
      return res.status(err.status || 400).json({ success: false, error: err.message || "주문할 상품을 확인해 주세요." });
    }
    if (!built.items.length) {
      return res.status(400).json({ success: false, error: "주문할 상품을 확인해 주세요." });
    }

    let name = data.recipient_name || "";
    let address = data.address || "";
    let memo = data.delivery_memo || "";
    try {
      if (name) name = cleanText(name, 40);
      if (address) address = cleanText(address, 200);
      if (memo) memo = cleanText(memo, 1000);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message || "배송 정보를 확인해 주세요." });
    }

    const user = await currentUser(req);
    const snapshots = built.items.map((item, index) => ({
      id: item.id,
      name: item.name,
      qty: item.qty,
      unit: item.unit,
      total: item.total,
      option_text: requested[index] && requested[index].option_text ? requested[index].option_text : ""
    }));
    const orderName = orderNameFromItems(snapshots);
    const priced = withShipping(built.total);
    const order = {
      id: "o_" + crypto.randomUUID(),
      number: newOrderId(),
      userId: user ? user.id : null,
      type: "order",
      name: name || (user && user.name) || "주문자",
      phone: data.recipient_phone || (user && user.phone) || "",
      address,
      memo,
      topics: [],
      items: snapshots,
      total: priced.total,
      shippingFee: priced.shippingFee,
      orderName,
      zipcode: data.postal_code || data.zipcode || "",
      addressDetail: data.detail_address || data.address_detail || "",
      createdAt: new Date().toISOString()
    };

    try {
      await db.createReadyOrder(order, snapshots);
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, error: err.message || "가주문을 만들지 못했습니다." });
    }

    return res.json({
      success: true,
      order_id: order.number,
      amount: order.total,
      shipping_fee: priced.shippingFee,
      goods_amount: priced.goodsTotal,
      order_name: orderName
    });
  };
}

function paymentSuccessHandler() {
  const { confirmTossOrder } = require("../payments");
  return async function paymentSuccess(req, res) {
    const paymentKey = String(req.query.paymentKey || "");
    const orderId = String(req.query.orderId || "");
    const amount = req.query.amount;
    try {
      await confirmTossOrder({
        paymentKey,
        orderId,
        amount,
        ip: req.ip || req.socket.remoteAddress || ""
      });
      return res.redirect(302, "/orders/complete/" + encodeURIComponent(orderId) + "/");
    } catch (err) {
      const msg = encodeURIComponent(err.message || "결제가 승인되지 않았습니다.");
      return res.redirect(302, "/orders/payment/fail/?orderId=" + encodeURIComponent(orderId) + "&message=" + msg);
    }
  };
}

function paymentFailHandler(root) {
  return function paymentFail(_req, res) {
    res.sendFile(require("path").join(root, "payment-fail.html"));
  };
}

function paymentCompleteHandler(root) {
  return function paymentComplete(_req, res) {
    res.sendFile(require("path").join(root, "order-complete.html"));
  };
}

function cancelOrderHandler() {
  const { cancelPaidOrder } = require("../payments");
  const { cancelPolicy } = require("./models");
  return async function cancelOrder(req, res) {
    try {
    const id = String(req.params.id || req.body.order_id || "").trim();
    let order = await db.findOrderById(id);
    if (!order) order = await db.findOrderByNumber(id);
    if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    if (req.user.role !== "admin" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "본인 주문만 취소할 수 있습니다." });
    }
    const policy = cancelPolicy(order);
    const wantRequest = req.body && (req.body.request === true || req.body.mode === "request");
    if (wantRequest || (!policy.canCancel && policy.canRequest)) {
      if (!policy.canRequest) {
        return res.status(400).json({ error: policy.message || "취소 요청을 접수할 수 없습니다." });
      }
      await db.updateOrderStatus(order.id, "CANCEL_REQUESTED", { previous_status: order.status });
      await db.writeAudit(req.user.id, "cancel_request", order.number, req.ip || "");
      return res.json({ ok: true, status: "CANCEL_REQUESTED", message: "취소 요청이 접수되었습니다." });
    }
    if (!policy.canCancel) {
      return res.status(400).json({ error: policy.message || "이 주문은 취소할 수 없습니다." });
    }
    if (policy.mode === "refund") {
      try {
        const canceled = await cancelPaidOrder(order);
        if (!canceled) await db.updateOrderStatus(order.id, "CANCELLED");
      } catch (_err) {
        return res.status(400).json({ error: "결제 취소가 완료되지 않았습니다. 고객센터로 문의해 주세요." });
      }
    } else {
      await db.updateOrderStatus(order.id, "CANCELLED");
    }
    await db.writeAudit(req.user.id, "order_cancel", order.number, req.ip || "");
    return res.json({ ok: true, status: "CANCELLED", message: "주문이 취소되었습니다." });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message || "주문 취소에 실패했습니다." });
    }
  };
}

module.exports = {
  createPreorderHandler,
  paymentSuccessHandler,
  paymentFailHandler,
  paymentCompleteHandler,
  cancelOrderHandler
};
