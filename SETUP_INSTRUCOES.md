# 🚨 IMPORTANTE: Configuração do Banco de Dados

## ⚠️ Erro 500 ao Fazer Login?

Se você está vendo erros 500 no console ao tentar fazer login, significa que a tabela `profiles` ainda não foi criada no Supabase.

## ✅ Solução Rápida

### Passo 1: Acesse o SQL Editor do Supabase

1. Vá para: https://app.supabase.com/project/xomxdvouptsivduzlqyn/sql/new
2. Ou: Dashboard → SQL Editor → New Query

### Passo 2: Execute o SQL

1. Abra o arquivo `supabase/profiles_setup.sql` no seu editor
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **"Run"** (ou pressione Ctrl+Enter)

### Passo 3: Verificar se Funcionou

Execute esta query no SQL Editor para verificar:

```sql
SELECT * FROM public.profiles LIMIT 5;
```

Se retornar uma tabela (mesmo que vazia), está funcionando! ✅

## 📋 O que o SQL faz?

1. **Cria a tabela `profiles`** com os campos:
   - `id` (referência ao auth.users)
   - `role` (admin, empresa, psicologo, colaborador)
   - `display_name`
   - `company_id` (opcional)
   - `created_at`

2. **Cria um trigger** que automaticamente cria um profile quando um usuário é criado no Supabase Auth

3. **Configura Row Level Security (RLS)**:
   - Usuários podem ver apenas seu próprio perfil
   - Admins podem ver todos os perfis

4. **Cria índices** para melhor performance

## 🔧 Criar Profile Manualmente para Usuário Existente

Se você já tem um usuário criado (ex: `mentesa.rh@gmail.com`) mas não tem profile:

```sql
-- Substitua o ID e role conforme necessário
INSERT INTO public.profiles (id, role, display_name)
VALUES (
  'e00dbf72-273a-4d45-a6c7-03eae54f41a0', -- ID do usuário (pegue em auth.users)
  'admin', -- role: admin, empresa, psicologo ou colaborador
  'Admin Mente Sã' -- nome de exibição
)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
```

Para encontrar o ID do usuário:

```sql
SELECT id, email FROM auth.users WHERE email = 'mentesa.rh@gmail.com';
```

## 🎯 Após Executar o SQL

1. **Recarregue a página** do login
2. Tente fazer login novamente
3. Os erros 500 devem desaparecer
4. O login deve funcionar normalmente

## ❓ Ainda com Problemas?

- Verifique se você está no projeto correto do Supabase (`xomxdvouptsivduzlqyn`)
- Verifique se as variáveis de ambiente estão corretas no `.env`
- Verifique o console do navegador para mensagens mais detalhadas
- Certifique-se de que o usuário existe em `auth.users`

---

**Arquivo SQL**: `supabase/profiles_setup.sql`


