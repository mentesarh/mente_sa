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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { usePsychologists } from "@/hooks/usePsychologists";
import { useEmployees } from "@/hooks/useEmployees";
import { useMemo } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

export const masterAdminNavItems = [
  { label: "Dashboard", href: "/master-admin", icon: LayoutDashboard },
  { label: "Usuários", href: "/master-admin/usuarios", icon: UserCog },
  { label: "Empresas", href: "/master-admin/empresas", icon: Building2 },
  { label: "Psicólogos", href: "/master-admin/psicologos", icon: Stethoscope },
  { label: "Colaboradores", href: "/master-admin/colaboradores", icon: Users },
  { label: "Relatórios", href: "/master-admin/relatorios", icon: FileText },
  { label: "Configurações", href: "/master-admin/configuracoes", icon: Settings },
];

const MasterAdminDashboard = () => {
  const navigate = useNavigate();
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const { data: psychologists, isLoading: loadingPsychologists } = usePsychologists();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();

  const stats = useMemo(() => {
    const activeCompanies = companies?.filter((c) => c.is_active).length || 0;
    const activePsychologists = psychologists?.filter((p) => p.is_active).length || 0;
    const activeEmployees = employees?.filter((e) => e.is_active).length || 0;
    const totalUsers = activeCompanies + activePsychologists + activeEmployees;
    return { activeCompanies, activePsychologists, activeEmployees, totalUsers };
  }, [companies, psychologists, employees]);

  if (loadingCompanies || loadingPsychologists || loadingEmployees) {
    return (
      <DashboardLayout
        title="Master Admin"
        subtitle="Controle total da plataforma"
        navItems={masterAdminNavItems}
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Master Admin"
      subtitle="Controle total da plataforma Mente Sã"
      navItems={masterAdminNavItems}
    >
      {/* Banner de acesso total */}
      <div className="mb-6 flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          Você tem acesso total à plataforma. Todas as operações ficam registradas em log de auditoria.
        </p>
        <Badge variant="default" className="ml-auto shrink-0">Master Admin</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
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

      {/* Ações rápidas */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gerenciar Usuários", icon: UserCog, href: "/master-admin/usuarios" },
            { label: "Nova Empresa", icon: Building2, href: "/master-admin/empresas" },
            { label: "Novo Psicólogo", icon: Stethoscope, href: "/master-admin/psicologos" },
            { label: "Relatórios", icon: TrendingUp, href: "/master-admin/relatorios" },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate(action.href)}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-sm text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Gráfico placeholder */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Visão Geral da Plataforma</h3>
        </div>
        <div className="h-48 flex items-center justify-center bg-secondary/50 rounded-xl">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Gráficos em desenvolvimento</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MasterAdminDashboard;
