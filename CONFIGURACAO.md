# 📋 Configuração do Projeto Mente Sã Connect

## 🎯 Visão Geral do Projeto

**Mente Sã Connect** é uma plataforma de saúde mental corporativa que conecta empresas, colaboradores e psicólogos para promover o bem-estar mental no ambiente de trabalho.

### Tecnologias Utilizadas

- **Frontend Framework**: React 18.3.1 com TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.30.1
- **State Management**: TanStack Query (React Query) 5.83.0
- **Backend**: Supabase 2.89.0
- **Form Handling**: React Hook Form 7.61.1 + Zod 3.25.76
- **Icons**: Lucide React 0.462.0

## 📁 Estrutura do Projeto

```
mente-s-connect-main/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── dashboard/       # Componentes de dashboard
│   │   ├── landing/         # Componentes da página inicial
│   │   ├── layout/          # Layout (Navbar, Footer)
│   │   └── ui/              # Componentes shadcn/ui
│   ├── pages/               # Páginas da aplicação
│   │   ├── admin/           # Dashboard Administrativo
│   │   ├── colaborador/     # Dashboard Colaborador
│   │   ├── empresa/         # Dashboard Empresa (RH)
│   │   ├── psicologo/       # Dashboard Psicólogo
│   │   ├── Index.tsx        # Página inicial (Landing)
│   │   ├── Login.tsx        # Página de login
│   │   └── NotFound.tsx     # Página 404
│   ├── hooks/               # Custom hooks
│   ├── integrations/        # Integrações externas
│   │   └── supabase/        # Cliente Supabase
│   ├── lib/                 # Utilitários
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── public/                  # Arquivos estáticos
├── supabase/                # Configuração Supabase
├── package.json             # Dependências e scripts
├── vite.config.ts           # Configuração Vite
├── tailwind.config.ts       # Configuração Tailwind
└── tsconfig.json            # Configuração TypeScript
```

## 🚀 Como Iniciar o Projeto

### Pré-requisitos

- Node.js 22.20.0 ou superior
- npm 10.9.3 ou superior

### Instalação

1. **Instalar dependências** (já executado):
```bash
npm install
```

2. **Configurar variáveis de ambiente**:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
   ```
   - Obtenha essas credenciais em: https://app.supabase.com/project/_/settings/api

3. **Iniciar servidor de desenvolvimento**:
```bash
npm run dev
```
   - O servidor estará disponível em: http://localhost:8080

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run build:dev` - Cria build em modo desenvolvimento
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter ESLint

## 👥 Tipos de Usuários

O sistema possui 4 tipos de usuários com dashboards específicos:

1. **Coordenação (Admin)**
   - Acesso administrativo completo
   - Rota: `/admin`

2. **Empresa (RH)**
   - Gestão de benefícios e relatórios
   - Rota: `/empresa`

3. **Psicólogo**
   - Agenda e atendimentos
   - Rota: `/psicologo`

4. **Colaborador**
   - Agendamento de sessões
   - Rota: `/colaborador`

## 🎨 Sistema de Design

### Cores Principais

- **Primary**: `hsl(174 72% 40%)` - Verde-azulado
- **Secondary**: `hsl(180 15% 95%)` - Cinza claro
- **Accent**: `hsl(160 60% 45%)` - Verde
- **Destructive**: `hsl(0 72% 55%)` - Vermelho

### Fonte

- **Família**: Plus Jakarta Sans
- **Pesos**: 300, 400, 500, 600, 700, 800

## 🔧 Configurações Importantes

### Vite
- Porta: 8080
- Host: `::` (IPv6)
- Alias: `@` → `./src`

### TypeScript
- Path aliases configurados para `@/*`
- Strict mode desabilitado (configuração flexível)

### Tailwind CSS
- Dark mode: class-based
- CSS variables para temas
- Animações customizadas

## 📦 Dependências Principais

### Core
- `react` & `react-dom`: Framework UI
- `react-router-dom`: Roteamento
- `@tanstack/react-query`: Gerenciamento de estado servidor

### UI
- `@radix-ui/*`: Componentes primitivos acessíveis
- `tailwindcss`: Framework CSS
- `lucide-react`: Ícones

### Backend
- `@supabase/supabase-js`: Cliente Supabase

### Formulários
- `react-hook-form`: Gerenciamento de formulários
- `zod`: Validação de schemas
- `@hookform/resolvers`: Integração Zod + React Hook Form

## ⚠️ Próximos Passos

1. **Configurar Supabase**:
   - Criar projeto no Supabase
   - Configurar autenticação
   - Criar tabelas do banco de dados
   - Adicionar variáveis de ambiente

2. **Implementar Autenticação**:
   - Integrar login com Supabase Auth
   - Implementar proteção de rotas
   - Gerenciar sessões de usuário

3. **Desenvolver Funcionalidades**:
   - Sistema de agendamento
   - Dashboard de relatórios
   - Gestão de colaboradores
   - Sistema de notificações

## 🔍 Verificações de Segurança

Execute para verificar vulnerabilidades:
```bash
npm audit
npm audit fix
```

## 📝 Notas

- O projeto usa `bun.lockb` mas está configurado para npm
- Existem 4 vulnerabilidades detectadas (3 moderadas, 1 alta)
- Recomenda-se executar `npm audit fix` após configuração inicial


