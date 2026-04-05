/**
 * Script para criar usuário administrador no Supabase
 * Execute com: node scripts/create-admin-user.js
 *
 * CONFIGURAÇÃO OBRIGATÓRIA — crie .env na raiz com:
 *
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← Supabase → Project Settings → API → service_role
 *   ADMIN_EMAIL=seu@email.com
 *   ADMIN_PASSWORD=SuaSenhaForte123!
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

if (existsSync(envPath)) {
  try {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          process.env[key] = val;
        }
      }
    }
  } catch {
    console.log('⚠️  Não foi possível ler o arquivo .env');
  }
}

const supabaseUrl    = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail     = process.env.ADMIN_EMAIL;
const adminPassword  = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error('\n❌ Variáveis de ambiente ausentes. Configure o .env com:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('   ADMIN_EMAIL');
  console.error('   ADMIN_PASSWORD\n');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('\n🔐 Criando usuário master_admin...\n');

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  let userId = authData?.user?.id;

  if (authError) {
    if (authError.message?.includes('already registered')) {
      console.log('⚠️  Usuário já existe. Buscando ID...');
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      userId = list?.users?.find(u => u.email === adminEmail)?.id;
    } else {
      console.error('❌ Erro ao criar usuário:', authError.message);
      process.exit(1);
    }
  }

  if (!userId) {
    console.error('❌ Não foi possível obter o ID do usuário.');
    process.exit(1);
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      role: 'master_admin',
      display_name: 'Master Admin',
      email: adminEmail,
      status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('❌ Erro ao criar profile:', profileError.message);
    process.exit(1);
  }

  console.log('✅ master_admin configurado com sucesso!');
  console.log(`   ID:    ${userId}`);
  console.log(`   Email: ${adminEmail}\n`);
}

main().catch(console.error);
