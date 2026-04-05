# 🚀 Deploy na Vercel - Guia Completo

## ✅ Pré-requisitos

1. Conta na Vercel (gratuita): https://vercel.com/signup
2. Projeto no GitHub (recomendado) ou GitLab/Bitbucket
3. Variáveis de ambiente do Supabase configuradas

## 📋 Passo a Passo

### Opção 1: Deploy via GitHub (Recomendado)

#### 1. Preparar o Repositório

```bash
# Se ainda não tem Git inicializado
git init
git add .
git commit -m "Initial commit - Mente Sã Connect"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/SEU_USUARIO/mente-sa-connect.git
git branch -M main
git push -u origin main
```

#### 2. Conectar na Vercel

1. Acesse: **https://vercel.com/new**
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório do GitHub
4. Clique em **"Import"**

#### 3. Configurar o Projeto

A Vercel detecta automaticamente que é um projeto Vite, mas verifique:

- **Framework Preset:** Vite
- **Root Directory:** `./` (raiz)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### 4. Configurar Variáveis de Ambiente

**IMPORTANTE:** Adicione estas variáveis na Vercel:

1. Na tela de configuração do projeto, vá em **"Environment Variables"**
2. Adicione:

```
VITE_SUPABASE_URL=https://xomxdvouptsivduzlqyn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbXhkdm91cHRzaXZkdXpscXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Mjk5MzAsImV4cCI6MjA4MzIwNTkzMH0.lu0icNf-LyvYkR4k4B-8QIN3T_sqwn2rZFXrs7t2G80
```

3. Marque para **Production**, **Preview** e **Development**
4. Clique em **"Save"**

#### 5. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Pronto! Você receberá uma URL como: `https://mente-sa-connect.vercel.app`

### Opção 2: Deploy via Vercel CLI

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy

```bash
# Deploy de produção
vercel --prod

# Ou deploy de preview (teste)
vercel
```

#### 4. Configurar Variáveis de Ambiente

```bash
vercel env add VITE_SUPABASE_URL
# Cole: https://xomxdvouptsivduzlqyn.supabase.co

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbXhkdm91cHRzaXZkdXpscXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Mjk5MzAsImV4cCI6MjA4MzIwNTkzMH0.lu0icNf-LyvYkR4k4B-8QIN3T_sqwn2rZFXrs7t2G80
```

## ⚙️ Configurações Importantes

### Variáveis de Ambiente na Vercel

No painel da Vercel, vá em:
**Settings → Environment Variables**

Adicione:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**Importante:** 
- ✅ Marque para **Production**, **Preview** e **Development**
- ✅ Após adicionar, faça um novo deploy

### Build Settings

A Vercel detecta automaticamente, mas se precisar ajustar:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x ou 20.x (automático)

## 🔧 Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para testar

### Erro: "Environment variable not found"
- Verifique se as variáveis começam com `VITE_`
- Faça um novo deploy após adicionar variáveis

### Erro: "404 on routes"
- O arquivo `vercel.json` já está configurado com rewrites
- Se persistir, verifique se o build gerou a pasta `dist`

### Build falha
- Verifique os logs na Vercel
- Teste localmente: `npm run build`

## 📝 Checklist Antes do Deploy

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build local funciona (`npm run build`)
- [ ] Testado localmente (`npm run preview`)
- [ ] Edge Function deployada no Supabase (se usar)
- [ ] Banco de dados configurado (SQL executado)

## 🎯 Após o Deploy

1. **Teste a URL:** Acesse a URL fornecida pela Vercel
2. **Teste Login:** Faça login com `mentesa.rh@gmail.com`
3. **Verifique Console:** Abra DevTools e verifique erros
4. **Teste Funcionalidades:** Crie empresa, psicólogo, etc.

## 🔄 Deploy Automático

A Vercel faz deploy automático quando você:
- Faz push para a branch `main` (produção)
- Faz push para outras branches (preview)
- Abre um Pull Request (preview)

## 📱 Domínio Customizado (Opcional)

1. Vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure os DNS conforme instruções da Vercel

## ✅ Pronto!

Seu projeto estará online em: `https://seu-projeto.vercel.app`

**Tempo estimado:** 5-10 minutos ⏱️


