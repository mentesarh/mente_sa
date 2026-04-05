-- ============================================
-- Atualizar Metadata do Usuário Admin
-- ============================================
-- Execute este script para garantir que o admin
-- tenha user_type no metadata (necessário para RLS)
-- ============================================

-- Atualizar raw_user_meta_data do usuário admin
UPDATE auth.users
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_type', 'admin'),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_type', 'admin')
WHERE email = 'mentesa.rh@gmail.com';

-- Verificar se foi atualizado
SELECT 
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type_meta,
  raw_app_meta_data->>'user_type' as user_type_app
FROM auth.users
WHERE email = 'mentesa.rh@gmail.com';

-- ============================================
-- Se você ver 'admin' nos dois campos acima,
-- está funcionando! ✅
-- ============================================


