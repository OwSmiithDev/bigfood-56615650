-- Add stock fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT NULL;

-- Create notifications table for companies and customers
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'order', 'stock', 'plan', 'status_change'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for orders (for customer updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Function to auto-disable product when stock reaches 0
CREATE OR REPLACE FUNCTION public.check_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If stock reaches 0, disable the product
  IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity <= 0 THEN
    NEW.available := false;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for stock check
DROP TRIGGER IF EXISTS check_product_stock_trigger ON public.products;
CREATE TRIGGER check_product_stock_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_product_stock();

-- Function to create notification when stock is low or depleted
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  company_owner_id UUID;
BEGIN
  -- Get company owner
  SELECT user_id INTO company_owner_id FROM public.companies WHERE id = NEW.company_id;
  
  IF company_owner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if stock is depleted (0 or less)
  IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity <= 0 
     AND (OLD.stock_quantity IS NULL OR OLD.stock_quantity > 0) THEN
    INSERT INTO public.notifications (user_id, company_id, type, title, message, data)
    VALUES (
      company_owner_id,
      NEW.company_id,
      'stock',
      'Estoque Esgotado',
      'O produto "' || NEW.name || '" está sem estoque e foi desativado automaticamente.',
      jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'stock_level', 'depleted')
    );
  -- Check if stock reached minimum level
  ELSIF NEW.stock_quantity IS NOT NULL AND NEW.min_stock IS NOT NULL 
        AND NEW.stock_quantity <= NEW.min_stock AND NEW.stock_quantity > 0
        AND (OLD.stock_quantity IS NULL OR OLD.stock_quantity > NEW.min_stock) THEN
    INSERT INTO public.notifications (user_id, company_id, type, title, message, data)
    VALUES (
      company_owner_id,
      NEW.company_id,
      'stock',
      'Estoque Baixo',
      'O produto "' || NEW.name || '" atingiu o estoque mínimo (' || NEW.stock_quantity || ' unidades).',
      jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'stock_level', 'low', 'current_stock', NEW.stock_quantity, 'min_stock', NEW.min_stock)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for low stock notification
DROP TRIGGER IF EXISTS notify_low_stock_trigger ON public.products;
CREATE TRIGGER notify_low_stock_trigger
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_low_stock();

-- Function to create notification for new orders
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  company_owner_id UUID;
BEGIN
  -- Get company owner
  SELECT user_id INTO company_owner_id FROM public.companies WHERE id = NEW.company_id;
  
  IF company_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, company_id, type, title, message, data)
    VALUES (
      company_owner_id,
      NEW.company_id,
      'order',
      'Novo Pedido!',
      'Você recebeu um novo pedido no valor de R$ ' || ROUND(NEW.total::numeric, 2),
      jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new order notification
DROP TRIGGER IF EXISTS notify_new_order_trigger ON public.orders;
CREATE TRIGGER notify_new_order_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();

-- Function to notify customer when order status changes
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  status_label TEXT;
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
    -- Get status label
    status_label := CASE NEW.status
      WHEN 'pending' THEN 'Pendente'
      WHEN 'confirmed' THEN 'Confirmado'
      WHEN 'preparing' THEN 'Em Preparação'
      WHEN 'ready' THEN 'Pronto para Retirada'
      WHEN 'out_for_delivery' THEN 'Saiu para Entrega'
      WHEN 'delivered' THEN 'Entregue'
      WHEN 'cancelled' THEN 'Cancelado'
      ELSE NEW.status
    END;
    
    INSERT INTO public.notifications (user_id, company_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      NEW.company_id,
      'status_change',
      'Atualização do Pedido',
      'Seu pedido foi atualizado para: ' || status_label,
      jsonb_build_object('order_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status, 'status_label', status_label)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status change
DROP TRIGGER IF EXISTS notify_order_status_change_trigger ON public.orders;
CREATE TRIGGER notify_order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();