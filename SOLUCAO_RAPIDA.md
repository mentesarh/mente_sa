# 🚨 SOLUÇÃO RÁPIDA - Erro 500 no Login

## ⚠️ Problema
Você está vendo erros 500 no console porque a tabela `profiles` não existe no Supabase.

## ✅ Solução em 3 Passos

### Passo 1: Abrir SQL Editor do Supabase
1. Acesse: **https://app.supabase.com/project/xomxdvouptsivduzlqyn/sql/new**
2. Ou: Dashboard → **SQL Editor** → **New Query**

### Passo 2: Copiar e Colar o SQL
1. Abra o arquivo: **`supabase/VERIFICAR_E_CRIAR.sql`**
2. **Selecione TODO o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)
4. **Cole no SQL Editor** do Supabase (Ctrl+V)

### Passo 3: Executar
1. Clique no botão **"Run"** (ou pressione **Ctrl+Enter**)
2. Aguarde a execução
3. Você deve ver mensagens de sucesso no final

## ✅ Verificar se Funcionou

Execute esta query no SQL Editor:

```sql
SELECT p.*, u.email 
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'mentesa.rh@gmail.com';
```

**Se retornar uma linha com `role = 'admin'`, está funcionando! ✅**

## 🔄 Depois de Executar

1. **Recarregue a página** do login (F5)
2. **Tente fazer login** novamente
3. Os erros 500 devem **desaparecer**
4. O login deve **funcionar normalmente**

## ❓ Ainda com Problemas?

### Verificar se a tabela existe:
```sql
SELECT * FROM public.profiles LIMIT 1;
```

Se der erro "does not exist", execute o SQL novamente.

### Verificar se o usuário existe:
```sql
SELECT id, email FROM auth.users WHERE email = 'mentesa.rh@gmail.com';
```

### Criar profile manualmente (se o usuário existe mas não tem profile):
```sql
-- Primeiro, pegue o ID do usuário:
SELECT id FROM auth.users WHERE email = 'mentesa.rh@gmail.com';

-- Depois, crie o profile (substitua 'SEU_ID_AQUI' pelo ID acima):
INSERT INTO public.profiles (id, role, display_name)
VALUES ('SEU_ID_AQUI', 'admin', 'Administrador')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

**Arquivo SQL**: `supabase/VERIFICAR_E_CRIAR.sql`  
**Este script cria TUDO automaticamente!**


