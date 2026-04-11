// Edge Function: create-user
// Cria usuário no Supabase Auth + profiles
// Usa service_role (server-side only)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type UserRole = 'master_admin' | 'coordenacao' | 'empresa_rh' | 'psicologo' | 'colaborador'

interface CreateUserRequest {
  email: string
  password?: string
  role: UserRole
  display_name: string
  company_id?: string
  psychologist_id?: string
  employee_id?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente com service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar autenticação do usuário que chamou a function
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Não autorizado: usuário não autenticado')
    }

    // Verificar se o usuário tem permissão (master_admin ou coordenacao)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['master_admin', 'coordenacao'].includes(profile.role)) {
      throw new Error('Acesso negado: apenas administradores podem criar usuários')
    }

    // Parse request body
    const body: CreateUserRequest = await req.json()
    const { email, password, role, display_name, company_id } = body

    // Validar dados obrigatórios
    if (!email || !role || !display_name) {
      throw new Error('Campos obrigatórios ausentes: email, role, display_name')
    }

    // Validar role
    const validRoles: UserRole[] = ['master_admin', 'coordenacao', 'empresa_rh', 'psicologo', 'colaborador']
    if (!validRoles.includes(role)) {
      throw new Error(`Role inválido: ${role}. Valores aceitos: ${validRoles.join(', ')}`)
    }

    // Gerar senha se não foi fornecida
    const finalPassword = password || generateRandomPassword()

    // 1. Criar usuário no auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        user_type: role,
        display_name
      }
    })

    if (createError || !newUser.user) {
      throw new Error(`Falha ao criar usuário: ${createError?.message}`)
    }

    const userId = newUser.user.id

    // 2. Criar/atualizar profile
    const profileData: Record<string, unknown> = {
      id: userId,
      role,
      display_name,
      email,
    }

    // Adicionar company_id apenas para empresa_rh
    if (role === 'empresa_rh' && company_id) {
      profileData.company_id = company_id
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)

    if (profileError) {
      // Tentar deletar o usuário se falhou criar profile
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw new Error(`Falha ao criar perfil: ${profileError.message}`)
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email,
        password: password ? undefined : finalPassword, // Só retorna senha se foi gerada
        message: 'Usuário criado com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    // Sempre retorna 200 para que o cliente possa ler o JSON de erro.
    // O campo "success: false" indica falha; status 4xx faz o SDK lançar
    // exceção antes de o frontend conseguir ler a mensagem real.
    return new Response(
      JSON.stringify({
        success: false,
        error: message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})

function generateRandomPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}
