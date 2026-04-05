# 🚀 Deploy Rápido na Vercel

## ⚡ Método Mais Rápido (5 minutos)

### 1. Criar Conta/Login na Vercel
- Acesse: https://vercel.com/signup
- Faça login com GitHub (recomendado)

### 2. Conectar Repositório
1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório
4. Clique em **"Import"**

### 3. Configurar Variáveis de Ambiente

**ANTES de clicar em "Deploy"**, adicione as variáveis:

1. Clique em **"Environment Variables"**
2. Adicione:

```
Nome: VITE_SUPABASE_URL
Valor: https://xomxdvouptsivduzlqyn.supabase.co
Ambientes: ✅ Production ✅ Preview ✅ Development
```

```
Nome: VITE_SUPABASE_PUBLISHABLE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbXhkdm91cHRzaXZkdXpscXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Mjk5MzAsImV4cCI6MjA4MzIwNTkzMH0.lu0icNf-LyvYkR4k4B-8QIN3T_sqwn2rZFXrs7t2G80
Ambientes: ✅ Production ✅ Preview ✅ Development
```

3. Clique em **"Save"**

### 4. Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Pronto! 🎉

## 📋 Checklist

- [ ] Repositório no GitHub
- [ ] Conta na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy iniciado

## 🔗 Após o Deploy

Você receberá uma URL como:
- `https://mente-sa-connect.vercel.app`
- Ou um nome customizado que você escolher

## ⚠️ Importante

- As variáveis de ambiente **DEVEM** começar com `VITE_` para funcionar no build
- Após adicionar variáveis, sempre faça um novo deploy
- O arquivo `vercel.json` já está configurado para SPA (Single Page Application)

## 🐛 Problemas?

**Build falha:**
- Verifique se as variáveis estão com `VITE_` no início
- Teste localmente: `npm run build`

**404 em rotas:**
- O `vercel.json` já está configurado
- Se persistir, verifique se o build gerou a pasta `dist`

**Erro de autenticação:**
- Verifique se as variáveis de ambiente estão corretas
- Confira se o Supabase está acessível

## ✅ Pronto para Produção!

Seu projeto estará online e funcionando! 🚀


