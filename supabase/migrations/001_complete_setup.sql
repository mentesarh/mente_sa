-- =============================================================
-- MENTE SÃ CONNECT — Migração Completa do Banco de Dados
-- Execute este arquivo no Supabase SQL Editor
-- =============================================================

-- -----------------------------------------------
-- EXTENSÕES
-- -----------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------
-- FUNÇÃO AUXILIAR: updated_at automático
-- (criada antes dos triggers que dependem dela)
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------
-- 1. TABELA: profiles
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  display_name    text,
  email           text,
  role            text NOT NULL DEFAULT 'colaborador'
                    CHECK (role IN ('master_admin','coordenacao','empresa_rh','psicologo','colaborador')),
  status          text NOT NULL DEFAULT 'ativo'
                    CHECK (status IN ('ativo','inativo')),
  company_id      uuid NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Migrar roles legadas (se existirem registros antigos)
DO $$
BEGIN
  UPDATE public.profiles SET role = 'coordenacao' WHERE role = 'admin';
  UPDATE public.profiles SET role = 'empresa_rh'  WHERE role = 'empresa';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Migração de roles ignorada: %', SQLERRM;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_updated_at_profiles ON public.profiles;
CREATE TRIGGER trg_set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------
-- 2. TABELA: companies
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL,
  cnpj          text UNIQUE,
  contact_name  text,
  contact_email text,
  contact_phone text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_set_updated_at_companies ON public.companies;
CREATE TRIGGER trg_set_updated_at_companies
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------
-- 3. TABELA: psychologists
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.psychologists (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  email       text UNIQUE,
  phone       text,
  crp         text,
  specialties text[],
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_set_updated_at_psychologists ON public.psychologists;
CREATE TRIGGER trg_set_updated_at_psychologists
  BEFORE UPDATE ON public.psychologists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------
-- 4. TABELA: employees
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  name        text NOT NULL,
  email       text,
  cpf         text,
  phone       text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_set_updated_at_employees ON public.employees;
CREATE TRIGGER trg_set_updated_at_employees
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------
-- 5. TABELA: sessions
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  employee_id      uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  psychologist_id  uuid REFERENCES public.psychologists(id) ON DELETE SET NULL,
  scheduled_at     timestamptz NOT NULL,
  duration_min     int NOT NULL DEFAULT 50,
  status           text NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','confirmed','done','cancelled','no_show')),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_set_updated_at_sessions ON public.sessions;
CREATE TRIGGER trg_set_updated_at_sessions
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------
-- 6. TABELA: settings
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         text UNIQUE NOT NULL,
  value       jsonb,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_set_updated_at_settings ON public.settings;
CREATE TRIGGER trg_set_updated_at_settings
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed de configurações padrão
INSERT INTO public.settings (key, value, description) VALUES
  ('system_name',              '"Mente Sã Connect"', 'Nome do sistema'),
  ('support_email',            '"mentesa.rh@gmail.com"', 'E-mail de suporte'),
  ('session_default_duration', '50', 'Duração padrão das sessões em minutos')
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------
-- TRIGGER: auto-criar profile ao criar usuário
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'colaborador')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------
-- FUNÇÃO: get_my_role() — evita recursão RLS
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings      ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas antes de recriar
DO $$
DECLARE
  pol record;
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['profiles','companies','psychologists','employees','sessions','settings']) LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END;
$$;

-- ---- POLICIES: profiles ----

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admins"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('master_admin', 'coordenacao'));

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_master"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'master_admin');

CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true); -- o trigger SECURITY DEFINER garante inserção segura

-- ---- POLICIES: companies ----

CREATE POLICY "companies_select_auth"
  ON public.companies FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "companies_insert_admin"
  ON public.companies FOR INSERT
  WITH CHECK (public.get_my_role() IN ('master_admin', 'coordenacao'));

CREATE POLICY "companies_update_admin"
  ON public.companies FOR UPDATE
  USING (public.get_my_role() IN ('master_admin', 'coordenacao'));

CREATE POLICY "companies_delete_master"
  ON public.companies FOR DELETE
  USING (public.get_my_role() = 'master_admin');

-- ---- POLICIES: psychologists ----

CREATE POLICY "psychologists_select_auth"
  ON public.psychologists FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "psychologists_insert_admin"
  ON public.psychologists FOR INSERT
  WITH CHECK (public.get_my_role() IN ('master_admin', 'coordenacao'));

CREATE POLICY "psychologists_update_admin"
  ON public.psychologists FOR UPDATE
  USING (public.get_my_role() IN ('master_admin', 'coordenacao'));

