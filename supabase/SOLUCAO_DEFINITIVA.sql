-- ============================================
-- SOLUÇÃO DEFINITIVA: Remover Política Problemática
-- ============================================
-- A política de admin está causando recursão infinita
-- Vamos removê-la por enquanto - cada usuário pode ver seu próprio profile
-- Isso é suficiente para o login funcionar
-- ============================================

-- PASSO 1: Remover TODAS as políticas de admin (causam recursão)
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- PASSO 2: Garantir que a política básica existe (usuário vê seu próprio profile)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- PASSO 3: Atualizar metadata do admin (garantir que está correto)
UPDATE auth.users
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_type', 'admin'),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_type', 'admin')
WHERE email = 'mentesa.rh@gmail.com';

-- PASSO 4: Verificar se o profile existe
SELECT 
  '✅ Profile do Admin:' as status,
  p.id,
  p.role,
  p.display_name,
  u.email,
  u.raw_user_meta_data->>'user_type' as metadata_type
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'mentesa.rh@gmail.com';

-- PASSO 5: Verificar políticas ativas
SELECT 
  '✅ Políticas RLS:' as status,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- RESULTADO ESPERADO:
-- - 1 política: "Users can view own profile"
-- - Profile do admin com role = 'admin'
-- - metadata_type = 'admin'
-- ============================================
-- 
-- NOTA: Removemos a política de admin por enquanto
-- para evitar recursão. Cada usuário pode ver apenas
-- seu próprio profile, o que é suficiente para login.
-- 
-- Se precisar que admin veja todos os profiles depois,
-- podemos criar uma função helper ou usar uma abordagem
-- diferente que não cause recursão.
-- ============================================


