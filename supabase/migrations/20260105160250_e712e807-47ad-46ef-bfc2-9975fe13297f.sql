-- Inserir planos Free e Premium
INSERT INTO public.plans (id, name, price, max_products, features)
VALUES 
  ('free', 'Plano Free', 0, 5, '["Até 5 produtos", "Suporte por email"]'::jsonb),
  ('premium', 'Plano Premium', 50, 10, '["Até 10 produtos", "Suporte prioritário", "Destaque no app"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_products = EXCLUDED.max_products,
  features = EXCLUDED.features;