
-- Fix: Allow deleting coupons without breaking orders
-- Change orders.coupon_id FK from RESTRICT to SET NULL
ALTER TABLE public.orders DROP CONSTRAINT orders_coupon_id_fkey;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_coupon_id_fkey
  FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
  ON DELETE SET NULL;
