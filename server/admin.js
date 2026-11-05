const db = require("./db");
const { CARRIERS, carrierBy, trackingUrl } = require("./shipping");
const { cancelPaidOrder, cancelTossOrThrow, publicOrder } = require("./payments");

function attach(app, deps) {
  const requireAdmin = deps.requireAdmin;

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const status = String(req.query.status || "").trim();
      const list = await db.listOrders({ all: true, status: status || "" });
      await db.writeAudit(req.user.id, "admin_orders", status || "all", req.ip || "");
      res.json({
        orders: list.map((order) => {
          const row = publicOrder(order, false);
          row.trackingUrl = trackingUrl(order.carrier, order.trackingNumber);
          return row;
        }),
        carriers: CARRIERS
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "주문 목록을 불러오지 못했습니다." });
    }
  });

  app.post("/api/admin/orders/:id/ship", requireAdmin, async (req, res) => {
    try {
      const order = await findAdminOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
      if (["CANCELLED", "CANCELED"].indexOf(order.status) >= 0) {
        return res.status(400).json({ error: "취소된 주문은 발송할 수 없습니다." });
      }
      if (order.status !== "PAID" && order.status !== "PREPARING" && order.status !== "SHIPPING") {
        return res.status(400).json({ error: "결제 완료된 주문만 발송 처리할 수 있습니다." });
      }
      const tracking = String((req.body && req.body.tracking_number) || "").trim();
      const carrierInput = String((req.body && req.body.carrier) || "").trim();
      if (!tracking) return res.status(400).json({ error: "운송장 번호를 입력해 주세요." });
      const found = carrierBy(carrierInput);
      if (!found) return res.status(400).json({ error: "지원하는 택배사를 선택해 주세요." });
      const saved = await db.updateOrderStatus(order.id, "SHIPPING", {
        tracking_number: tracking,
        carrier: found.code
      });
      await db.writeAudit(req.user.id, "order_ship", order.number + ":" + found.code, req.ip || "");
      res.json({
        ok: true,
        status: "SHIPPING",
        carrier: found.code,
        carrierName: found.name,
        tracking_number: tracking,
        trackingUrl: trackingUrl(found.code, tracking),
        order: publicOrder(saved, false)
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "발송 처리에 실패했습니다." });
    }
  });

  app.post("/api/admin/orders/:id/cancel/approve", requireAdmin, async (req, res) => {
    try {
      const order = await findAdminOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
      if (order.status !== "CANCEL_REQUESTED" && order.status !== "PAID" && order.status !== "PREPARING") {
        return res.status(400).json({ error: "취소 승인할 수 있는 상태가 아닙니다." });
      }
      const canceled = await cancelPaidOrder(order);
      if (!canceled) await db.updateOrderStatus(order.id, "CANCELLED");
      await db.writeAudit(req.user.id, "cancel_approve", order.number, req.ip || "");
      res.json({ ok: true, status: "CANCELLED", message: "결제를 취소하고 재고를 복구했습니다." });
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message || "취소 승인에 실패했습니다." });
    }
  });

  app.post("/api/admin/orders/:id/cancel-direct", requireAdmin, async (req, res) => {
    try {
      const order = await findAdminOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
      if (order.status !== "PAID" && order.status !== "PREPARING") {
        return res.status(400).json({ error: "결제완료·상품준비중 주문만 직권 취소할 수 있습니다. 배송중이거나 이미 취소된 건은 처리할 수 없습니다." });
      }
      const reason = String((req.body && req.body.reason) || "").trim().slice(0, 255);
      const detailReason = String((req.body && req.body.detailReason) || "").trim().slice(0, 200);
      if (!reason) return res.status(400).json({ error: "취소 사유를 선택해 주세요." });
      const fullReason = detailReason ? (reason + " / " + detailReason).slice(0, 255) : reason;
      const savedPay = await db.findPaymentByTossOrderId(order.number);
      const paymentKey = (savedPay && savedPay.paymentKey) || order.paymentKey || "";
      try {
        await cancelTossOrThrow(paymentKey, "[관리자 취소] " + fullReason);
      } catch (err) {
        return res.status(err.status || 502).json({
          error: err.message || "토스 환불에 실패했습니다. 주문 상태는 변경하지 않았습니다."
        });
      }
      await db.cancelDirectOrder(order.id, { reason: fullReason, cancelledBy: "ADMIN" });
      await db.writeAudit(req.user.id, "cancel_direct", order.number + ":" + fullReason, req.ip || "");
      res.json({
        success: true,
        ok: true,
        status: "CANCELLED",
        message: "관리자 취소 및 환불 처리가 완료되었습니다."
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "직권 취소에 실패했습니다." });
    }
  });

  app.post("/api/admin/orders/:id/cancel/reject", requireAdmin, async (req, res) => {
    try {
      const order = await findAdminOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
      if (order.status !== "CANCEL_REQUESTED") {
        return res.status(400).json({ error: "취소 요청 상태인 주문만 거절할 수 있습니다." });
      }
      const reason = String((req.body && req.body.reason) || "").trim().slice(0, 500);
      if (!reason) return res.status(400).json({ error: "거절 사유를 입력해 주세요." });
      let restore = String((req.body && req.body.restore_status) || order.previousStatus || "PREPARING").trim();
      if (["PREPARING", "SHIPPING", "PAID"].indexOf(restore) < 0) restore = "PREPARING";
      if (order.trackingNumber && restore === "PAID") restore = "SHIPPING";
      await db.updateOrderStatus(order.id, restore, { cancel_reason: reason });
      await db.writeAudit(req.user.id, "cancel_reject", order.number + ":" + restore, req.ip || "");
      res.json({ ok: true, status: restore, message: "취소 요청을 거절했습니다." });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "취소 거절에 실패했습니다." });
    }
  });
}

async function findAdminOrder(id) {
  return (await db.findOrderById(id)) || (await db.findOrderByNumber(id));
}

module.exports = { attach };
