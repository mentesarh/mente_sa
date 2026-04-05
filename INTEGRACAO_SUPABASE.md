# 🔗 Integração com Supabase - Mente Sã Connect

## ✅ Configuração Realizada

### 1. Variáveis de Ambiente (.env)
```
VITE_SUPABASE_URL=https://xomxdvouptsivduzlqyn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Configuração do Supabase
- **Project ID**: `xomxdvouptsivduzlqyn`
- **URL**: `https://xomxdvouptsivduzlqyn.supabase.co`
- Arquivo `supabase/config.toml` atualizado

### 3. Arquitetura de Autenticação

#### AuthContext (`src/contexts/AuthContext.tsx`)
- Gerenciamento global do estado de autenticação
- Funções: `signIn`, `signOut`, `signUp`
- Armazena tipo de usuário no metadata
- Escuta mudanças de autenticação em tempo real

#### Login Atualizado (`src/pages/Login.tsx`)
- Integração real com Supabase Auth
- Validação de credenciais
- Feedback visual com toast notifications
- Estado de loading durante autenticação

#### Proteção de Rotas (`src/components/ProtectedRoute.tsx`)
- Componente que protege rotas privadas
- Verifica autenticação e tipo de usuário
- Redireciona para login se não autenticado
- Redireciona para dashboard correto se tipo de usuário incorreto

### 4. Rotas Protegidas

Todas as rotas de dashboard agora estão protegidas:
- `/admin` - Requer tipo "admin"
- `/empresa` - Requer tipo "empresa"
- `/psicologo` - Requer tipo "psicologo"
- `/colaborador` - Requer tipo "colaborador"

## 🚀 Como Usar

### 1. Criar Usuário no Supabase

No painel do Supabase (https://app.supabase.com):
1. Vá em **Authentication** > **Users**
2. Clique em **Add User** > **Create New User**
3. Preencha email e senha
4. No campo **User Metadata**, adicione:
   ```json
   {
     "user_type": "admin" // ou "empresa", "psicologo", "colaborador"
   }
   ```

### 2. Fazer Login

1. Acesse `/login`
2. Selecione o tipo de usuário
3. Digite email e senha
4. Clique em "Entrar"

### 3. Testar Conexão

No console do navegador (F12), execute:
```javascript
import { testSupabaseConnection, testSupabaseAuth } from '@/utils/testSupabaseConnection';

// Testar conexão
await testSupabaseConnection();

// Testar autenticação
await testSupabaseAuth();
```

## 📋 Próximos Passos

### 1. Configurar Banco de Dados

Crie as tabelas necessárias no Supabase:

```sql
-- Tabela de usuários (extensão do auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'empresa', 'psicologo', 'colaborador')),
  nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

### 2. Criar Tabelas do Sistema

- `empresas` - Cadastro de empresas
- `colaboradores` - Cadastro de colaboradores
- `psicologos` - Cadastro de psicólogos
- `agendamentos` - Agendamentos de sessões
- `sessoes` - Histórico de sessões realizadas
- `relatorios` - Relatórios gerados

### 3. Implementar Funcionalidades

- [ ] Recuperação de senha
- [ ] Atualização de perfil
- [ ] Logout
- [ ] Refresh token automático
- [ ] Sincronização de tipo de usuário com banco de dados

## 🔒 Segurança

### Variáveis de Ambiente
- ✅ `.env` está no `.gitignore` (não será commitado)
- ⚠️ **NUNCA** commite credenciais no código
- ⚠️ **Service Role Key** deve ser usado apenas no backend

### Autenticação
- ✅ Tokens armazenados em `localStorage`
- ✅ Refresh automático de tokens
- ✅ Sessão persistente
- ✅ Proteção de rotas implementada

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verifique se as variáveis de ambiente estão corretas no `.env`
- Reinicie o servidor de desenvolvimento após alterar `.env`

### Erro: "User not found"
- Verifique se o usuário foi criado no Supabase
- Confirme que o email está correto

### Erro: "Invalid login credentials"
- Verifique se a senha está correta
- Confirme que o usuário está ativo no Supabase

### Rotas não redirecionando
- Verifique se o `AuthProvider` está envolvendo o `BrowserRouter`
- Confirme que o `ProtectedRoute` está sendo usado nas rotas

## 📚 Recursos

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)


