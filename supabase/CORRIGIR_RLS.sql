-- ============================================
-- CORREÇÃO: Política RLS com Recursão Infinita
-- ============================================
-- Execute este script para corrigir o erro:
-- "infinite recursion detected in policy for relation 'profiles'"
-- ============================================

-- Remover a política problemática
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Criar nova política que usa app_metadata em vez de consultar profiles
-- Isso evita a recursão infinita
CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    -- Verifica se o usuário tem role 'admin' no metadata do auth.users
    -- Isso evita consultar a tabela profiles dentro da política
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

-- ============================================
-- ALTERNATIVA: Se preferir usar a tabela profiles,
-- podemos criar uma função que evita recursão
-- ============================================

-- Função helper para verificar se é admin (evita recursão)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM auth.users u
    WHERE u.id = user_id
      AND (
        u.raw_user_meta_data->>'user_type' = 'admin'
        OR u.raw_app_meta_data->>'user_type' = 'admin'
      )
  );
$$;

-- Política alternativa usando a função (mais segura)
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- Verificar se funcionou
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles';


