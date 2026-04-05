-- Script para criar usuário administrador no Supabase
-- Execute este script no SQL Editor do Supabase: https://app.supabase.com/project/xomxdvouptsivduzlqyn/sql/new

-- Criar usuário administrador
-- Nota: No Supabase, usuários são criados através da API de autenticação
-- Este script cria o usuário usando a função auth.users diretamente

-- Primeiro, vamos criar uma função helper para criar usuário com metadata
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_type TEXT DEFAULT 'admin'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  encrypted_password TEXT;
BEGIN
  -- Gerar UUID para o novo usuário
  new_user_id := gen_random_uuid();
  
  -- Criar o usuário na tabela auth.users
  -- Nota: A senha precisa ser hasheada usando crypt do pgcrypto
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('user_type', user_type),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new_user_id;
END;
$$;

-- Executar a função para criar o usuário administrador
SELECT create_admin_user(
  'mentesa.rh@gmail.com',
  '***REMOVED***',
  'admin'
);

-- Verificar se o usuário foi criado
SELECT 
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'mentesa.rh@gmail.com';

-- Limpar a função helper (opcional)
-- DROP FUNCTION IF EXISTS create_admin_user(TEXT, TEXT, TEXT);


