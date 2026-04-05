# 🔗 Como Conectar o Projeto ao GitHub

## 📋 Repositório GitHub

**URL**: https://github.com/mentesarh/mentesa.git

## 🚀 Passo a Passo

### 1. Abrir Terminal no Diretório do Projeto

**Opção A: Via VS Code/Cursor**
1. Abra o projeto no VS Code/Cursor
2. Pressione `` Ctrl + ` `` para abrir o terminal
3. O terminal já estará no diretório correto

**Opção B: Via PowerShell**
1. Abra o PowerShell
2. Navegue até o projeto:
   ```powershell
   cd "C:\Users\CGB\OneDrive\Área de Trabalho\mente_sa\mente-s-connect-main"
   ```

### 2. Inicializar Git (se ainda não foi feito)

```bash
git init
```

### 3. Configurar Remote do GitHub

```bash
# Remover remote antigo (se existir)
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/mentesarh/mentesa.git

# Verificar
git remote -v
```

Você deve ver:
```
origin  https://github.com/mentesarh/mentesa.git (fetch)
origin  https://github.com/mentesarh/mentesa.git (push)
```

### 4. Adicionar Arquivos

```bash
git add .
```

### 5. Fazer Primeiro Commit

```bash
git commit -m "Initial commit: Mente Sã Connect - Sistema de saúde mental corporativa"
```

### 6. Configurar Branch Main

```bash
git branch -M main
```

### 7. Fazer Push para o GitHub

```bash
git push -u origin main
```

**Nota**: Se for solicitado autenticação:
- **Usuário**: seu username do GitHub
- **Senha**: use um **Personal Access Token** (não sua senha)

## 🔐 Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `Mente Sã Connect`
4. Selecione escopo: **`repo`** (acesso completo a repositórios)
5. Clique em **"Generate token"**
6. **Copie o token** (você só verá uma vez!)
7. Use este token como senha ao fazer push

## ✅ Verificar se Funcionou

Após o push, acesse:
https://github.com/mentesarh/mentesa

Você deve ver todos os arquivos do projeto lá!

## 📝 Comandos Úteis

```bash
# Ver status
git status

# Ver remotes
git remote -v

# Adicionar arquivos específicos
git add arquivo.ts

# Commit com mensagem
git commit -m "Descrição da mudança"

# Push
git push origin main

# Pull (atualizar do GitHub)
git pull origin main

# Ver histórico
git log --oneline
```

## ⚠️ Arquivos que NÃO serão enviados

O `.gitignore` já está configurado para ignorar:
- ✅ `node_modules/` (dependências)
- ✅ `.env` (variáveis de ambiente - **IMPORTANTE!**)
- ✅ `dist/` (build)
- ✅ Arquivos de sistema e editor

## 🎯 Próximos Passos

Após conectar ao GitHub:

1. ✅ Fazer commits regulares
2. ✅ Criar branches para features
3. ✅ Usar Pull Requests para revisão
4. ✅ Configurar GitHub Actions (CI/CD) se necessário

---

**Repositório**: https://github.com/mentesarh/mentesa.git


