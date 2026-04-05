-- Criação da tabela de perfis + trigger + políticas RLS
-- Execute no SQL Editor do Supabase (projeto xomxdvouptsivduzlqyn)
-- URL: https://app.supabase.com/project/xomxdvouptsivduzlqyn/sql/new

-- 1) Tabela profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','empresa','psicologo','colaborador')),
  display_name text,
  company_id uuid null,
  created_at timestamptz default now()
);

-- 2) Trigger para criar profile automaticamente ao criar usuário
create or replace function public.handle_new_user_profile()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_type', 'colaborador'),
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- 3) Row Level Security
alter table public.profiles enable row level security;

-- Política: usuário vê apenas seu perfil
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Política opcional: admin enxerga todos
drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
  on public.profiles
  for select
  using (
    exists(
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 4) Índices recomendados
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_company_idx on public.profiles (company_id);

-- 5) Conferir resultado
-- select * from public.profiles limit 20;


