# 👤 Como Criar o Usuário Administrador

## ⚠️ IMPORTANTE: Escolha o Método Correto

O **SQL Editor do Supabase** só executa código SQL (PostgreSQL).  
**NÃO** tente colar código JavaScript/Node.js no SQL Editor!

---

## ✅ MÉTODO 1: Script Node.js (Mais Fácil e Recomendado)

### Passo 1: Abra o Terminal
No VS Code ou PowerShell, navegue até a pasta do projeto:
```bash
cd "C:\Users\CGB\OneDrive\Área de Trabalho\mente_sa\mente-s-connect-main"
```

### Passo 2: Execute o Script
```bash
npm run create-admin
```

### Resultado Esperado:
```
✅ Usuário administrador criado com sucesso!
   Email: mentesa.rh@gmail.com
   Tipo: admin
```

**Pronto!** O usuário já está criado e pronto para uso.

---

## ✅ MÉTODO 2: Painel do Supabase (Manual)

### Passo 1: Acesse o Painel
https://app.supabase.com/project/xomxdvouptsivduzlqyn/auth/users

### Passo 2: Criar Usuário
1. Clique em **"Add User"** > **"Create New User"**
2. Preencha:
   - **Email**: `mentesa.rh@gmail.com`
   - **Password**: `***REMOVED***`
   - **Auto Confirm User**: ✅ (marque esta opção)
3. Em **"Raw User Meta Data"**, adicione:
   ```json
   {
     "user_type": "admin"
   }
   ```
4. Clique em **"Create User"**

---

## ✅ MÉTODO 3: Verificar se Usuário Existe (SQL)

No **SQL Editor do Supabase**, execute:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'mentesa.rh@gmail.com';
```

Se retornar uma linha, o usuário existe! ✅

---

## 🚫 O QUE NÃO FAZER

❌ **NÃO** cole código JavaScript no SQL Editor  
❌ **NÃO** tente executar `import` ou código Node.js no SQL  
❌ **NÃO** use o SQL Editor para criar usuários diretamente

---

## ✅ O QUE FAZER

✅ Use `npm run create-admin` no terminal  
✅ Ou crie manualmente no painel do Supabase  
✅ Use SQL apenas para **verificar** se o usuário existe

---

## 🎯 Testar o Login

Após criar o usuário:

1. Acesse: http://localhost:8080/login
2. Selecione **"Coordenação"** (tipo admin)
3. Faça login:
   - Email: `mentesa.rh@gmail.com`
   - Senha: `***REMOVED***`

---

## 📁 Arquivos Relacionados

- **Script Node.js**: `scripts/create-admin-user.mjs`
- **SQL de verificação**: `supabase/create-admin-user.sql`
- **Documentação completa**: `README_CRIAR_ADMIN.md`

---

## ❓ Problemas?

### Erro: "Service Role Key incorreta"
- O script já tem a chave configurada
- Se não funcionar, verifique se o projeto Supabase está ativo

### Erro: "Email já existe"
- O script detecta e atualiza o usuário existente
- Execute novamente: `npm run create-admin`

### Não consigo fazer login
- Verifique se o email foi confirmado (Auto Confirm User)
- Verifique se o tipo está como "admin" no metadata
- Verifique as variáveis de ambiente no `.env`

---

**💡 Dica**: O método mais rápido é usar `npm run create-admin` no terminal!


