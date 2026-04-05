-- ============================================
-- CORREÇÃO COMPLETA: Recursão Infinita + Metadata
-- ============================================
-- Execute este script para corrigir TUDO de uma vez
-- ============================================

-- PASSO 1: Remover política problemática (causa recursão)
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- PASSO 2: Criar nova política SEM recursão
-- Usa auth.users.raw_user_meta_data em vez de consultar profiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS(
      SELECT 1
      FROM auth.users u
      WHERE u.id = auth.uid() 
        AND (
          u.raw_user_meta_data->>'user_type' = 'admin'
          OR u.raw_app_meta_data->>'user_type' = 'admin'
        )
    )
  );

-- PASSO 3: Atualizar metadata do usuário admin
-- Garante que o user_type está no metadata (necessário para RLS funcionar)
UPDATE auth.users
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_type', 'admin'),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_type', 'admin')
WHERE email = 'mentesa.rh@gmail.com';

-- PASSO 4: Verificar se tudo está OK
SELECT 
  '✅ Políticas RLS:' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'profiles';

SELECT 
  '✅ Metadata do Admin:' as status,
  u.email,
  u.raw_user_meta_data->>'user_type' as user_type_meta,
  u.raw_app_meta_data->>'user_type' as user_type_app,
  p.role as profile_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'mentesa.rh@gmail.com';

-- ============================================
-- Se você ver:
-- - 2 políticas (Users can view own profile + Admin can view all profiles)
-- - user_type_meta = 'admin' e profile_role = 'admin'
-- Então está tudo funcionando! ✅
-- ============================================


