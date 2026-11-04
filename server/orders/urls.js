const {
  createPreorderHandler,
  paymentSuccessHandler,
  paymentFailHandler,
  paymentCompleteHandler,
  cancelOrderHandler
} = require("./views");

function attach(app, deps) {
  const handler = createPreorderHandler(deps);
  app.post("/orders/create-preorder/", handler);
  app.post("/orders/create-preorder", handler);
  app.post("/api/orders/create-preorder/", handler);
  app.post("/api/orders/create-preorder", handler);

  const success = paymentSuccessHandler();
  app.get("/orders/payment/success/", success);
  app.get("/orders/payment/success", success);

  const fail = paymentFailHandler(deps.root);
  app.get("/orders/payment/fail/", fail);
  app.get("/orders/payment/fail", fail);

  const complete = paymentCompleteHandler(deps.root);
  app.get("/orders/complete/:orderId/", complete);
  app.get("/orders/complete/:orderId", complete);

  const cancel = cancelOrderHandler();
  const guard = deps.requireUser;
  app.post("/api/orders/:id/cancel", guard, cancel);
  app.post("/orders/:id/cancel/", guard, cancel);
  app.post("/orders/:id/cancel", guard, cancel);
}

module.exports = { attach };
