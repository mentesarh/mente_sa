// Edge Function: create-user
// Cria usuário no Supabase Auth + profiles + profile_links
// Usa service_role (server-side only)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password?: string
  role: 'admin' | 'empresa' | 'psicologo' | 'colaborador'
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
      throw new Error('Unauthorized')
    }

    // Verificar se o usuário é admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can create users')
    }

    // Parse request body
    const body: CreateUserRequest = await req.json()
    const { email, password, role, display_name, company_id, psychologist_id, employee_id } = body

    // Validar dados obrigatórios
    if (!email || !role || !display_name) {
      throw new Error('Missing required fields: email, role, display_name')
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
      throw new Error(`Failed to create user: ${createError?.message}`)
    }

    const userId = newUser.user.id

    // 2. Criar/atualizar profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        role,
        display_name,
        company_id: role === 'empresa' ? company_id : null
      })

    if (profileError) {
      // Tentar deletar o usuário se falhou criar profile
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    // 3. Criar profile_links
    const { error: linkError } = await supabaseAdmin
      .from('profile_links')
      .upsert({
        user_id: userId,
        company_id: company_id || null,
        psychologist_id: psychologist_id || null,
        employee_id: employee_id || null
      })

    if (linkError) {
      // Tentar deletar se falhou
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw new Error(`Failed to create profile_link: ${linkError.message}`)
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email,
        password: password ? undefined : finalPassword, // Só retorna senha se foi gerada
        message: 'User created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
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


