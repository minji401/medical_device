-- Toss 가주문용 주문/주문상품 스냅샷. 기존 orders · users 테이블은 유지합니다.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_basic TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_detail TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_memo TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_key TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zipcode TEXT;

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  option_text TEXT NOT NULL DEFAULT '',
  subtotal_amount INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS option_text TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal_amount INTEGER;

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(number);