CREATE POLICY "psychologists_delete_master"
  ON public.psychologists FOR DELETE
  USING (public.get_my_role() = 'master_admin');

-- ---- POLICIES: employees ----

CREATE POLICY "employees_select_auth"
  ON public.employees FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "employees_insert_admin"
  ON public.employees FOR INSERT
  WITH CHECK (public.get_my_role() IN ('master_admin', 'coordenacao', 'empresa_rh'));

CREATE POLICY "employees_update_admin"
  ON public.employees FOR UPDATE
  USING (public.get_my_role() IN ('master_admin', 'coordenacao', 'empresa_rh'));

CREATE POLICY "employees_delete_master_coord"
  ON public.employees FOR DELETE
  USING (public.get_my_role() IN ('master_admin', 'coordenacao'));

-- ---- POLICIES: sessions ----

-- Colaborador vê suas próprias sessões (employee_id = auth.uid())
CREATE POLICY "sessions_select_employee"
  ON public.sessions FOR SELECT
  USING (employee_id = auth.uid());

-- Psicólogo vê suas próprias sessões (psychologist_id = auth.uid())
CREATE POLICY "sessions_select_psychologist"
  ON public.sessions FOR SELECT
  USING (psychologist_id = auth.uid());

-- Admin/coord/empresa_rh veem todas as sessões
CREATE POLICY "sessions_select_admins"
  ON public.sessions FOR SELECT
  USING (public.get_my_role() IN ('master_admin', 'coordenacao', 'empresa_rh'));

-- Qualquer autenticado pode criar sessão (RH, coordenação, colaborador)
CREATE POLICY "sessions_insert_auth"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Psicólogo, coordenação e master admin podem atualizar sessões
CREATE POLICY "sessions_update_auth"
  ON public.sessions FOR UPDATE
  USING (
    psychologist_id = auth.uid()
    OR public.get_my_role() IN ('master_admin', 'coordenacao')
  );

-- Apenas admin exclui sessões
CREATE POLICY "sessions_delete_master"
  ON public.sessions FOR DELETE
  USING (public.get_my_role() IN ('master_admin', 'coordenacao'));

-- ---- POLICIES: settings ----

CREATE POLICY "settings_select_admins"
  ON public.settings FOR SELECT
  USING (public.get_my_role() IN ('master_admin', 'coordenacao'));

CREATE POLICY "settings_upsert_admins"
  ON public.settings FOR INSERT
  WITH CHECK (public.get_my_role() IN ('master_admin', 'coordenacao'));

CREATE POLICY "settings_update_admins"
  ON public.settings FOR UPDATE
  USING (public.get_my_role() IN ('master_admin', 'coordenacao'));

-- -----------------------------------------------
-- ÍNDICES
-- -----------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company   ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_employee   ON public.sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_psych      ON public.sessions(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_company    ON public.sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date       ON public.sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status     ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_settings_key        ON public.settings(key);

-- -----------------------------------------------
-- GRANTS
-- -----------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE           ON public.profiles      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE   ON public.companies     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE   ON public.psychologists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE   ON public.employees     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE   ON public.sessions      TO authenticated;
GRANT SELECT, INSERT, UPDATE           ON public.settings      TO authenticated;

-- -----------------------------------------------
-- SEED: INSTRUÇÕES PARA MASTER ADMIN
-- -----------------------------------------------
-- 1. No Supabase Dashboard > Authentication > Users, crie um usuário:
--    E-mail: masteradmin@mentesa.com.br   (ou o desejado)
--    Senha: [SENHA_FORTE]
--
-- 2. Copie o UUID gerado e execute o SQL abaixo UMA VEZ:
--
-- INSERT INTO public.profiles (id, email, display_name, role, status)
-- VALUES (
--   '<UUID_DO_USUARIO>',
--   'masteradmin@mentesa.com.br',
--   'Master Admin',
--   'master_admin',
--   'ativo'
-- )
-- ON CONFLICT (id) DO UPDATE
--   SET role = 'master_admin', display_name = 'Master Admin', status = 'ativo';

-- -----------------------------------------------
-- VERIFICAÇÃO FINAL
-- -----------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '✅ Migração 001_complete_setup concluída!';
  RAISE NOTICE '   Tabelas: profiles, companies, psychologists, employees, sessions, settings';
  RAISE NOTICE '   RLS habilitada em todas as tabelas';
  RAISE NOTICE '   Triggers de updated_at configurados';
  RAISE NOTICE '   Trigger de auto-criação de profile configurado';
  RAISE NOTICE '   Função get_my_role() criada (evita recursão RLS)';
  RAISE NOTICE '   Próximo passo: crie o usuário Master Admin conforme instruções acima';
END;
$$;
