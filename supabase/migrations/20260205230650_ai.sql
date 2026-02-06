-- Alteração para impor ON DELETE SET NULL na FK orders.coupon_id
ALTER TABLE orders DROP CONSTRAINT orders_coupon_id_fkey;
ALTER TABLE orders
ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
