-- ============================================
-- ⚠️ IMPORTANTE: LEIA ANTES DE EXECUTAR
-- ============================================
-- Este arquivo SQL NÃO cria usuários diretamente.
-- O Supabase não permite criar usuários via SQL simples.
--
-- ✅ USE UMA DAS OPÇÕES ABAIXO:
-- ============================================

-- ============================================
-- OPÇÃO 1: SCRIPT NODE.JS (RECOMENDADO) ✅
-- ============================================
-- Execute no TERMINAL do seu computador:
--
--   npm run create-admin
--
-- Este script já foi testado e funciona perfeitamente!
-- ============================================

-- ============================================
-- OPÇÃO 2: PAINEL DO SUPABASE (MANUAL) ✅
-- ============================================
-- 1. Acesse: https://app.supabase.com/project/xomxdvouptsivduzlqyn/auth/users
-- 2. Clique em "Add User" > "Create New User"
-- 3. Preencha:
--    - Email: mentesa.rh@gmail.com
--    - Password: ***REMOVED***
--    - Auto Confirm User: ✅ (marque esta opção)
-- 4. Em "User Metadata" (Raw User Meta Data), adicione:
--    {
--      "user_type": "admin"
--    }
-- 5. Clique em "Create User"
-- ============================================

-- ============================================
-- VERIFICAÇÃO: Ver se usuário já existe
-- ============================================
-- Execute esta query para verificar se o usuário foi criado:

SELECT 
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'mentesa.rh@gmail.com';

-- Se retornar uma linha, o usuário existe!
-- ============================================

-- ============================================
-- ⚠️ NÃO TENTE EXECUTAR CÓDIGO JAVASCRIPT AQUI
-- ============================================
-- O SQL Editor do Supabase só executa SQL (PostgreSQL).
-- Código JavaScript/Node.js deve ser executado no terminal:
--   npm run create-admin
-- ============================================

