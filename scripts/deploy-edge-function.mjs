#!/usr/bin/env node

/**
 * Script para fazer deploy da Edge Function create-user
 * Usa npx supabase (não precisa instalar globalmente)
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const PROJECT_REF = 'xomxdvouptsivduzlqyn';
const FUNCTION_NAME = 'create-user';

console.log('🚀 Iniciando deploy da Edge Function...\n');

// Verificar se o arquivo da função existe
const functionPath = join(projectRoot, 'supabase', 'functions', FUNCTION_NAME, 'index.ts');
try {
  const functionCode = readFileSync(functionPath, 'utf-8');
  console.log('✅ Arquivo da função encontrado:', functionPath);
} catch (error) {
  console.error('❌ Erro: Arquivo da função não encontrado:', functionPath);
  console.error('   Certifique-se de que o arquivo existe em supabase/functions/create-user/index.ts');
  process.exit(1);
}

try {
  // Passo 1: Verificar se está logado
  console.log('\n📋 Verificando login no Supabase...');
  try {
    execSync('npx supabase projects list', { stdio: 'ignore' });
    console.log('✅ Já está logado no Supabase');
  } catch (error) {
    console.log('⚠️  Não está logado. Você precisará fazer login.');
    console.log('   Execute: npx supabase login');
    console.log('   Depois execute este script novamente.\n');
    
    // Tentar fazer login interativo
    console.log('🔄 Tentando fazer login...');
    console.log('   (Siga as instruções na tela)');
    execSync('npx supabase login', { stdio: 'inherit' });
  }

  // Passo 2: Linkar ao projeto
  console.log('\n🔗 Linkando ao projeto...');
  try {
    execSync(`npx supabase link --project-ref ${PROJECT_REF}`, {
      stdio: 'inherit',
      cwd: projectRoot
    });
    console.log('✅ Projeto linkado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao linkar projeto:', error.message);
    console.log('\n💡 Dica: Se já estiver linkado, pode ignorar este erro.');
  }

  // Passo 3: Deploy da função
  console.log(`\n📦 Fazendo deploy da função "${FUNCTION_NAME}"...`);
  execSync(`npx supabase functions deploy ${FUNCTION_NAME}`, {
    stdio: 'inherit',
    cwd: projectRoot
  });

  console.log('\n✅ Deploy concluído com sucesso!');
  console.log(`\n🎉 A função "${FUNCTION_NAME}" está disponível em:`);
  console.log(`   https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}`);
  console.log('\n📝 Próximos passos:');
  console.log('   1. Teste criando uma empresa em /admin/empresas/novo');
  console.log('   2. Tente criar um usuário RH para essa empresa');
  console.log('   3. Se funcionar, está tudo OK! 🚀\n');

} catch (error) {
  console.error('\n❌ Erro durante o deploy:', error.message);
  console.log('\n💡 Soluções:');
  console.log('   1. Certifique-se de estar logado: npx supabase login');
  console.log('   2. Verifique se o projeto existe e você tem acesso');
  console.log('   3. Tente criar manualmente via Dashboard do Supabase');
  console.log('      https://app.supabase.com/project/xomxdvouptsivduzlqyn/functions\n');
  process.exit(1);
}


