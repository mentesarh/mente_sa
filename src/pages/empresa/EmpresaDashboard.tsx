import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSessions";
import { useEmployees } from "@/hooks/useEmployees";
import { useMemo } from "react";

const navItems = [
  { label: "Dashboard", href: "/empresa", icon: LayoutDashboard },
  { label: "Colaboradores", href: "/empresa/colaboradores", icon: Users },
  { label: "Agendamentos", href: "/empresa/agendamentos", icon: Calendar },
  { label: "Relatórios", href: "/empresa/relatorios", icon: FileText },
];

const EmpresaDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: sessions } = useSessions();
  const { data: employees } = useEmployees();

  const companyId = profile?.company_id;
  const companyName = profile?.display_name || profile?.full_name || "Minha Empresa";

  const stats = useMemo(() => {
    const myEmployees = employees?.filter((e) => e.company_id === companyId) ?? [];
    const mySessions = sessions?.filter((s) => s.company_id === companyId) ?? [];

    const activeEmployees = myEmployees.filter((e) => e.is_active).length;
    const doneSessions = mySessions.filter((s) => s.status === "done").length;
    const scheduledSessions = mySessions.filter(
      (s) => s.status === "scheduled" || s.status === "confirmed"
    ).length;
    const cancelledSessions = mySessions.filter(
      (s) => s.status === "cancelled" || s.status === "no_show"
    ).length;
    const totalSessions = mySessions.length;
    const usageRate =
      activeEmployees > 0 ? Math.round((doneSessions / Math.max(activeEmployees, 1)) * 100) : 0;

    return {
      activeEmployees,
      doneSessions,
      scheduledSessions,
      cancelledSessions,
      totalSessions,
      usageRate,
    };
  }, [employees, sessions, companyId]);

  const recentSessions = useMemo(() => {
    return (sessions ?? [])
      .filter((s) => s.company_id === companyId)
      .sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      )
      .slice(0, 5);
  }, [sessions, companyId]);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Gestão de saúde mental — ${companyName}`}
      navItems={navItems}
    >
      {/* Alerta se taxa de uso alta */}
      {stats.usageRate > 70 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">
              Sua taxa de utilização está em {stats.usageRate}%. Incentive mais colaboradores a usarem o benefício.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/empresa/colaboradores")}>
            Ver Colaboradores
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Colaboradores Ativos"
          value={stats.activeEmployees}
          change="com acesso ao benefício"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Sessões Realizadas"
          value={stats.doneSessions}
          change="sessões concluídas"
          changeType="positive"
          icon={Calendar}
        />
        <StatCard
          title="Taxa de Utilização"
          value={`${stats.usageRate}%`}
          change="sessões por colaborador ativo"
          changeType={stats.usageRate > 50 ? "positive" : "neutral"}
          icon={TrendingUp}
        />
        <StatCard
          title="Agendamentos Futuros"
          value={stats.scheduledSessions}
          change="sessões agendadas"
          changeType="neutral"
          icon={Calendar}
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Utilização */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Resumo de Utilização</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Sessões realizadas</span>
                <span className="font-medium">{stats.doneSessions} / {stats.totalSessions} totais</span>
              </div>
              <Progress
                value={stats.totalSessions > 0 ? (stats.doneSessions / stats.totalSessions) * 100 : 0}
                className="h-3"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center p-4 bg-secondary rounded-xl">
                <p className="text-2xl font-bold text-accent">{stats.doneSessions}</p>
                <p className="text-xs text-muted-foreground">Realizadas</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <p className="text-2xl font-bold text-primary">{stats.scheduledSessions}</p>
                <p className="text-xs text-muted-foreground">Agendadas</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <p className="text-2xl font-bold text-destructive">{stats.cancelledSessions}</p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessões recentes */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Sessões Recentes</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigate("/empresa/agendamentos")}
            >
              Ver todas
            </Button>
          </div>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {s.employee?.name ?? "Colaborador"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.scheduled_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      s.status === "done"
                        ? "bg-accent/10 text-accent"
                        : s.status === "cancelled" || s.status === "no_show"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {s.status === "done"
                      ? "Realizada"
                      : s.status === "cancelled"
                      ? "Cancelada"
                      : s.status === "no_show"
                      ? "Faltou"
                      : "Agendada"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma sessão encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Relatórios */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Relatórios Gerenciais</h3>
          <Button variant="outline" size="sm" onClick={() => navigate("/empresa/relatorios")}>
            <Download className="w-4 h-4 mr-2" />
            Ver Relatórios
          </Button>
        </div>
        <p className="text-sm text-muted-foreground p-4 bg-secondary/50 rounded-xl">
          <strong>Nota de privacidade:</strong> Os relatórios contêm apenas dados estatísticos
          agregados. Informações individuais de colaboradores são protegidas pelo sigilo clínico.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default EmpresaDashboard;
