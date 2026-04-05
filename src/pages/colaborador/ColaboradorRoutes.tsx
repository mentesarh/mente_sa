import { Routes, Route, Navigate } from "react-router-dom";
import ColaboradorDashboard from "./ColaboradorDashboard";

// ------------------------------------------------------------------
// Páginas inline do Colaborador
// ------------------------------------------------------------------
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard, Calendar, Clock, User,
  Mail, Save, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSessions, useCreateSession } from "@/hooks/useSessions";
import { usePsychologists } from "@/hooks/usePsychologists";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { label: "Início", href: "/colaborador", icon: LayoutDashboard },
  { label: "Agendar Sessão", href: "/colaborador/agendar", icon: Calendar },
  { label: "Minhas Sessões", href: "/colaborador/minhas-sessoes", icon: Clock },
  { label: "Meu Perfil", href: "/colaborador/perfil", icon: User },
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

// ------ Agendar Sessão ------
const ColaboradorAgendar = () => {
  const { user, profile } = useAuth();
  const { data: psychologists, isLoading: loadingPsychologists } = usePsychologists();
  const createSession = useCreateSession();

  const [psychologistId, setPsychologistId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  const activePsychologists = useMemo(
    () => (psychologists ?? []).filter((p) => p.is_active),
    [psychologists]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!psychologistId) {
      toast.error("Selecione um psicólogo");
      return;
    }
    if (!scheduledAt) {
      toast.error("Informe a data e horário");
      return;
    }
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    if (!profile?.company_id) {
      toast.error("Sua conta não está vinculada a uma empresa. Entre em contato com o RH.");
      return;
    }

    // Validar data no futuro
    if (new Date(scheduledAt) <= new Date()) {
      toast.error("A data deve ser no futuro");
      return;
    }

    createSession.mutate(
      {
        company_id: profile.company_id,
        employee_id: user.id,
        psychologist_id: psychologistId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setPsychologistId("");
          setScheduledAt("");
          setNotes("");
        },
      }
    );
  };

  // Mínimo: 1h a partir de agora
  const minDateTime = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  }, []);

  return (
    <DashboardLayout title="Agendar Sessão" subtitle="Escolha um psicólogo e horário" navItems={navItems}>
      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="psychologist">Psicólogo</Label>
              {loadingPsychologists ? (
                <p className="text-sm text-muted-foreground mt-2">Carregando psicólogos...</p>
              ) : activePsychologists.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">
                  Nenhum psicólogo disponível no momento.
                </p>
              ) : (
                <Select value={psychologistId} onValueChange={setPsychologistId}>
                  <SelectTrigger id="psychologist" className="mt-1">
                    <SelectValue placeholder="Selecione um psicólogo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activePsychologists.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex flex-col text-left">
                          <span>{p.name}</span>
                          {p.crp && (
                            <span className="text-xs text-muted-foreground">CRP: {p.crp}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="scheduled_at">Data e Horário</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                min={minDateTime}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Prefiro atendimento matutino"
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createSession.isPending || activePsychologists.length === 0}
            >
              {createSession.isPending ? "Agendando..." : (
                <>
                  Confirmar Agendamento
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="bg-secondary/50 rounded-xl border border-border p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Sigilo garantido:</strong> Suas sessões são totalmente
          confidenciais. O RH da sua empresa não tem acesso ao conteúdo das sessões.
        </div>
      </div>
    </DashboardLayout>
  );
};

// ------ Minhas Sessões ------
const ColaboradorMinhasSessoes = () => {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useSessions();
  const [statusFilter, setStatusFilter] = useState("all");

  const userId = user?.id;

  const filtered = useMemo(() => {
    return (sessions ?? [])
      .filter((s) => s.employee_id === userId)
      .filter((s) => statusFilter === "all" || s.status === statusFilter)
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  }, [sessions, userId, statusFilter]);

  return (
    <DashboardLayout title="Minhas Sessões" subtitle="Histórico e sessões futuras" navItems={navItems}>
      <div className="mb-6 flex gap-3 flex-wrap">
        {["all", "scheduled", "confirmed", "done", "cancelled"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "Todas" : statusLabel[s]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Psicólogo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const isUpcoming =
                  new Date(s.scheduled_at) > new Date() &&
                  (s.status === "scheduled" || s.status === "confirmed");
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isUpcoming && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" title="Próxima sessão" />
                        )}
                        {new Date(s.scheduled_at).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{s.psychologist?.name ?? "—"}</TableCell>
                    <TableCell>{s.duration_min ?? 50} min</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(s.status)}>
                        {statusLabel[s.status] ?? s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState
            icon={Clock}
            title="Nenhuma sessão encontrada"
            description={
              statusFilter === "all"
                ? "Você ainda não possui sessões. Agende sua primeira consulta!"
                : "Não há sessões para o filtro selecionado."
            }
          />
        </div>
      )}
    </DashboardLayout>
  );
};

// ------ Meu Perfil ------
const ColaboradorPerfil = () => {
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
      toast.success("Perfil atualizado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Meu Perfil" subtitle="Suas informações pessoais" navItems={navItems}>
      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {(profile?.display_name ?? profile?.full_name ?? "C")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">
                {profile?.display_name || profile?.full_name || "Colaborador"}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">Colaborador</Badge>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="display_name">Nome de exibição</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                className="mt-1"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-secondary rounded-md border border-border text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {profile?.email ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para alterar o e-mail, entre em contato com o suporte.
              </p>
            </div>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </div>

        <div className="bg-secondary/50 rounded-xl border border-border p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Privacidade:</strong> Seus dados pessoais de saúde e
          o conteúdo das suas sessões são protegidos por sigilo profissional e não são compartilhados
          com sua empresa.
        </div>
      </div>
    </DashboardLayout>
  );
};

// ------ Routes ------
const ColaboradorRoutes = () => (
  <Routes>
    <Route index element={<ColaboradorDashboard />} />
    <Route path="agendar" element={<ColaboradorAgendar />} />
    <Route path="minhas-sessoes" element={<ColaboradorMinhasSessoes />} />
    <Route path="perfil" element={<ColaboradorPerfil />} />
    <Route path="*" element={<Navigate to="/colaborador" replace />} />
  </Routes>
);

export default ColaboradorRoutes;
