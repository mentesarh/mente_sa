# Deploy da Edge Function - Guia Rápido

## ✅ Status Atual
- [x] SQL Schema executado com sucesso
- [ ] Edge Function `create-user` precisa ser criada

## 🚀 Opção 1: Criar Manualmente via Dashboard (RECOMENDADO)

### Passo 1: Acessar Edge Functions
1. Acesse: https://app.supabase.com/project/xomxdvouptsivduzlqyn/functions
2. Clique em **"Create a new function"** ou **"New Function"**

### Passo 2: Configurar a Function
- **Function Name:** `create-user`
- **Template:** Escolha "Blank" ou qualquer um (vamos substituir o código)

### Passo 3: Copiar o Código
1. Abra o arquivo: `supabase/functions/create-user/index.ts`
2. Copie TODO o conteúdo
3. Cole no editor da Edge Function no Dashboard
4. Salve/Deploy

### Passo 4: Configurar Variáveis de Ambiente
No Dashboard da Edge Function, adicione as Secrets (já devem estar disponíveis automaticamente):
- `SUPABASE_URL` - Já configurado automaticamente
- `SUPABASE_SERVICE_ROLE_KEY` - Já configurado automaticamente

**Nota:** O Supabase já injeta essas variáveis automaticamente, então você não precisa configurar manualmente.

## 🚀 Opção 2: Usar npx (Sem instalar globalmente)

Se preferir usar o CLI via npx:

```bash
# Login
npx supabase login

# Linkar ao projeto
npx supabase link --project-ref xomxdvouptsivduzlqyn

# Deploy
npx supabase functions deploy create-user
```

## ✅ Como Testar

Após criar a Edge Function:

1. **Teste no Frontend:**
   - Faça login como admin
   - Vá em `/admin/empresas/novo`
   - Crie uma empresa
   - Tente criar um usuário RH
   - Se funcionar, a Edge Function está OK!

2. **Teste Direto (Opcional):**
   - No Dashboard da Edge Function, use o botão "Invoke" ou "Test"
   - Body de teste:
   ```json
   {
     "email": "teste@example.com",
     "role": "empresa",
     "display_name": "Teste",
     "company_id": "uuid-da-empresa"
   }
   ```

## ⚠️ Importante

- A Edge Function **só funciona se você estiver logado como admin**
- Ela valida o token JWT do usuário que chama
- Se der erro "Unauthorized", verifique se está logado como admin

## 🎯 Próximo Passo

Depois de criar a Edge Function, você pode:
1. ✅ Testar criando uma empresa e usuário
2. ✅ Testar importação CSV de colaboradores
3. ✅ Testar agendamento de sessões
4. ✅ Ver relatórios e exportar CSV

**Tudo pronto para testar!** 🚀


