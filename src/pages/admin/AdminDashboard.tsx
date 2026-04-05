import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Settings,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { usePsychologists } from "@/hooks/usePsychologists";
import { useEmployees } from "@/hooks/useEmployees";
import { useSessions } from "@/hooks/useSessions";
import { useMemo } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const navItems = [
  { label: "Dashboard", href: "/coordenacao", icon: LayoutDashboard },
  { label: "Empresas", href: "/coordenacao/empresas", icon: Building2 },
  { label: "Psicólogos", href: "/coordenacao/psicologos", icon: Stethoscope },
  { label: "Colaboradores", href: "/coordenacao/colaboradores", icon: Users },
  { label: "Sessões", href: "/coordenacao/sessoes", icon: Calendar },
  { label: "Relatórios", href: "/coordenacao/relatorios", icon: FileText },
  { label: "Configurações", href: "/coordenacao/configuracoes", icon: Settings },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const { data: psychologists, isLoading: loadingPsychologists } = usePsychologists();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: sessions, isLoading: loadingSessions } = useSessions();

  // Calcular estatísticas reais
  const stats = useMemo(() => {
    const activeCompanies = companies?.filter((c) => c.is_active).length || 0;
    const activePsychologists = psychologists?.filter((p) => p.is_active).length || 0;
    const activeEmployees = employees?.filter((e) => e.is_active).length || 0;
    const doneSessions = sessions?.filter((s) => s.status === "done").length || 0;

    // Calcular empresas criadas este mês
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const companiesThisMonth =
      companies?.filter((c) => new Date(c.created_at) >= startOfMonth).length || 0;

    // Calcular psicólogos criados este mês
    const psychologistsThisMonth =
      psychologists?.filter((p) => new Date(p.created_at) >= startOfMonth).length || 0;

    // Calcular sessões do mês atual
    const sessionsThisMonth =
      sessions?.filter((s) => {
        const sessionDate = new Date(s.scheduled_at);
        return sessionDate >= startOfMonth && s.status === "done";
      }).length || 0;

    // Calcular sessões do mês anterior
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sessionsLastMonth =
      sessions?.filter((s) => {
        const sessionDate = new Date(s.scheduled_at);
        return (
          sessionDate >= lastMonthStart &&
          sessionDate <= lastMonthEnd &&
          s.status === "done"
        );
      }).length || 0;

    const sessionsChange =
      sessionsLastMonth > 0
        ? ((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100
        : 0;

    return {
      activeCompanies,
      companiesThisMonth,
      activePsychologists,
      psychologistsThisMonth,
      activeEmployees,
      doneSessions,
      sessionsThisMonth,
      sessionsLastMonth,
      sessionsChange,
    };
  }, [companies, psychologists, employees, sessions]);

  // Atividades recentes baseadas em dados reais
  const recentActivities = useMemo(() => {
    const activities: Array<{ text: string; time: string; type: string }> = [];

    // Últimas empresas criadas
    const recentCompanies = companies
      ?.filter((c) => c.is_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);

    recentCompanies?.forEach((company) => {
      const date = new Date(company.created_at);
      const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
      activities.push({
        text: `Nova empresa cadastrada: ${company.name}`,
        time: hoursAgo < 24 ? `Há ${hoursAgo} horas` : `Há ${Math.floor(hoursAgo / 24)} dias`,
        type: "empresa",
      });
    });

    // Últimas sessões realizadas
    const recentSessions = sessions
      ?.filter((s) => s.status === "done")
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 2);

    recentSessions?.forEach((session) => {
      const date = new Date(session.updated_at);
      const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
      activities.push({
        text: `Sessão realizada: ${session.employee?.name || "Colaborador"} com ${session.psychologist?.name || "Psicólogo"}`,
        time: hoursAgo < 24 ? `Há ${hoursAgo} horas` : `Há ${Math.floor(hoursAgo / 24)} dias`,
        type: "sessao",
      });
    });

    return activities.slice(0, 4); // Limitar a 4 atividades
  }, [companies, sessions]);

  if (loadingCompanies || loadingPsychologists || loadingEmployees || loadingSessions) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Visão geral do Projeto Mente Sã" navItems={navItems}>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Visão geral do Projeto Mente Sã"
      navItems={navItems}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Empresas Ativas"
          value={stats.activeCompanies}
          change={
            stats.companiesThisMonth > 0
              ? `+${stats.companiesThisMonth} este mês`
              : "Nenhuma este mês"
          }
          changeType={stats.companiesThisMonth > 0 ? "positive" : "neutral"}
          icon={Building2}
        />
        <StatCard
          title="Psicólogos Parceiros"
          value={stats.activePsychologists}
          change={
            stats.psychologistsThisMonth > 0
              ? `+${stats.psychologistsThisMonth} este mês`
              : "Nenhum este mês"
          }
          changeType={stats.psychologistsThisMonth > 0 ? "positive" : "neutral"}
          icon={Stethoscope}
        />
        <StatCard
          title="Sessões Realizadas"
          value={stats.doneSessions}
          change={
            stats.sessionsChange !== 0
              ? `${stats.sessionsChange > 0 ? "+" : ""}${stats.sessionsChange.toFixed(0)}% vs mês anterior`
              : "Sem comparação"
          }
          changeType={stats.sessionsChange > 0 ? "positive" : stats.sessionsChange < 0 ? "negative" : "neutral"}
          icon={Calendar}
        />
        <StatCard
          title="Colaboradores Ativos"
          value={stats.activeEmployees}
          change="cadastrados no sistema"
          changeType="neutral"
          icon={Users}
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Sessões por Mês
            </h3>
            <select className="text-sm bg-secondary border-0 rounded-lg px-3 py-2 text-foreground">
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-xl">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Gráfico de evolução</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Atividade Recente
          </h3>
          {recentActivities.length > 0 ? (
            <>
              <div className="space-y-4">
                {recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{activity.text}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-4 text-primary"
                onClick={() => navigate("/coordenacao/relatorios")}
              >
                Ver todas as atividades
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Nova Empresa", icon: Building2, href: "/coordenacao/empresas/novo" },
            { label: "Novo Psicólogo", icon: Stethoscope, href: "/coordenacao/psicologos" },
            { label: "Gerar Relatório", icon: FileText, href: "/coordenacao/relatorios" },
            { label: "Configurações", icon: Settings, href: "/coordenacao/configuracoes" },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate(action.href)}
            >
              <action.icon className="w-6 h-6" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
