-- =============================================================
-- MIGRAÇÃO 002 — Correção de roles e RLS
-- Execute no Supabase SQL Editor
-- =============================================================

-- -----------------------------------------------
-- 1. Migrar roles legados que possam existir
-- -----------------------------------------------
UPDATE public.profiles SET role = 'coordenacao'  WHERE role = 'admin';
UPDATE public.profiles SET role = 'empresa_rh'   WHERE role = 'empresa';
UPDATE public.profiles SET role = 'coordenacao'  WHERE role = 'coordenacao_admin';
-- Garante que roles inválidos caiam em 'colaborador' como fallback
UPDATE public.profiles
  SET role = 'colaborador'
  WHERE role NOT IN ('master_admin','coordenacao','empresa_rh','psicologo','colaborador');

-- -----------------------------------------------
-- 2. Recriar get_my_role() mais robusta
--    Retorna null em vez de lançar exceção se não achar
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------
-- 3. Garantir que todo usuário autenticado existente
--    tenha um profile — cria os que estiverem faltando
-- -----------------------------------------------
INSERT INTO public.profiles (id, email, display_name, role, status)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'user_type', u.raw_user_meta_data->>'role', 'colaborador'),
  'ativo'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------
-- 4. Corrigir profiles com role inválido após insert
-- -----------------------------------------------
UPDATE public.profiles
  SET role = 'colaborador'
  WHERE role NOT IN ('master_admin','coordenacao','empresa_rh','psicologo','colaborador');

-- -----------------------------------------------
-- 5. Recriar políticas RLS de forma mais robusta
--    (usando auth.role() como fallback quando get_my_role() é null)
-- -----------------------------------------------

-- PSYCHOLOGISTS
DROP POLICY IF EXISTS "psychologists_insert_admin" ON public.psychologists;
DROP POLICY IF EXISTS "psychologists_update_admin" ON public.psychologists;
DROP POLICY IF EXISTS "psychologists_delete_master" ON public.psychologists;

CREATE POLICY "psychologists_insert_admin"
  ON public.psychologists FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "psychologists_update_admin"
  ON public.psychologists FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "psychologists_delete_master"
  ON public.psychologists FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

-- EMPLOYEES
DROP POLICY IF EXISTS "employees_insert_admin" ON public.employees;
DROP POLICY IF EXISTS "employees_update_admin" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_master_coord" ON public.employees;

CREATE POLICY "employees_insert_admin"
  ON public.employees FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao', 'empresa_rh')
  );

CREATE POLICY "employees_update_admin"
  ON public.employees FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao', 'empresa_rh')
  );

CREATE POLICY "employees_delete_master_coord"
  ON public.employees FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

-- COMPANIES
DROP POLICY IF EXISTS "companies_insert_admin" ON public.companies;
DROP POLICY IF EXISTS "companies_update_admin" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_master" ON public.companies;

CREATE POLICY "companies_insert_admin"
  ON public.companies FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "companies_update_admin"
  ON public.companies FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "companies_delete_master"
  ON public.companies FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() = 'master_admin'
  );

-- SETTINGS
DROP POLICY IF EXISTS "settings_select_admins" ON public.settings;
DROP POLICY IF EXISTS "settings_upsert_admins" ON public.settings;
DROP POLICY IF EXISTS "settings_update_admins" ON public.settings;

CREATE POLICY "settings_select_admins"
  ON public.settings FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "settings_upsert_admins"
  ON public.settings FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "settings_update_admins"
  ON public.settings FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_my_role() IN ('master_admin', 'coordenacao')
  );

-- -----------------------------------------------
-- 6. VERIFICAÇÃO FINAL
-- -----------------------------------------------
DO $$
DECLARE
  cnt_invalid integer;
BEGIN
  SELECT COUNT(*) INTO cnt_invalid
  FROM public.profiles
  WHERE role NOT IN ('master_admin','coordenacao','empresa_rh','psicologo','colaborador');

  IF cnt_invalid > 0 THEN
    RAISE WARNING '⚠️  Ainda existem % profiles com role inválido!', cnt_invalid;
  ELSE
    RAISE NOTICE '✅ Migração 002 concluída. Todos os roles estão válidos.';
  END IF;
END;
$$;
