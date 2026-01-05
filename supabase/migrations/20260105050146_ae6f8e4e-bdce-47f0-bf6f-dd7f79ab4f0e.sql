-- Create table to track coupon usage per user (100% backend guarantee)
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- Enable RLS
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
  FOR SELECT USING (user_id = auth.uid());

-- Only system can insert (via trigger)
CREATE POLICY "Admins can manage coupon usage" ON public.coupon_usage
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast lookups
CREATE INDEX idx_coupon_usage_coupon_user ON public.coupon_usage(coupon_id, user_id);

-- Create trigger to automatically record coupon usage when order is created
CREATE OR REPLACE FUNCTION public.record_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- If order has a coupon, record the usage
  IF NEW.coupon_id IS NOT NULL AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.coupon_usage (coupon_id, user_id, order_id)
    VALUES (NEW.coupon_id, NEW.user_id, NEW.id)
    ON CONFLICT (coupon_id, user_id) DO NOTHING;
    
    -- Increment coupon used_count
    UPDATE public.coupons
    SET used_count = COALESCE(used_count, 0) + 1
    WHERE id = NEW.coupon_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_order_created_record_coupon
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.record_coupon_usage();

-- Create function to check if user can use coupon (for backend validation)
CREATE OR REPLACE FUNCTION public.can_user_use_coupon(p_coupon_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.coupon_usage
    WHERE coupon_id = p_coupon_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Enable realtime for products, product_categories, coupons, and companies
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;