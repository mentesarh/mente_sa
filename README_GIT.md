# 🔗 Configurar Git com GitHub

## 📋 Repositório GitHub

**URL**: https://github.com/mentesarh/mentesa.git

## 🚀 Configuração Rápida

### Opção 1: Usar Script PowerShell (Recomendado)

1. Abra o PowerShell no diretório do projeto
2. Execute:
   ```powershell
   .\configurar-git.ps1
   ```

### Opção 2: Configuração Manual

1. **Inicializar Git** (se ainda não foi feito):
   ```bash
   git init
   ```

2. **Configurar remote**:
   ```bash
   git remote add origin https://github.com/mentesarh/mentesa.git
   ```
   
   Se já existir um remote, remova primeiro:
   ```bash
   git remote remove origin
   git remote add origin https://github.com/mentesarh/mentesa.git
   ```

3. **Verificar configuração**:
   ```bash
   git remote -v
   ```

## 📤 Primeiro Push

Após configurar o remote, faça o primeiro commit e push:

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: Mente Sã Connect - Sistema de saúde mental corporativa"

# Configurar branch main (se necessário)
git branch -M main

# Fazer push para o GitHub
git push -u origin main
```

## ⚠️ Arquivos Ignorados

O arquivo `.gitignore` já está configurado para ignorar:
- `node_modules/`
- `.env` (variáveis de ambiente)
- `dist/` (build)
- Arquivos de sistema e editor

## 🔐 Autenticação GitHub

Se for solicitado, você precisará:
- **Token de acesso pessoal** (recomendado)
- Ou usar **GitHub CLI** (`gh auth login`)

### Criar Token de Acesso:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Selecione escopos: `repo` (acesso completo a repositórios)
4. Copie o token e use como senha ao fazer push

## 📝 Comandos Úteis

```bash
# Ver status
git status

# Ver remotes
git remote -v

# Adicionar arquivos
git add .

# Commit
git commit -m "Mensagem do commit"

# Push
git push origin main

# Pull (atualizar do GitHub)
git pull origin main
```

## 🎯 Estrutura do Repositório

```
mente-s-connect-main/
├── src/              # Código fonte
├── public/           # Arquivos estáticos
├── supabase/         # Scripts SQL
├── scripts/          # Scripts utilitários
├── package.json      # Dependências
└── README.md         # Documentação
```

---

**Repositório**: https://github.com/mentesarh/mentesa.git


