/**
 * Script para criar usuário administrador no Supabase
 * 
 * Execute com: node scripts/create-admin-user.js
 * 
 * Requer: npm install @supabase/supabase-js dotenv
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
  
  process.env.VITE_SUPABASE_URL = envVars.VITE_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || '***REMOVED***';
} catch (error) {
  console.log('⚠️  Arquivo .env não encontrado, usando variáveis de ambiente do sistema');
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xomxdvouptsivduzlqyn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '***REMOVED***';

// Credenciais do usuário administrador
const ADMIN_EMAIL = 'mentesa.rh@gmail.com';
const ADMIN_PASSWORD = '***REMOVED***';
const ADMIN_USER_TYPE = 'admin';

// Criar cliente Supabase com Service Role Key (permite criar usuários)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🚀 Iniciando criação do usuário administrador...\n');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔑 Tipo: ${ADMIN_USER_TYPE}\n`);

  try {
    // Verificar se o usuário já existe
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }

    const existingUser = existingUsers.users.find(user => user.email === ADMIN_EMAIL);
    
    if (existingUser) {
      console.log('⚠️  Usuário já existe!');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Tipo atual: ${existingUser.user_metadata?.user_type || 'não definido'}\n`);
      
      // Atualizar metadata se necessário
      if (existingUser.user_metadata?.user_type !== ADMIN_USER_TYPE) {
        console.log('🔄 Atualizando tipo de usuário...');
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            user_metadata: {
              user_type: ADMIN_USER_TYPE
            }
          }
        );

        if (updateError) {
          console.error('❌ Erro ao atualizar usuário:', updateError.message);
          return;
        }

        console.log('✅ Tipo de usuário atualizado para "admin"');
      } else {
        console.log('✅ Usuário já está configurado como administrador');
      }

      // Atualizar senha se necessário
      console.log('\n🔄 Atualizando senha...');
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: ADMIN_PASSWORD
        }
      );

      if (passwordError) {
        console.error('❌ Erro ao atualizar senha:', passwordError.message);
      } else {
        console.log('✅ Senha atualizada com sucesso');
      }

      return;
    }

    // Criar novo usuário
    console.log('📝 Criando novo usuário...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        user_type: ADMIN_USER_TYPE
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message);
      return;
    }

    console.log('\n✅ Usuário administrador criado com sucesso!');
    console.log(`   ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);
    console.log(`   Tipo: ${newUser.user.user_metadata.user_type}`);
    console.log(`   Email confirmado: ${newUser.user.email_confirmed_at ? 'Sim' : 'Não'}\n`);

    console.log('🎉 Pronto! Você pode fazer login com:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}\n`);

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    process.exit(1);
  }
}

// Executar
createAdminUser();


