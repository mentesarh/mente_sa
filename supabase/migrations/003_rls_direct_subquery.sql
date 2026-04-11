-- =============================================================
-- MIGRAÇÃO 003 — RLS com subquery direta (sem get_my_role)
-- Mais confiável: elimina dependência da função auxiliar
-- Execute no Supabase SQL Editor
-- =============================================================

-- -----------------------------------------------
-- PSYCHOLOGISTS
-- -----------------------------------------------
DROP POLICY IF EXISTS "psychologists_insert_admin"  ON public.psychologists;
DROP POLICY IF EXISTS "psychologists_update_admin"  ON public.psychologists;
DROP POLICY IF EXISTS "psychologists_delete_master" ON public.psychologists;

CREATE POLICY "psychologists_insert_admin"
  ON public.psychologists FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "psychologists_update_admin"
  ON public.psychologists FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "psychologists_delete_master"
  ON public.psychologists FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

-- -----------------------------------------------
-- EMPLOYEES
-- -----------------------------------------------
DROP POLICY IF EXISTS "employees_insert_admin"        ON public.employees;
DROP POLICY IF EXISTS "employees_update_admin"        ON public.employees;
DROP POLICY IF EXISTS "employees_delete_master_coord" ON public.employees;

CREATE POLICY "employees_insert_admin"
  ON public.employees FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao', 'empresa_rh')
  );

CREATE POLICY "employees_update_admin"
  ON public.employees FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao', 'empresa_rh')
  );

CREATE POLICY "employees_delete_master_coord"
  ON public.employees FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

-- -----------------------------------------------
-- COMPANIES
-- -----------------------------------------------
DROP POLICY IF EXISTS "companies_insert_admin"  ON public.companies;
DROP POLICY IF EXISTS "companies_update_admin"  ON public.companies;
DROP POLICY IF EXISTS "companies_delete_master" ON public.companies;

CREATE POLICY "companies_insert_admin"
  ON public.companies FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "companies_update_admin"
  ON public.companies FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "companies_delete_master"
  ON public.companies FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    = 'master_admin'
  );

-- -----------------------------------------------
-- SESSIONS
-- -----------------------------------------------
DROP POLICY IF EXISTS "sessions_insert_auth"   ON public.sessions;
DROP POLICY IF EXISTS "sessions_update_auth"   ON public.sessions;
DROP POLICY IF EXISTS "sessions_delete_master" ON public.sessions;

CREATE POLICY "sessions_insert_auth"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "sessions_update_auth"
  ON public.sessions FOR UPDATE
  USING (
    psychologist_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
       IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "sessions_delete_master"
  ON public.sessions FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

-- -----------------------------------------------
-- SETTINGS
-- -----------------------------------------------
DROP POLICY IF EXISTS "settings_select_admins"  ON public.settings;
DROP POLICY IF EXISTS "settings_upsert_admins"  ON public.settings;
DROP POLICY IF EXISTS "settings_update_admins"  ON public.settings;

CREATE POLICY "settings_select_admins"
  ON public.settings FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "settings_upsert_admins"
  ON public.settings FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

CREATE POLICY "settings_update_admins"
  ON public.settings FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    IN ('master_admin', 'coordenacao')
  );

-- -----------------------------------------------
-- PROFILES — garantir que admin pode ver tudo
-- -----------------------------------------------
DROP POLICY IF EXISTS "profiles_select_admins" ON public.profiles;

CREATE POLICY "profiles_select_admins"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
       IN ('master_admin', 'coordenacao')
  );

-- -----------------------------------------------
-- VERIFICAÇÃO FINAL
-- -----------------------------------------------
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
