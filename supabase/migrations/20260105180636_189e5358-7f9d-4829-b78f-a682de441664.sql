-- Add 'expired' to subscription_status enum if not exists
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'expired';

-- Create a function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION public.check_subscription_expiration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If subscription has expired, update status
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at < now() AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to check expiration on update
DROP TRIGGER IF EXISTS check_subscription_expiration_trigger ON public.subscriptions;
CREATE TRIGGER check_subscription_expiration_trigger
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscription_expiration();

-- Update the is_company_active function to also check for expired status
CREATE OR REPLACE FUNCTION public.is_company_active(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE company_id = company_uuid
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;