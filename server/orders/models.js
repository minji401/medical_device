const crypto = require("crypto");

const STATUSES = [
  "READY",
  "PAID",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
  "CANCEL_REQUESTED",
  "CANCELLED"
];

function newOrderId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return "ORD-" + stamp + "-" + rand;
}

function orderNameFromItems(items) {
  const list = items || [];
  if (!list.length) return "의료기 주문";
  const first = list[0].product_name || list[0].name || "상품";
  if (list.length === 1) return first;
  return first + " 외 " + (list.length - 1) + "건";
}

function normalizeStatus(status) {
  return {
    received: "READY",
    PENDING: "READY",
    reviewing: "PREPARING",
    confirmed: "PREPARING",
    SHIPPED: "SHIPPING",
    cancelled: "CANCELLED",
    CANCELED: "CANCELLED"
  }[status] || status || "READY";
}

function hasHygiene(order) {
  return (order.items || []).some((item) => item.hygiene || item.isHygiene || item.is_hygiene);
}

function cancelPolicy(order) {
  const status = normalizeStatus(order && order.status);
  const hygiene = hasHygiene(order || {});
  if (status === "CANCELLED" || status === "CANCELED") {
    return { canCancel: false, canRequest: false, mode: "none", message: "이미 취소된 주문입니다." };
  }
  if (status === "CANCEL_REQUESTED") {
    return { canCancel: false, canRequest: false, mode: "none", message: "취소 요청이 접수되어 처리 대기 중입니다." };
  }
  if (status === "READY" || status === "PENDING") {
    return { canCancel: true, canRequest: false, mode: "void", message: "" };
  }
  if (status === "PAID" || status === "PREPARING") {
    return {
      canCancel: true,
      canRequest: false,
      mode: "refund",
      message: hygiene ? "위생용품이 포함된 주문입니다. 개봉 후에는 반품이 제한됩니다." : ""
    };
  }
  if (status === "SHIPPING" || status === "DELIVERED") {
    return {
      canCancel: false,
      canRequest: true,
      mode: "request",
      message: hygiene
        ? "배송이 시작된 위생용품 주문은 개봉 후 단순 변심 반품이 제한됩니다. 고객센터(054-334-9986)로 문의해 주세요."
        : "배송이 시작된 주문은 바로 취소되지 않습니다. 취소 요청을 남기거나 고객센터(054-334-9986)로 연락해 주세요."
    };
  }
  return { canCancel: false, canRequest: false, mode: "none", message: "이 주문은 취소할 수 없습니다." };
}

function snapshotItem(product, qty, optionText) {
  const quantity = Math.max(1, Number(qty) || 1);
  const unitPrice = Math.max(0, Number(product.unit || product.unit_price || product.price) || 0);
  return {
    product_id: product.id,
    product_name: String(product.name || "").slice(0, 200),
    unit_price: unitPrice,
    quantity,
    option_text: String(optionText || product.option_text || "").slice(0, 120),
    subtotal_amount: unitPrice * quantity
  };
}

module.exports = {
  STATUSES,
  newOrderId,
  orderNameFromItems,
  normalizeStatus,
  snapshotItem,
  hasHygiene,
  cancelPolicy
};
