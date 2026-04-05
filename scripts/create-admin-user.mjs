/**
 * Script para criar usuário administrador no Supabase
 * Execute com: npm run create-admin
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const envPath = join(rootDir, '.env');

// Configurações
const SUPABASE_URL = 'https://xomxdvouptsivduzlqyn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = '***REMOVED***';

const ADMIN_EMAIL = 'mentesa.rh@gmail.com';
const ADMIN_PASSWORD = '***REMOVED***';
const ADMIN_USER_TYPE = 'admin';

// Tentar carregar variáveis do .env se existir
if (existsSync(envPath)) {
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (key === 'VITE_SUPABASE_URL') {
            process.env.VITE_SUPABASE_URL = value;
          }
          if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
            process.env.SUPABASE_SERVICE_ROLE_KEY = value;
          }
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Não foi possível ler o arquivo .env');
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY;

// Criar cliente com Service Role Key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('\n🚀 Criando usuário administrador...\n');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔑 Tipo: ${ADMIN_USER_TYPE}`);
  console.log(`🌐 URL: ${supabaseUrl}\n`);

  try {
    // Verificar se o usuário já existe
    console.log('🔍 Verificando se o usuário já existe...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      console.error('\n💡 Dica: Verifique se a Service Role Key está correta no script.');
      process.exit(1);
    }

    const existingUser = users.find(user => user.email === ADMIN_EMAIL);
    
    if (existingUser) {
      console.log('⚠️  Usuário já existe!\n');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Tipo atual: ${existingUser.user_metadata?.user_type || 'não definido'}\n`);
      
      // Atualizar metadata e senha
      console.log('🔄 Atualizando usuário...');
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: ADMIN_PASSWORD,
          user_metadata: {
            user_type: ADMIN_USER_TYPE
          }
        }
      );

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError.message);
        process.exit(1);
      }

      console.log('✅ Usuário atualizado com sucesso!');
      console.log(`   Tipo: ${updatedUser.user.user_metadata.user_type}`);
      console.log(`   Senha: Atualizada\n`);
      
      console.log('🎉 Pronto! Você pode fazer login com:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Senha: ${ADMIN_PASSWORD}\n`);
      
      return;
    }

    // Criar novo usuário
    console.log('📝 Criando novo usuário...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        user_type: ADMIN_USER_TYPE
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message);
      console.error('\n💡 Possíveis causas:');
      console.error('   - Service Role Key incorreta');
      console.error('   - Email já existe em outro projeto');
      console.error('   - Senha não atende aos requisitos de segurança');
      process.exit(1);
    }

    console.log('\n✅ Usuário administrador criado com sucesso!\n');
    console.log(`   ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);
    console.log(`   Tipo: ${newUser.user.user_metadata.user_type}`);
    console.log(`   Email confirmado: ${newUser.user.email_confirmed_at ? 'Sim ✅' : 'Não ❌'}\n`);

    console.log('🎉 Pronto! Você pode fazer login no portal:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}\n`);
    console.log('🌐 Acesse: http://localhost:8080/login\n');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error('\n💡 Verifique:');
    console.error('   1. Se a Service Role Key está correta');
    console.error('   2. Se o projeto Supabase está ativo');
    console.error('   3. Se você tem permissões de administrador');
    process.exit(1);
  }
}

// Executar
createAdminUser();


