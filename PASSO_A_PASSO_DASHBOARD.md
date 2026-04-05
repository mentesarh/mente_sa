# 🚀 Passo a Passo: Criar Edge Function no Dashboard do Supabase

## ✅ Passo 1: Acessar o Dashboard

1. Abra seu navegador
2. Acesse: **https://app.supabase.com/project/xomxdvouptsivduzlqyn/functions**
3. Faça login se necessário

## ✅ Passo 2: Criar Nova Função

1. Clique no botão **"Create a new function"** ou **"New Function"**
   - Pode estar no canto superior direito ou no centro da tela

2. Se aparecer um modal com opções:
   - Escolha **"Blank"** ou **"Create from scratch"**
   - Ou qualquer template (vamos substituir o código)

## ✅ Passo 3: Configurar Nome da Função

1. No campo **"Function name"** ou **"Name"**, digite:
   ```
   create-user
   ```
   - **IMPORTANTE:** O nome deve ser exatamente `create-user` (com hífen)

2. Clique em **"Create"** ou **"Next"**

## ✅ Passo 4: Copiar o Código

1. Abra o arquivo no seu projeto:
   ```
   supabase/functions/create-user/index.ts
   ```

2. **Selecione TODO o conteúdo** do arquivo (Ctrl+A)

3. **Copie** (Ctrl+C)

## ✅ Passo 5: Colar no Editor do Supabase

1. No Dashboard do Supabase, você verá um editor de código

2. **Delete todo o código que está lá** (se houver)

3. **Cole o código** que você copiou (Ctrl+V)

4. O código deve começar com:
   ```typescript
   // Edge Function: create-user
   // Cria usuário no Supabase Auth + profiles + profile_links
   ```

## ✅ Passo 6: Verificar Variáveis de Ambiente

As variáveis já estão configuradas automaticamente pelo Supabase:
- ✅ `SUPABASE_URL` - Já disponível
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Já disponível

**Você NÃO precisa configurar nada manualmente!**

## ✅ Passo 7: Salvar e Deploy

1. Procure o botão **"Deploy"** ou **"Save"** ou **"Deploy Function"**
   - Geralmente está no canto superior direito do editor

2. Clique em **"Deploy"**

3. Aguarde alguns segundos enquanto faz o deploy

4. Você verá uma mensagem de sucesso: **"Function deployed successfully"** ou similar

## ✅ Passo 8: Verificar se Funcionou

1. Na lista de funções, você deve ver:
   - ✅ `create-user` com status **"Active"** ou **"Deployed"**

2. A URL da função será:
   ```
   https://xomxdvouptsivduzlqyn.supabase.co/functions/v1/create-user
   ```

## 🧪 Passo 9: Testar (Opcional)

1. Clique na função `create-user`

2. Procure a aba **"Invoke"** ou **"Test"**

3. Cole este JSON no body (substitua os valores):
   ```json
   {
     "email": "teste@example.com",
     "role": "empresa",
     "display_name": "Teste",
     "company_id": "uuid-da-empresa-aqui"
   }
   ```

4. Clique em **"Invoke"** ou **"Run"**

5. Se retornar `success: true`, está funcionando! ✅

## ✅ Pronto!

Agora você pode:
1. ✅ Fazer login no sistema como admin
2. ✅ Ir em `/admin/empresas/novo`
3. ✅ Criar uma empresa
4. ✅ Criar um usuário RH para essa empresa
5. ✅ Se funcionar, está tudo OK! 🎉

## 📸 Onde Está Cada Coisa?

### No Dashboard:
- **Functions:** Menu lateral esquerdo → "Edge Functions"
- **Create Function:** Botão no topo direito
- **Editor:** Aparece após criar a função
- **Deploy:** Botão no topo direito do editor

### Se Não Encontrar:
- Procure por **"Edge Functions"** no menu lateral
- Ou acesse diretamente: **https://app.supabase.com/project/xomxdvouptsivduzlqyn/functions**

## ❌ Problemas Comuns

**"Function name already exists"**
- Delete a função antiga primeiro ou use outro nome

**"Deploy failed"**
- Verifique se copiou TODO o código
- Verifique se não há erros de sintaxe (o editor mostra em vermelho)

**"Cannot find module"**
- Isso é normal, o Supabase resolve automaticamente no deploy

## 🎯 Resumo Rápido

1. Acesse: https://app.supabase.com/project/xomxdvouptsivduzlqyn/functions
2. Clique em "Create a new function"
3. Nome: `create-user`
4. Cole o código de `supabase/functions/create-user/index.ts`
5. Clique em "Deploy"
6. Pronto! ✅

**Tempo estimado: 2-3 minutos** ⏱️


