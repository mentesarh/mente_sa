import { Routes, Route, Navigate } from "react-router-dom";
import PsicologoDashboard from "./PsicologoDashboard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// ------------------------------------------------------------------
// Páginas inline do Psicólogo
// ------------------------------------------------------------------
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard, Calendar, FileText, Users, Settings,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock,
  User, Mail, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useSessions, useUpdateSessionStatus } from "@/hooks/useSessions";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", href: "/psicologo", icon: LayoutDashboard },
  { label: "Agenda", href: "/psicologo/agenda", icon: Calendar },
  { label: "Atendimentos", href: "/psicologo/atendimentos", icon: FileText },
  { label: "Pacientes", href: "/psicologo/pacientes", icon: Users },
  { label: "Configurações", href: "/psicologo/configuracoes", icon: Settings },
];

const statusLabel: Record<string, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  done: "Realizada",
  cancelled: "Cancelada",
  no_show: "Faltou",
};

const statusVariant = (status: string): "default" | "secondary" | "destructive" => {
  if (status === "done" || status === "confirmed") return "default";
  if (status === "cancelled" || status === "no_show") return "destructive";
  return "secondary";
};

// Utilitários de semana
const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (d: Date, n: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

// ------ Agenda ------
const PsicologoAgenda = () => {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useSessions();
  const updateStatus = useUpdateSessionStatus();
  const [weekOffset, setWeekOffset] = useState(0);

  const psychologistId = user?.id;

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date());
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const weekSessions = useMemo(() => {
    return (sessions ?? [])
      .filter((s) => s.psychologist_id === psychologistId)
      .filter((s) => {
        const d = new Date(s.scheduled_at);
        return d >= weekStart && d < weekEnd;
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [sessions, psychologistId, weekStart, weekEnd]);

  // Agrupar por dia
  const byDay = useMemo(() => {
    const map: Record<string, typeof weekSessions> = {};
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const key = day.toISOString().split("T")[0];
      map[key] = [];
    }
    weekSessions.forEach((s) => {
      const key = new Date(s.scheduled_at).toISOString().split("T")[0];
      if (map[key]) map[key].push(s);
    });
    return map;
  }, [weekSessions, weekStart]);

  const weekLabel = `${weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${addDays(weekEnd, -1).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <DashboardLayout title="Agenda" subtitle="Sessões da semana" navItems={navItems}>
      {/* Navegação de semana */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-foreground min-w-[200px] text-center">{weekLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        {weekOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
            Hoje
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {Object.entries(byDay).map(([dateKey, daySessions]) => {
            const dayDate = new Date(dateKey + "T12:00:00");
            const isToday = dateKey === new Date().toISOString().split("T")[0];
            return (
              <div key={dateKey} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  className={`px-5 py-3 border-b border-border flex items-center gap-3 ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                >
                  <span className={`text-sm font-semibold capitalize ${isToday ? "text-primary" : "text-foreground"}`}>
                    {formatDate(dayDate)}
                  </span>
                  {isToday && (
                    <Badge variant="default" className="text-xs">Hoje</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {daySessions.length} sessão(ões)
                  </span>
                </div>
                {daySessions.length > 0 ? (
                  <div className="divide-y divide-border">
                    {daySessions.map((s) => (
                      <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="text-center min-w-[52px]">
                          <p className="text-base font-semibold text-foreground">
                            {new Date(s.scheduled_at).toLocaleTimeString("pt-BR", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.duration_min ?? 50} min</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {s.employee?.name ?? "Colaborador"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {s.company?.name ?? "—"}
                          </p>
                        </div>
                        <Badge variant={statusVariant(s.status)}>
                          {statusLabel[s.status] ?? s.status}
                        </Badge>
                        {s.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 shrink-0"
                            title="Confirmar sessão"
                            onClick={() =>
                              updateStatus.mutate({ id: s.id, status: "confirmed" }, {
                                onSuccess: () => toast.success("Sessão confirmada"),
                              })
                            }
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {s.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 shrink-0"
                            title="Marcar como realizada"
                            onClick={() =>
                              updateStatus.mutate({ id: s.id, status: "done" }, {
                                onSuccess: () => toast.success("Sessão marcada como realizada"),
                              })
                            }
                          >
                            <XCircle className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-5 py-4 text-sm text-muted-foreground">Sem sessões neste dia.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

// ------ Atendimentos ------
const PsicologoAtendimentos = () => {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useSessions();
  const [statusFilter, setStatusFilter] = useState("all");

  const psychologistId = user?.id;

  const filtered = useMemo(() => {
    return (sessions ?? [])
      .filter((s) => s.psychologist_id === psychologistId)
      .filter((s) => statusFilter === "all" || s.status === statusFilter)
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  }, [sessions, psychologistId, statusFilter]);

  return (
    <DashboardLayout title="Atendimentos" subtitle="Histórico completo de sessões" navItems={navItems}>
      <div className="mb-6 flex gap-3 flex-wrap">
        {["all", "scheduled", "confirmed", "done", "cancelled", "no_show"].map((s) => (
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
                <TableHead>Paciente</TableHead>
                <TableHead>Empresa</TableHead>
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
                  <TableCell className="font-medium">{s.employee?.name ?? "—"}</TableCell>
                  <TableCell>{s.company?.name ?? "—"}</TableCell>
                  <TableCell>{s.duration_min ?? 50} min</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(s.status)}>
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
            icon={FileText}
            title="Nenhum atendimento encontrado"
            description="Não há registros para o filtro selecionado."
          />
        </div>
      )}
    </DashboardLayout>
  );
};

// ------ Pacientes ------
const PsicologoPacientes = () => {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useSessions();

  const psychologistId = user?.id;

  const patients = useMemo(() => {
    const map = new Map<string, {
      id: string; name: string; company: string;
      totalSessions: number; doneSessions: number; lastSession: string | null;
    }>();

    (sessions ?? [])
      .filter((s) => s.psychologist_id === psychologistId && s.employee?.id)
      .forEach((s) => {
        const empId = s.employee!.id;
        const existing = map.get(empId);
        const isDone = s.status === "done";
        const lastDate = existing?.lastSession ?? null;
        const thisDate = s.scheduled_at;
        const newLast = !lastDate || thisDate > lastDate ? thisDate : lastDate;

        map.set(empId, {
          id: empId,
          name: s.employee!.name,
          company: s.company?.name ?? "—",
          totalSessions: (existing?.totalSessions ?? 0) + 1,
          doneSessions: (existing?.doneSessions ?? 0) + (isDone ? 1 : 0),
          lastSession: newLast,
        });
      });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [sessions, psychologistId]);

  return (
    <DashboardLayout title="Pacientes" subtitle="Colaboradores em acompanhamento" navItems={navItems}>
      {isLoading ? (
        <LoadingSpinner />
      ) : patients.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Sessões Realizadas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Última Sessão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.company}</TableCell>
                  <TableCell>{p.doneSessions}</TableCell>
                  <TableCell>{p.totalSessions}</TableCell>
                  <TableCell>
                    {p.lastSession
                      ? new Date(p.lastSession).toLocaleDateString("pt-BR")
                      : "—"}
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
            title="Nenhum paciente encontrado"
            description="Você ainda não possui sessões registradas."
          />
        </div>
      )}
    </DashboardLayout>
  );
};

// ------ Configurações ------
const PsicologoConfiguracoes = () => {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", profile.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Perfil atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Configurações" subtitle="Dados de perfil e preferências" navItems={navItems}>
      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Informações de Perfil</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="display_name">Nome de exibição</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-secondary rounded-md border border-border text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {profile?.email ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                O e-mail não pode ser alterado aqui.
              </p>
            </div>
            <div>
              <Label>Tipo de acesso</Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-secondary rounded-md border border-border text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                Psicólogo
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </div>

        <div className="bg-secondary/50 rounded-xl border border-border p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Dados clínicos:</strong> Configurações de disponibilidade
          de horários e especialidades são gerenciadas pela coordenação. Entre em contato com o suporte
          para atualizações cadastrais.
        </div>
      </div>
    </DashboardLayout>
  );
};

// ------ Routes ------
const PsicologoRoutes = () => (
  <Routes>
    <Route index element={<PsicologoDashboard />} />
    <Route path="agenda" element={<PsicologoAgenda />} />
    <Route path="atendimentos" element={<PsicologoAtendimentos />} />
    <Route path="pacientes" element={<PsicologoPacientes />} />
    <Route path="configuracoes" element={<PsicologoConfiguracoes />} />
    <Route path="*" element={<Navigate to="/psicologo" replace />} />
  </Routes>
);

export default PsicologoRoutes;
