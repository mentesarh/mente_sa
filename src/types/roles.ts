// ============================================================
// SISTEMA DE ROLES — Mente Sã Connect
// Fonte de verdade para todos os tipos de perfil do sistema
// ============================================================

export type UserRole =
  | "master_admin"
  | "coordenacao"
  | "empresa_rh"
  | "psicologo"
  | "colaborador";

export type RouteSlug =
  | "master-admin"
  | "coordenacao"
  | "empresa"
  | "psicologo"
  | "colaborador";

// -----------------------------------------------------------------
// Mapeamentos internos
// -----------------------------------------------------------------

const ROLE_TO_SLUG: Record<UserRole, RouteSlug> = {
  master_admin: "master-admin",
  coordenacao: "coordenacao",
  empresa_rh: "empresa",
  psicologo: "psicologo",
  colaborador: "colaborador",
};

const SLUG_TO_ROLE: Record<RouteSlug, UserRole> = {
  "master-admin": "master_admin",
  coordenacao: "coordenacao",
  empresa: "empresa_rh",
  psicologo: "psicologo",
  colaborador: "colaborador",
};

const ROLE_LABELS: Record<UserRole, string> = {
  master_admin: "Master Admin",
  coordenacao: "Coordenação",
  empresa_rh: "Empresa (RH)",
  psicologo: "Psicólogo",
  colaborador: "Colaborador",
};

const DASHBOARD_ROUTES: Record<UserRole, string> = {
  master_admin: "/master-admin",
  coordenacao: "/coordenacao",
  empresa_rh: "/empresa",
  psicologo: "/psicologo",
  colaborador: "/colaborador",
};

// -----------------------------------------------------------------
// Utilitários exportados
// -----------------------------------------------------------------

/** Retorna a rota raiz do dashboard para um dado role */
export function getDashboardRouteByRole(role: UserRole): string {
  return DASHBOARD_ROUTES[role] ?? "/login";
}

/** Retorna o label legível para exibição */
export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? "Usuário";
}

/** Verifica se um role pode acessar uma rota que requer determinados roles */
export function canAccessRoute(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(userRole);
}

/** Converte role do banco para slug de rota */
export function getRouteSlugByRole(role: UserRole): RouteSlug {
  return ROLE_TO_SLUG[role];
}

/** Converte slug de rota para role do banco; retorna null se inválido */
export function getRoleBySlug(slug: string): UserRole | null {
  return SLUG_TO_ROLE[slug as RouteSlug] ?? null;
}

// -----------------------------------------------------------------
// Perfis públicos exibidos na tela de seleção de login
// Master Admin NÃO aparece aqui — acessa via /login/master-admin diretamente
// -----------------------------------------------------------------

import { Building2, Stethoscope, UserCircle, Users } from "lucide-react";

export const PUBLIC_LOGIN_PROFILES = [
  {
    slug: "coordenacao" as RouteSlug,
    role: "coordenacao" as UserRole,
    label: "Coordenação",
    description: "Acesso administrativo e relatórios",
    icon: UserCircle,
  },
  {
    slug: "empresa" as RouteSlug,
    role: "empresa_rh" as UserRole,
    label: "Empresa (RH)",
    description: "Gestão de benefícios e colaboradores",
    icon: Building2,
  },
  {
    slug: "psicologo" as RouteSlug,
    role: "psicologo" as UserRole,
    label: "Psicólogo",
    description: "Agenda e atendimentos",
    icon: Stethoscope,
  },
  {
    slug: "colaborador" as RouteSlug,
    role: "colaborador" as UserRole,
    label: "Colaborador",
    description: "Agendamento de sessões",
    icon: Users,
  },
] as const;
