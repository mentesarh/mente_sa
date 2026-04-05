# Deploy — Git · GitHub · Vercel · Supabase

---

## 1. Configurar Git pela primeira vez

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## 2. Iniciar o repositório local (só na primeira vez)

```bash
# Dentro da pasta do projeto
git init
git add .
git commit -m "feat: primeiro commit"
```

---

## 3. Commit e Push do dia a dia

```bash
# Ver o que mudou
git status

# Adicionar todos os arquivos modificados
git add .

# Ou adicionar arquivo específico
git add src/pages/Login.tsx

# Criar o commit com mensagem descritiva
git commit -m "feat: redesign da página de login"

# Enviar para o GitHub
git push origin main
```

> **Dica de mensagens de commit:**
> - `feat:` nova funcionalidade
> - `fix:` correção de bug
> - `style:` mudança visual sem alterar lógica
> - `refactor:` refatoração de código
> - `chore:` ajustes de config, dependências

---

## 4. Conectar ao GitHub (primeira vez)

### 4.1 Criar repositório no GitHub
1. Acesse [github.com](https://github.com) → **New repository**
2. Dê um nome (ex: `mente-s-connect`)
3. Deixe **privado** se quiser
4. **Não** marque "Add README" (o projeto já tem arquivos)
5. Clique em **Create repository**

### 4.2 Vincular repositório local ao GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/mente-s-connect.git
git branch -M main
git push -u origin main
```

A partir daí, basta `git push` nos próximos envios.

---

## 5. Conectar Vercel ao GitHub

### 5.1 Importar o projeto
1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Escolha **Import Git Repository**
3. Autorize o acesso ao GitHub e selecione o repositório `mente-s-connect`
4. Clique em **Import**

### 5.2 Configurar o build
O Vercel detecta Vite automaticamente. Confirme as configurações:

| Campo | Valor |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 5.3 Adicionar variáveis de ambiente no Vercel
1. Ainda na tela de importação, clique em **Environment Variables**
2. Adicione as variáveis do Supabase:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |

3. Clique em **Deploy**

> Após o primeiro deploy, toda vez que você fizer `git push origin main` o Vercel faz o deploy automaticamente.

---

## 6. Onde pegar as variáveis do Supabase

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Vá em **Project Settings** → **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## 7. Configurar o Supabase para aceitar o domínio da Vercel

Após o deploy, o Vercel gera uma URL como `https://mente-s-connect.vercel.app`.

1. No Supabase → **Authentication** → **URL Configuration**
2. Em **Site URL**, coloque a URL da Vercel:
   ```
   https://mente-s-connect.vercel.app
   ```
3. Em **Redirect URLs**, adicione:
   ```
   https://mente-s-connect.vercel.app/**
   http://localhost:5173/**
   ```
4. Clique em **Save**

---

## 8. Testar localmente com as variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

> O arquivo `.env.local` já está no `.gitignore` por padrão — ele nunca vai para o GitHub.

Rodar o projeto local:
```bash
npm run dev
```

---

## 9. Fluxo completo resumido

```
Você edita o código
        ↓
git add . && git commit -m "feat: algo"
        ↓
git push origin main
        ↓
GitHub recebe o código
        ↓
Vercel detecta o push → faz build automaticamente
        ↓
Site atualizado em produção ✓
        ↓
Supabase já está rodando separado (banco + auth)
```

---

## 10. Comandos úteis do dia a dia

```bash
# Ver histórico de commits
git log --oneline

# Desfazer o último commit (mantém os arquivos)
git reset --soft HEAD~1

# Ver branches
git branch

# Criar nova branch para uma feature
git checkout -b feat/nova-funcionalidade

# Voltar para a main
git checkout main

# Trazer atualizações do GitHub para local
git pull origin main
```

---

## 11. Checklist de deploy

- [ ] `.env.local` criado com as chaves do Supabase
- [ ] Variáveis de ambiente adicionadas no painel da Vercel
- [ ] Site URL e Redirect URLs configurados no Supabase Auth
- [ ] Migration SQL executada no Supabase (SQL Editor)
- [ ] `git push` feito → build da Vercel com sucesso
- [ ] Testar login em produção
