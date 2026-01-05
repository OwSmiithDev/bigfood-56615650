-- Update existing plans with correct limits
UPDATE public.plans SET max_products = 5, features = '["Até 5 produtos", "Suporte por email", "Painel básico"]'::jsonb WHERE id = 'free';
UPDATE public.plans SET max_products = 10, features = '["Até 10 produtos", "Suporte prioritário", "Destaque no app", "Relatórios básicos"]'::jsonb WHERE id = 'premium';

-- Insert the new Professional plan
INSERT INTO public.plans (id, name, price, max_products, features)
VALUES (
  'professional', 
  'Plano Profissional', 
  99.90, 
  NULL, -- NULL means unlimited
  '["Produtos ilimitados", "Automação com n8n", "Prioridade na busca", "Relatórios avançados de vendas"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_products = EXCLUDED.max_products,
  features = EXCLUDED.features;