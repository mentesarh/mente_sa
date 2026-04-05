# 🚀 Como Fazer Deploy da Edge Function

## ✅ Opção 1: Script NPM (Recomendado)

```bash
npm run deploy-function
```

Este script vai:
1. Verificar se você está logado no Supabase
2. Fazer login se necessário
3. Linkar ao projeto
4. Fazer deploy da função `create-user`

## ✅ Opção 2: Script Batch (Windows)

Duplo clique em:
```
deploy-function.bat
```

Ou execute no terminal:
```bash
.\deploy-function.bat
```

## ✅ Opção 3: Manual (Passo a Passo)

Se os scripts não funcionarem, execute manualmente:

```bash
# 1. Login
npx supabase login

# 2. Linkar ao projeto
npx supabase link --project-ref xomxdvouptsivduzlqyn

# 3. Deploy
npx supabase functions deploy create-user
```

## ⚠️ Primeira Vez?

Na primeira execução, você precisará:
1. Fazer login no Supabase (abrirá o navegador)
2. Autorizar o acesso
3. Voltar ao terminal

## ✅ Como Saber se Funcionou?

Após o deploy, você verá uma mensagem como:
```
✅ Deploy concluído com sucesso!
```

A função estará disponível em:
```
https://xomxdvouptsivduzlqyn.supabase.co/functions/v1/create-user
```

## 🧪 Testar

1. Faça login como admin no sistema
2. Vá em `/admin/empresas/novo`
3. Crie uma empresa
4. Tente criar um usuário RH
5. Se funcionar, está tudo OK! 🎉

## ❌ Problemas?

**Erro: "Not logged in"**
- Execute: `npx supabase login`

**Erro: "Project not found"**
- Verifique se o project-ref está correto: `xomxdvouptsivduzlqyn`
- Verifique se você tem acesso ao projeto

**Erro: "Function not found"**
- Verifique se o arquivo existe: `supabase/functions/create-user/index.ts`

## 📝 Próximos Passos

Depois do deploy:
- ✅ Teste criando empresas e usuários
- ✅ Teste importação CSV
- ✅ Teste agendamento de sessões
- ✅ Veja os relatórios

**Tudo pronto!** 🚀


