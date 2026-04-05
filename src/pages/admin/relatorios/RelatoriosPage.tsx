import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Calendar, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { useSessions, useSessionStats } from "@/hooks/useSessions";
import { useCompanies } from "@/hooks/useCompanies";
import { usePsychologists } from "@/hooks/usePsychologists";
import { useEmployees } from "@/hooks/useEmployees";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "sonner";

export default function RelatoriosPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30");
  
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - parseInt(period));
    return date.toISOString();
  }, [period]);

  const endDate = new Date().toISOString();

  const { data: sessions } = useSessions();
  const { data: stats } = useSessionStats(startDate, endDate);
  const { data: companies } = useCompanies();
  const { data: psychologists } = usePsychologists();
  const { data: employees } = useEmployees();

  const filteredSessions = useMemo(() => {
    return sessions?.filter(
      (s) =>
        new Date(s.scheduled_at) >= new Date(startDate) &&
        new Date(s.scheduled_at) <= new Date(endDate)
    );
  }, [sessions, startDate, endDate]);

  const exportToCSV = () => {
    if (!filteredSessions || filteredSessions.length === 0) {
      toast.error("Nenhuma sessão para exportar");
      return;
    }

    const headers = [
      "Data/Hora",
      "Empresa",
      "Colaborador",
      "Psicólogo",
      "Duração (min)",
      "Status",
      "Observações",
    ];

    const rows = filteredSessions.map((session) => [
      new Date(session.scheduled_at).toLocaleString("pt-BR"),
      session.company?.name || "-",
      session.employee?.name || "-",
      session.psychologist?.name || "-",
      session.duration_min.toString(),
      session.status,
      session.notes || "-",
    ]);

    const csvContent =
      [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-sessoes-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Relatório exportado com sucesso!");
  };

  const activeCompanies = companies?.filter((c) => c.is_active).length || 0;
  const activePsychologists = psychologists?.filter((p) => p.is_active).length || 0;
  const activeEmployees = employees?.filter((e) => e.is_active).length || 0;

  // Calcular sessões por empresa
  const sessionsByCompany = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    filteredSessions?.forEach((session) => {
      if (session.company_id && session.company) {
        const existing = map.get(session.company_id) || { name: session.company.name, count: 0 };
        map.set(session.company_id, { ...existing, count: existing.count + 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredSessions]);

  // Calcular sessões por psicólogo
  const sessionsByPsychologist = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    filteredSessions?.forEach((session) => {
      if (session.psychologist_id && session.psychologist) {
        const existing = map.get(session.psychologist_id) || {
          name: session.psychologist.name,
          count: 0,
        };
        map.set(session.psychologist_id, { ...existing, count: existing.count + 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredSessions]);

  if (!stats) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate("/coordenacao")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Dashboard
      </Button>

      <PageHeader
        title="Relatórios"
        description="Visualize métricas e indicadores do programa"
      />

      {/* Period Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Período:</span>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportToCSV} className="ml-auto">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total de Sessões"
          value={stats.total}
          change={`${period} dias`}
          changeType="neutral"
          icon={Calendar}
        />
        <StatCard
          title="Sessões Realizadas"
          value={stats.done}
          change={`${stats.total > 0 ? ((stats.done / stats.total) * 100).toFixed(1) : 0}%`}
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Taxa de Cancelamento"
          value={`${stats.cancellationRate.toFixed(1)}%`}
          change={`${stats.cancelled + stats.noShow} sessões`}
          changeType={stats.cancellationRate > 15 ? "negative" : "positive"}
          icon={TrendingDown}
        />
        <StatCard
          title="Empresas Ativas"
          value={activeCompanies}
          change={`${activePsychologists} psicólogos`}
          changeType="neutral"
          icon={FileText}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sessions by Company */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões por Empresa</CardTitle>
            <CardDescription>Empresas com mais sessões no período</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsByCompany.length > 0 ? (
              <div className="space-y-3">
                {sessionsByCompany.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.count} sessões</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma sessão no período</p>
            )}
          </CardContent>
        </Card>

        {/* Sessions by Psychologist */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões por Psicólogo</CardTitle>
            <CardDescription>Psicólogos com mais atendimentos</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsByPsychologist.length > 0 ? (
              <div className="space-y-3">
                {sessionsByPsychologist.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.count} sessões</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma sessão no período</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>Análise detalhada das sessões no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-secondary rounded-xl">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-xl">
              <p className="text-3xl font-bold text-accent">{stats.done}</p>
              <p className="text-sm text-muted-foreground mt-1">Realizadas</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-xl">
              <p className="text-3xl font-bold text-primary">
                {stats.total - stats.done - stats.cancelled - stats.noShow}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Agendadas</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-xl">
              <p className="text-3xl font-bold text-destructive">{stats.cancelled}</p>
              <p className="text-sm text-muted-foreground mt-1">Canceladas</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-xl">
              <p className="text-3xl font-bold text-destructive">{stats.noShow}</p>
              <p className="text-sm text-muted-foreground mt-1">Faltas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="mt-8 grid sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Colaboradores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">{activeEmployees}</p>
            <p className="text-sm text-muted-foreground mt-2">Ativos no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Psicólogos Parceiros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">{activePsychologists}</p>
            <p className="text-sm text-muted-foreground mt-2">Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Empresas Parceiras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">{activeCompanies}</p>
            <p className="text-sm text-muted-foreground mt-2">Ativas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

