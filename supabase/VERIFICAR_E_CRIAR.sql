-- ============================================
-- SCRIPT COMPLETO: Verificar e Criar Tudo
-- ============================================
-- Execute este script NOVO no SQL Editor do Supabase
-- Ele verifica se tudo existe e cria o que falta
-- ============================================

-- PASSO 1: Criar tabela profiles (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','empresa','psicologo','colaborador')),
  display_name text,
  company_id uuid NULL,
  created_at timestamptz DEFAULT now()
);

-- PASSO 2: Criar função do trigger (se não existir)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'user_type', 'colaborador'),
    COALESCE(new.raw_user_meta_data->>'display_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- PASSO 3: Criar trigger (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();

-- PASSO 4: Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Criar políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política para admin: usa metadata do auth.users para evitar recursão
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
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

-- PASSO 6: Criar índices
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_company_idx ON public.profiles (company_id);

-- PASSO 7: Criar profile para usuário admin existente (mentesa.rh@gmail.com)
-- Este passo cria o profile se o usuário já existe mas não tem profile
INSERT INTO public.profiles (id, role, display_name)
SELECT 
  u.id,
  'admin',
  'Administrador Mente Sã'
FROM auth.users u
WHERE u.email = 'mentesa.rh@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name;

-- PASSO 8: Verificar resultado
SELECT 
  '✅ Tabela profiles criada!' as status,
  COUNT(*) as total_profiles
FROM public.profiles;

SELECT 
  '✅ Profile do admin:' as status,
  p.id,
  p.role,
  p.display_name,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'mentesa.rh@gmail.com';

-- ============================================
-- Se tudo estiver OK, você verá:
-- - Uma linha com total_profiles
-- - Uma linha com os dados do admin
-- ============================================

