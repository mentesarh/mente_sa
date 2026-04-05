import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  FileText,
  Settings,
  TrendingUp,
  ShieldCheck,
  UserCog,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { usePsychologists } from "@/hooks/usePsychologists";
import { useEmployees } from "@/hooks/useEmployees";
import { useMemo } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const masterAdminNavItems = [
  { label: "Dashboard",     href: "/master-admin",               icon: LayoutDashboard },
  { label: "Usuários",      href: "/master-admin/usuarios",      icon: UserCog },
  { label: "Empresas",      href: "/master-admin/empresas",      icon: Building2 },
  { label: "Psicólogos",    href: "/master-admin/psicologos",    icon: Stethoscope },
  { label: "Colaboradores", href: "/master-admin/colaboradores", icon: Users },
  { label: "Relatórios",    href: "/master-admin/relatorios",    icon: FileText },
  { label: "Configurações", href: "/master-admin/configuracoes", icon: Settings },
];

const QUICK_ACTIONS = [
  { label: "Gerenciar Usuários", desc: "Ver e editar contas", icon: UserCog,    href: "/master-admin/usuarios",   color: "#157a6e" },
  { label: "Nova Empresa",       desc: "Cadastrar empresa",   icon: Building2,  href: "/master-admin/empresas",   color: "#1a6b82" },
  { label: "Novo Psicólogo",     desc: "Adicionar parceiro",  icon: Stethoscope,href: "/master-admin/psicologos", color: "#1a6b4a" },
  { label: "Relatórios",         desc: "Visão analítica",     icon: TrendingUp, href: "/master-admin/relatorios", color: "#186e7a" },
];

const MasterAdminDashboard = () => {
  const navigate = useNavigate();
  const { data: companies,     isLoading: loadingCompanies }     = useCompanies();
  const { data: psychologists, isLoading: loadingPsychologists } = usePsychologists();
  const { data: employees,     isLoading: loadingEmployees }     = useEmployees();

  const stats = useMemo(() => {
    const activeCompanies     = companies?.filter((c) => c.is_active).length     || 0;
    const activePsychologists = psychologists?.filter((p) => p.is_active).length || 0;
    const activeEmployees     = employees?.filter((e) => e.is_active).length     || 0;
    const totalUsers          = activeCompanies + activePsychologists + activeEmployees;
    return { activeCompanies, activePsychologists, activeEmployees, totalUsers };
  }, [companies, psychologists, employees]);

  if (loadingCompanies || loadingPsychologists || loadingEmployees) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Controle total da plataforma Mente Sã"
        navItems={masterAdminNavItems}
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Controle total da plataforma Mente Sã"
      navItems={masterAdminNavItems}
    >

      {/* ── Access banner ──────────────────────────────── */}
      <div
        className="flex items-center gap-3.5 rounded-2xl mb-8"
        style={{
          padding: "14px 18px",
          background: "linear-gradient(135deg, hsl(172,68%,33%/0.07), hsl(158,58%,36%/0.04))",
          border: "1px solid hsl(172,68%,33%/0.18)",
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "hsl(172,68%,33%/0.12)" }}
        >
          <ShieldCheck style={{ width: 16, height: 16, color: "hsl(172,68%,33%)" }} />
        </div>
        <p style={{ fontSize: 13.5, color: "hsl(220,20%,30%)" }}>
          Você tem acesso total à plataforma.{" "}
          <span style={{ color: "hsl(220,20%,50%)" }}>
            Todas as operações ficam registradas em log de auditoria.
          </span>
        </p>
        <div
          className="ml-auto shrink-0 rounded-full px-3 py-1 font-semibold"
          style={{
            fontSize: 11,
            background: "hsl(172,68%,33%/0.10)",
            color: "hsl(172,68%,30%)",
            border: "1px solid hsl(172,68%,33%/0.22)",
          }}
        >
          Master Admin
        </div>
      </div>

      {/* ── Stats grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Empresas Ativas"
          value={stats.activeCompanies}
          change="cadastradas no sistema"
          changeType="neutral"
          icon={Building2}
        />
        <StatCard
          title="Psicólogos Parceiros"
          value={stats.activePsychologists}
          change="ativos na plataforma"
          changeType="positive"
          icon={Stethoscope}
        />
        <StatCard
          title="Colaboradores"
          value={stats.activeEmployees}
          change="cadastrados"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          change="com acesso ao sistema"
          changeType="positive"
          icon={UserCog}
        />
      </div>

      {/* ── Quick actions + chart row ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick actions — 1/3 */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "white",
            border: "1px solid hsl(220,14%,91%)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <p
            className="font-semibold mb-4"
            style={{ fontSize: 13.5, color: "hsl(220,30%,14%)" }}
          >
            Ações Rápidas
          </p>

          <div className="space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="w-full flex items-center gap-3 rounded-xl transition-all duration-150 group"
                style={{
                  padding: "10px 12px",
                  background: "transparent",
                  border: "1px solid transparent",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = `${action.color}09`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${action.color}22`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${action.color}14` }}
                >
                  <action.icon style={{ width: 16, height: 16, color: action.color }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold leading-tight"
                    style={{ fontSize: 13, color: "hsl(220,30%,14%)" }}
                  >
                    {action.label}
                  </p>
                  <p
                    className="leading-tight mt-0.5"
                    style={{ fontSize: 11.5, color: "hsl(220,12%,58%)" }}
                  >
                    {action.desc}
                  </p>
                </div>

                <ArrowRight
                  className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                  style={{ width: 14, height: 14, color: "hsl(220,12%,72%)" }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Chart placeholder — 2/3 */}
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            background: "white",
            border: "1px solid hsl(220,14%,91%)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p
                className="font-semibold"
                style={{ fontSize: 14, color: "hsl(220,30%,14%)" }}
              >
                Visão Geral da Plataforma
              </p>
              <p style={{ fontSize: 12.5, color: "hsl(220,12%,58%)", marginTop: 2 }}>
                Evolução de uso ao longo do tempo
              </p>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center rounded-xl"
            style={{
              height: 200,
              background: "hsl(220,16%,97%)",
              border: "1px dashed hsl(220,14%,86%)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "hsl(172,68%,33%/0.08)" }}
            >
              <TrendingUp style={{ width: 22, height: 22, color: "hsl(172,68%,36%)" }} />
            </div>
            <p
              className="font-semibold"
              style={{ fontSize: 13.5, color: "hsl(220,20%,40%)" }}
            >
              Gráficos em desenvolvimento
            </p>
            <p style={{ fontSize: 12, color: "hsl(220,12%,62%)", marginTop: 4 }}>
              Em breve disponível neste painel
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MasterAdminDashboard;
