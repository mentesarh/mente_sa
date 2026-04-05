-- Script para criar profile do usuário admin existente
-- Execute APÓS criar a tabela profiles (profiles_setup.sql)
-- 
-- Este script cria o profile para o usuário mentesa.rh@gmail.com
-- que já foi criado anteriormente

-- 1) Encontrar o ID do usuário admin
-- Execute esta query primeiro para pegar o ID:
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'mentesa.rh@gmail.com';

-- 2) Criar o profile (substitua o ID pelo resultado da query acima)
-- Exemplo com o ID conhecido:
INSERT INTO public.profiles (id, role, display_name)
VALUES (
  'e00dbf72-273a-4d45-a6c7-03eae54f41a0', -- ID do usuário (substitua pelo ID real)
  'admin',
  'Administrador Mente Sã'
)
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name;

-- 3) Verificar se foi criado
SELECT 
  p.id,
  p.role,
  p.display_name,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'mentesa.rh@gmail.com';

-- Se você não souber o ID, use esta versão automática:
-- (mas só funciona se houver apenas um usuário com esse email)
INSERT INTO public.profiles (id, role, display_name)
SELECT 
  u.id,
  'admin',
  'Administrador Mente Sã'
FROM auth.users u
WHERE u.email = 'mentesa.rh@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name;


