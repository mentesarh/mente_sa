import { Routes, Route, Navigate } from "react-router-dom";
import EmpresaDashboard from "./EmpresaDashboard";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// ------------------------------------------------------------------
// Páginas inline da Empresa RH
// ------------------------------------------------------------------
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard, Calendar, Users, FileText,
  Search, Download, Plus, Clock, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/hooks/useEmployees";
import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", href: "/empresa", icon: LayoutDashboard },
  { label: "Colaboradores", href: "/empresa/colaboradores", icon: Users },
  { label: "Agendamentos", href: "/empresa/agendamentos", icon: Calendar },
  { label: "Relatórios", href: "/empresa/relatorios", icon: FileText },
];

// ------ Colaboradores da empresa ------
const EmpresaColaboradores = () => {
  const { profile } = useAuth();
  const { data: employees, isLoading } = useEmployees();
  const [search, setSearch] = useState("");

  const companyId = profile?.company_id;
  const filtered = useMemo(() => {
    return (employees ?? [])
      .filter((e) => e.company_id === companyId)
      .filter(
        (e) =>
          !search ||
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          (e.email ?? "").toLowerCase().includes(search.toLowerCase())
      );
  }, [employees, companyId, search]);

  return (
    <DashboardLayout title="Colaboradores" subtitle="Equipe vinculada à sua empresa" navItems={navItems}>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.email ?? "—"}</TableCell>
                  <TableCell>{e.cpf ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={e.is_active ? "default" : "secondary"}>
                      {e.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState
            icon={Users}
            title="Nenhum colaborador encontrado"
            description={search ? "Ajuste a busca." : "Nenhum colaborador vinculado à sua empresa ainda."}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

// ------ Agendamentos da empresa ------
const EmpresaAgendamentos = () => {
  const { profile } = useAuth();
  const { data: sessions, isLoading } = useSessions();
  const [statusFilter, setStatusFilter] = useState("all");

  const companyId = profile?.company_id;
  const filtered = useMemo(() => {
    return (sessions ?? [])
      .filter((s) => s.company_id === companyId)
      .filter((s) => statusFilter === "all" || s.status === statusFilter)
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  }, [sessions, companyId, statusFilter]);

  const statusLabel: Record<string, string> = {
    scheduled: "Agendada", confirmed: "Confirmada",
    done: "Realizada", cancelled: "Cancelada", no_show: "Faltou",
  };

  return (
    <DashboardLayout title="Agendamentos" subtitle="Sessões da sua empresa" navItems={navItems}>
      <div className="mb-6 flex gap-3 flex-wrap">
        {["all", "scheduled", "confirmed", "done", "cancelled"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "Todos" : statusLabel[s]}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Psicólogo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {new Date(s.scheduled_at).toLocaleString("pt-BR", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{s.employee?.name ?? "—"}</TableCell>
                  <TableCell>{s.psychologist?.name ?? "—"}</TableCell>
                  <TableCell>{s.duration_min ?? 50} min</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.status === "done" ? "default" :
                        s.status === "cancelled" || s.status === "no_show" ? "destructive" :
                        "secondary"
                      }
                    >
                      {statusLabel[s.status] ?? s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState
            icon={Calendar}
            title="Nenhum agendamento encontrado"
            description="Não há agendamentos para o filtro selecionado."
          />
        </div>
      )}
    </DashboardLayout>
  );
};

// ------ Relatórios da empresa ------
const EmpresaRelatorios = () => {
  const { profile } = useAuth();
  const { data: sessions } = useSessions();
  const { data: employees } = useEmployees();

  const companyId = profile?.company_id;

  const stats = useMemo(() => {
    const mySessions = (sessions ?? []).filter((s) => s.company_id === companyId);
    const myEmployees = (employees ?? []).filter((e) => e.company_id === companyId && e.is_active);
    const done = mySessions.filter((s) => s.status === "done").length;
    const cancelled = mySessions.filter((s) => s.status === "cancelled" || s.status === "no_show").length;
    return { total: mySessions.length, done, cancelled, employees: myEmployees.length };
  }, [sessions, employees, companyId]);

  const exportCSV = () => {
    const mySessions = (sessions ?? []).filter((s) => s.company_id === companyId);
    if (mySessions.length === 0) { toast.error("Nenhuma sessão para exportar"); return; }
    const headers = ["Data", "Colaborador", "Psicólogo", "Duração", "Status"];
    const rows = mySessions.map((s) => [
      new Date(s.scheduled_at).toLocaleDateString("pt-BR"),
      s.employee?.name ?? "—",
      s.psychologist?.name ?? "—",
      `${s.duration_min ?? 50} min`,
      s.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Relatório exportado!");
  };

  return (
    <DashboardLayout title="Relatórios" subtitle="Métricas do benefício de saúde mental" navItems={navItems}>
      <div className="mb-6 flex justify-end">
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total de Sessões", value: stats.total, icon: Calendar },
          { label: "Sessões Realizadas", value: stats.done, icon: CheckCircle },
          { label: "Cancelamentos", value: stats.cancelled, icon: Clock },
          { label: "Colaboradores Ativos", value: stats.employees, icon: Users },
        ].map((item) => (
          <div key={item.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-secondary/50 rounded-xl p-5 border border-border text-sm text-muted-foreground">
        <strong className="text-foreground">Nota de privacidade:</strong> Os dados exibidos são
        agregados. Conteúdo clínico individual é protegido pelo sigilo profissional e não está
        disponível para visualização pelo RH.
      </div>
    </DashboardLayout>
  );
};

// ------ Routes ------
const EmpresaRoutes = () => (
  <Routes>
    <Route index element={<EmpresaDashboard />} />
    <Route path="dashboard" element={<EmpresaDashboard />} />
    <Route path="colaboradores" element={<EmpresaColaboradores />} />
    <Route path="agendamentos" element={<EmpresaAgendamentos />} />
    <Route path="relatorios" element={<EmpresaRelatorios />} />
    <Route path="*" element={<Navigate to="/empresa" replace />} />
  </Routes>
);

export default EmpresaRoutes;
