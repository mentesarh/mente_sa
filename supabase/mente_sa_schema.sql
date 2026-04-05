-- ============================================
-- SCHEMA COMPLETO: Mente Sã Connect
-- ============================================
-- Execute no SQL Editor do Supabase após criar a tabela profiles
-- Este script cria todas as tabelas do sistema com RLS
-- ============================================

-- 1) TABELA: companies (empresas)
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text UNIQUE,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) TABELA: psychologists (psicólogos)
CREATE TABLE IF NOT EXISTS public.psychologists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  crp text,
  specialties text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) TABELA: employees (colaboradores)
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  cpf text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) TABELA: sessions (sessões/consultas)
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  psychologist_id uuid REFERENCES public.psychologists(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_min int DEFAULT 50,
  status text CHECK (status IN ('scheduled','confirmed','done','cancelled','no_show')) DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5) TABELA: profile_links (vínculo entre auth.users e entidades)
CREATE TABLE IF NOT EXISTS public.profile_links (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  psychologist_id uuid REFERENCES public.psychologists(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 6) TABELA: settings (configurações do sistema)
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON public.companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON public.companies(is_active);

CREATE INDEX IF NOT EXISTS idx_psychologists_email ON public.psychologists(email);
CREATE INDEX IF NOT EXISTS idx_psychologists_is_active ON public.psychologists(is_active);

CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON public.employees(cpf);

CREATE INDEX IF NOT EXISTS idx_sessions_company_id ON public.sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_employee_id ON public.sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_psychologist_id ON public.sessions(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON public.sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);

CREATE INDEX IF NOT EXISTS idx_profile_links_company_id ON public.profile_links(company_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_psychologist_id ON public.profile_links(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_employee_id ON public.profile_links(employee_id);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_psychologists_updated_at ON public.psychologists;
CREATE TRIGGER update_psychologists_updated_at BEFORE UPDATE ON public.psychologists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: companies
-- ============================================

-- Admin pode tudo
CREATE POLICY "Admin full access to companies"
  ON public.companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Empresa pode ver apenas sua própria company
CREATE POLICY "Company can view own company"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profile_links pl ON pl.user_id = p.id
      WHERE p.id = auth.uid() 
        AND p.role = 'empresa'
        AND pl.company_id = companies.id
    )
  );

-- ============================================
-- POLICIES: psychologists
-- ============================================

-- Admin pode tudo
CREATE POLICY "Admin full access to psychologists"
  ON public.psychologists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Psicólogo pode ver seu próprio registro
CREATE POLICY "Psychologist can view own record"
  ON public.psychologists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_links
      WHERE profile_links.user_id = auth.uid()
        AND profile_links.psychologist_id = psychologists.id
    )
  );

-- ============================================
-- POLICIES: employees
-- ============================================

-- Admin pode tudo
CREATE POLICY "Admin full access to employees"
  ON public.employees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Empresa pode ver/editar seus colaboradores
CREATE POLICY "Company can manage own employees"
  ON public.employees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profile_links pl ON pl.user_id = p.id
      WHERE p.id = auth.uid() 
        AND p.role = 'empresa'
        AND pl.company_id = employees.company_id
    )
  );

-- Colaborador pode ver seu próprio registro
CREATE POLICY "Employee can view own record"
  ON public.employees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_links
      WHERE profile_links.user_id = auth.uid()
        AND profile_links.employee_id = employees.id
    )
  );

-- ============================================
-- POLICIES: sessions
-- ============================================

-- Admin pode tudo
CREATE POLICY "Admin full access to sessions"
  ON public.sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Empresa pode ver/editar sessões de seus colaboradores
CREATE POLICY "Company can manage own sessions"
  ON public.sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profile_links pl ON pl.user_id = p.id
      WHERE p.id = auth.uid() 
        AND p.role = 'empresa'
        AND pl.company_id = sessions.company_id
    )
  );

-- Psicólogo pode ver/editar suas sessões
CREATE POLICY "Psychologist can manage own sessions"
  ON public.sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_links
      WHERE profile_links.user_id = auth.uid()
        AND profile_links.psychologist_id = sessions.psychologist_id
    )
  );

-- Colaborador pode ver suas próprias sessões
CREATE POLICY "Employee can view own sessions"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_links
      WHERE profile_links.user_id = auth.uid()
        AND profile_links.employee_id = sessions.employee_id
    )
  );

-- ============================================
-- POLICIES: profile_links
-- ============================================

-- Admin pode tudo
CREATE POLICY "Admin full access to profile_links"
  ON public.profile_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Usuário pode ver seu próprio link
CREATE POLICY "User can view own profile_link"
  ON public.profile_links FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- POLICIES: settings
-- ============================================

-- Admin pode tudo
CREATE POLICY "Admin full access to settings"
  ON public.settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Todos podem ler configurações públicas
CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT
  USING (true);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir configurações padrão
INSERT INTO public.settings (key, value, description) VALUES
  ('system_name', '"Mente Sã Connect"', 'Nome do sistema'),
  ('support_email', '"SEU_EMAIL_ADMIN@exemplo.com"', 'E-mail de suporte'),
  ('session_default_duration', '50', 'Duração padrão das sessões em minutos')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT 'Schema criado com sucesso!' as status;
SELECT tablename, policyname FROM pg_policies WHERE tablename IN 
  ('companies', 'psychologists', 'employees', 'sessions', 'profile_links', 'settings')
ORDER BY tablename, policyname;

