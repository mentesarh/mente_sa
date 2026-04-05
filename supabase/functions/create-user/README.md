# Edge Function: create-user

## Descrição

Edge Function do Supabase para criar usuários de forma segura usando `service_role`.

## Deploy

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login no Supabase

```bash
supabase login
```

### 3. Linkar ao projeto

```bash
supabase link --project-ref xomxdvouptsivduzlqyn
```

### 4. Deploy da função

```bash
supabase functions deploy create-user
```

## Uso

### Do Frontend

```typescript
import { supabase } from '@/integrations/supabase/client'

const { data, error } = await supabase.functions.invoke('create-user', {
  body: {
    email: 'usuario@example.com',
    password: 'senha123', // Opcional - se não enviar, gera automaticamente
    role: 'empresa',
    display_name: 'Nome do Usuário',
    company_id: 'uuid-da-empresa', // Obrigatório se role=empresa
    psychologist_id: 'uuid', // Obrigatório se role=psicologo
    employee_id: 'uuid' // Obrigatório se role=colaborador
  }
})

if (error) {
  console.error('Erro:', error)
} else {
  console.log('Usuário criado:', data)
  // Se senha foi gerada automaticamente, data.password contém a senha
}
```

## Request Body

```typescript
{
  email: string          // Email do usuário
  password?: string      // Senha (opcional, gera se não fornecido)
  role: 'admin' | 'empresa' | 'psicologo' | 'colaborador'
  display_name: string   // Nome de exibição
  company_id?: string    // UUID da empresa (obrigatório se role=empresa)
  psychologist_id?: string // UUID do psicólogo (obrigatório se role=psicologo)
  employee_id?: string   // UUID do colaborador (obrigatório se role=colaborador)
}
```

## Response

### Sucesso

```typescript
{
  success: true,
  user_id: string,
  email: string,
  password?: string, // Só retorna se foi gerada automaticamente
  message: 'User created successfully'
}
```

### Erro

```typescript
{
  success: false,
  error: string
}
```

## Segurança

- ✅ Apenas usuários autenticados com role `admin` podem chamar esta função
- ✅ Usa `service_role` apenas no servidor
- ✅ Confirma email automaticamente
- ✅ Cria profile e profile_links atomicamente
- ✅ Faz rollback (deleta usuário) se falhar criar profile ou links

## Logs

Ver logs da função:

```bash
supabase functions logs create-user
```

## Testar Localmente

```bash
supabase functions serve create-user
```

Então chamar via curl ou Postman:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-user' \
  --header 'Authorization: Bearer YOUR_USER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","role":"empresa","display_name":"Test User","company_id":"uuid"}'
```


