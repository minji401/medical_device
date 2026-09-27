const { z } = require("zod");

const itemSchema = z.object({
  id: z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/),
  qty: z.coerce.number().int().min(1).max(20)
});

const prepareSchema = z.object({
  name: z.string().trim().min(2).max(40),
  phone: z.string().trim().min(10).max(20),
  address: z.string().trim().min(5).max(200),
  memo: z.string().trim().max(1000).optional().default(""),
  amount: z.coerce.number().int().nonnegative().optional(),
  items: z.array(itemSchema).min(1).max(30)
});

function readPrepare(body) {
  const parsed = prepareSchema.safeParse(body || {});
  if (!parsed.success) {
    return { error: "이름, 연락처, 주소, 상품을 확인해 주세요." };
  }
  return { data: parsed.data };
}

module.exports = { readPrepare };
