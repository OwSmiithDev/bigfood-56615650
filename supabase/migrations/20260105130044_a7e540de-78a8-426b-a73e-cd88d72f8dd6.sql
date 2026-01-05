-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert profiles for existing users that don't have profiles
INSERT INTO public.profiles (id, name, email, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.email,
  u.created_at,
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Insert user roles for existing users that don't have any role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;