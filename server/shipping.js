const FREE_SHIPPING_MIN = 50000;
const BASE_SHIPPING_FEE = 3000;

const CARRIERS = [
  { code: "kr.cjlogistics", name: "CJ대한통운" },
  { code: "kr.epost", name: "우체국택배" },
  { code: "kr.hanjin", name: "한진택배" },
  { code: "kr.logen", name: "로젠택배" },
  { code: "kr.lotte", name: "롯데택배" }
];

function shippingFee(goodsTotal) {
  const amount = Math.max(0, Number(goodsTotal) || 0);
  return amount >= FREE_SHIPPING_MIN ? 0 : BASE_SHIPPING_FEE;
}

function withShipping(goodsTotal) {
  const goods = Math.max(0, Number(goodsTotal) || 0);
  const fee = shippingFee(goods);
  return { goodsTotal: goods, shippingFee: fee, total: goods + fee };
}

function carrierBy(value) {
  const raw = String(value || "").trim();
  return CARRIERS.find((row) => row.code === raw || row.name === raw) || null;
}

function trackingUrl(carrier, trackingNumber) {
  const number = String(trackingNumber || "").trim();
  if (!number) return "";
  const found = carrierBy(carrier);
  const code = (found && found.code) || "kr.cjlogistics";
  return "https://tracker.delivery/#/" + encodeURIComponent(code) + "/" + encodeURIComponent(number);
}

module.exports = {
  FREE_SHIPPING_MIN,
  BASE_SHIPPING_FEE,
  CARRIERS,
  shippingFee,
  withShipping,
  carrierBy,
  trackingUrl
};
