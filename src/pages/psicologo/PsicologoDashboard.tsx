import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSessions";
import { useMemo } from "react";
import { useUpdateSessionStatus } from "@/hooks/useSessions";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", href: "/psicologo", icon: LayoutDashboard },
  { label: "Agenda", href: "/psicologo/agenda", icon: Calendar },
  { label: "Atendimentos", href: "/psicologo/atendimentos", icon: FileText },
  { label: "Pacientes", href: "/psicologo/pacientes", icon: Users },
  { label: "Configurações", href: "/psicologo/configuracoes", icon: Settings },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "confirmed": return { label: "Confirmada", className: "bg-accent/10 text-accent border-0" };
    case "scheduled": return { label: "Pendente", className: "bg-primary/10 text-primary border-0" };
    case "done": return { label: "Realizada", className: "bg-muted text-muted-foreground border-0" };
    default: return { label: status, className: "" };
  }
};

const PsicologoDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { data: sessions } = useSessions();
  const updateStatus = useUpdateSessionStatus();

  const psychologistId = user?.id;
  const displayName =
    profile?.display_name || profile?.full_name || user?.email?.split("@")[0] || "Psicólogo";

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const mySessions = useMemo(() => {
    return (sessions ?? []).filter((s) => s.psychologist_id === psychologistId);
  }, [sessions, psychologistId]);

  const todaySessions = useMemo(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return mySessions
      .filter((s) => {
        const d = new Date(s.scheduled_at);
        return (
          d >= today &&
          d < tomorrow &&
          (s.status === "scheduled" || s.status === "confirmed" || s.status === "done")
        );
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [mySessions, today]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const doneSessions = mySessions.filter((s) => s.status === "done").length;
    const doneThisMonth = mySessions.filter(
      (s) => s.status === "done" && new Date(s.scheduled_at) >= startOfMonth
    ).length;
    const activePatients = new Set(
      mySessions.filter((s) => s.status !== "cancelled").map((s) => s.employee_id)
    ).size;
    const totalDuration = mySessions
      .filter((s) => s.status === "done")
      .reduce((sum, s) => sum + (s.duration_min ?? 50), 0);
    const hoursAttended = Math.round(totalDuration / 60);
    const attended = mySessions.filter((s) => s.status === "done").length;
    const total = mySessions.filter(
      (s) => s.status === "done" || s.status === "no_show"
    ).length;
    const presenceRate = total > 0 ? Math.round((attended / total) * 100) : 100;
    return { doneSessions, doneThisMonth, activePatients, hoursAttended, presenceRate };
  }, [mySessions]);

  const handleConfirm = (id: string) => {
    updateStatus.mutate({ id, status: "confirmed" }, {
      onSuccess: () => toast.success("Sessão confirmada"),
    });
  };

  const handleMarkDone = (id: string) => {
    updateStatus.mutate({ id, status: "done" }, {
      onSuccess: () => toast.success("Sessão marcada como realizada"),
    });
  };

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Bem-vindo(a) de volta, ${displayName}`}
      navItems={navItems}
    >
      {/* Banner hoje */}
      <div className="bg-gradient-primary rounded-2xl p-6 mb-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-primary-foreground/80 text-sm mb-1">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2 className="text-2xl font-bold">
              {todaySessions.length > 0
                ? `${todaySessions.length} sessão${todaySessions.length > 1 ? "ões" : ""} hoje`
                : "Sem sessões hoje"}
            </h2>
            {todaySessions.length > 0 && (
              <p className="text-primary-foreground/80 mt-1">
                Próxima:{" "}
                {new Date(todaySessions[0].scheduled_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {todaySessions[0].employee && ` — ${todaySessions[0].employee.name}`}
              </p>
            )}
          </div>
          <Button
            size="lg"
            className="bg-background text-primary hover:bg-background/90 shadow-elevated"
            onClick={() => navigate("/psicologo/agenda")}
          >
            <CalendarDays className="w-5 h-5 mr-2" />
            Ver Agenda Completa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Sessões Este Mês"
          value={stats.doneThisMonth}
          change="realizadas"
          changeType="positive"
          icon={Calendar}
        />
        <StatCard
          title="Pacientes Ativos"
          value={stats.activePatients}
          change="em acompanhamento"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Taxa de Presença"
          value={`${stats.presenceRate}%`}
          change="dos agendamentos"
          changeType={stats.presenceRate >= 80 ? "positive" : "negative"}
          icon={UserCheck}
        />
        <StatCard
          title="Horas Atendidas"
          value={`${stats.hoursAttended}h`}
          change="total acumulado"
          changeType="neutral"
          icon={Clock}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agenda de hoje */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Agenda de Hoje</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigate("/psicologo/agenda")}
            >
              Ver Semana
            </Button>
          </div>

          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session) => {
                const badge = statusBadge(session.status);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                  >
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-semibold text-foreground">
                        {new Date(session.scheduled_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">{session.duration_min ?? 50} min</p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {session.employee?.name ?? "Colaborador"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {session.company?.name ?? "—"}
                      </p>
                    </div>
                    <Badge className={badge.className}>{badge.label}</Badge>
                    {session.status === "scheduled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 w-9 p-0 shrink-0"
                        onClick={() => handleConfirm(session.id)}
                        title="Confirmar"
                      >
                        <CheckCircle className="w-4 h-4 text-accent" />
                      </Button>
                    )}
                    {session.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 w-9 p-0 shrink-0"
                        onClick={() => handleMarkDone(session.id)}
                        title="Marcar como realizada"
                      >
                        <XCircle className="w-4 h-4 text-primary" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Calendar className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Nenhuma sessão agendada para hoje</p>
              <Button variant="ghost" className="mt-2 text-primary" onClick={() => navigate("/psicologo/agenda")}>
                Ver agenda da semana
              </Button>
            </div>
          )}
        </div>

        {/* Resumo lateral */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumo Geral</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total de sessões</span>
                <span className="font-semibold">{stats.doneSessions}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Horas atendidas</span>
                <span className="font-semibold">{stats.hoursAttended}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pacientes únicos</span>
                <span className="font-semibold">{stats.activePatients}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Presença</span>
                <span
                  className={`font-semibold ${stats.presenceRate >= 80 ? "text-accent" : "text-destructive"}`}
                >
                  {stats.presenceRate}%
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/psicologo/atendimentos")}
            >
              Ver Todos Atendimentos
            </Button>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/psicologo/agenda")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Gerenciar Agenda
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/psicologo/pacientes")}
              >
                <Users className="w-4 h-4 mr-2" />
                Ver Pacientes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/psicologo/configuracoes")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PsicologoDashboard;
