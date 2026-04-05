# 👤 Como Criar o Usuário Administrador

Este guia mostra como criar o usuário administrador no Supabase para o portal Mente Sã Connect.

## 📋 Credenciais do Administrador

- **Email**: `mentesa.rh@gmail.com`
- **Senha**: `***REMOVED***`
- **Tipo**: `admin`

## 🚀 Método 1: Script Automático (Recomendado)

Execute o script Node.js que cria o usuário automaticamente:

```bash
npm run create-admin
```

O script irá:
- ✅ Verificar se o usuário já existe
- ✅ Criar o usuário se não existir
- ✅ Atualizar senha e tipo se já existir
- ✅ Configurar o tipo como "admin" no metadata

## 🖥️ Método 2: Painel do Supabase (Manual)

Se preferir criar manualmente:

1. **Acesse o painel do Supabase**:
   - URL: https://app.supabase.com/project/xomxdvouptsivduzlqyn/auth/users

2. **Clique em "Add User"** > **"Create New User"**

3. **Preencha os dados**:
   - **Email**: `mentesa.rh@gmail.com`
   - **Password**: `***REMOVED***`
   - **Auto Confirm User**: ✅ (marque esta opção)

4. **Adicione User Metadata**:
   - Clique em "Raw App Meta Data" ou "Raw User Meta Data"
   - Adicione:
     ```json
     {
       "user_type": "admin"
     }
     ```

5. **Clique em "Create User"**

## ✅ Verificar se Funcionou

Após criar o usuário:

1. Acesse o portal: http://localhost:8080/login
2. Selecione "Coordenação" (tipo admin)
3. Faça login com:
   - Email: `mentesa.rh@gmail.com`
   - Senha: `***REMOVED***`

## 🔧 Troubleshooting

### Erro: "Service Role Key incorreta"
- Verifique se a Service Role Key está correta no script
- A chave está no arquivo `scripts/create-admin-user.mjs`

### Erro: "Email já existe"
- O script detecta e atualiza o usuário existente
- Se ainda der erro, delete o usuário no painel e crie novamente

### Erro: "Senha não atende aos requisitos"
- A senha deve ter pelo menos 8 caracteres
- Deve conter letras maiúsculas, minúsculas, números e caracteres especiais
- A senha fornecida (`***REMOVED***`) atende todos os requisitos

### Usuário criado mas não consegue fazer login
- Verifique se o email foi confirmado (Auto Confirm User)
- Verifique se o tipo de usuário está no metadata como "admin"
- Verifique se as variáveis de ambiente estão corretas no `.env`

## 📝 Notas Importantes

- ⚠️ **Service Role Key**: A chave usada no script tem permissões totais. Mantenha-a segura!
- 🔒 **Segurança**: Nunca commite a Service Role Key no código
- 👤 **Metadata**: O tipo de usuário é armazenado em `user_metadata.user_type`
- 🔄 **Atualização**: Execute o script novamente para atualizar senha ou tipo

## 🎯 Próximos Passos

Após criar o usuário administrador:

1. ✅ Faça login no portal
2. ✅ Configure as tabelas do banco de dados
3. ✅ Crie outros usuários (empresa, psicólogo, colaborador)
4. ✅ Configure permissões e políticas RLS

---

**Script criado em**: `scripts/create-admin-user.mjs`  
**SQL alternativo**: `supabase/create-admin-user.sql`


