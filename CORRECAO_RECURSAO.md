# 🔧 Correção: Recursão Infinita na Política RLS

## ⚠️ Problema Identificado

Erro: `infinite recursion detected in policy for relation "profiles"`

**Causa:** A política RLS "Admin can view all profiles" estava consultando a própria tabela `profiles` dentro da política, criando um loop infinito.

## ✅ Solução

A política foi corrigida para usar `auth.users.raw_user_meta_data` em vez de consultar a tabela `profiles`.

### ⚡ Solução Rápida (Recomendado)

1. Abra o SQL Editor: https://app.supabase.com/project/xomxdvouptsivduzlqyn/sql/new
2. Execute o arquivo: **`supabase/CORRIGIR_TUDO.sql`**
3. Isso corrige TUDO de uma vez:
   - Remove a política problemática
   - Cria nova política sem recursão
   - Atualiza metadata do admin
   - Verifica se está funcionando

### Opção 2: Atualizar o Script Principal

O arquivo `supabase/VERIFICAR_E_CRIAR.sql` já foi atualizado com a correção.

Se você já executou o script anterior, execute apenas a parte de correção:

```sql
-- Remover política problemática
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Criar nova política sem recursão
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
```

## 🎯 Como Funciona Agora

A nova política:
- ✅ Verifica o `user_type` no `auth.users.raw_user_meta_data`
- ✅ Não consulta a tabela `profiles` (evita recursão)
- ✅ Permite que admins vejam todos os profiles
- ✅ Mantém a segurança (RLS ainda ativo)

## 📝 Nota Importante

Para que a política funcione, o `user_type` deve estar em `raw_user_meta_data` quando o usuário é criado.

O script `create-admin-user.mjs` já faz isso automaticamente.

## ✅ Após Corrigir

1. Recarregue a página do login
2. Tente fazer login novamente
3. O erro de recursão deve desaparecer
4. O login deve funcionar normalmente

---

**Arquivo de Correção Rápida**: `supabase/CORRIGIR_TUDO.sql` ⭐ (Use este!)  
**Arquivo Alternativo**: `supabase/CORRIGIR_RLS.sql`

