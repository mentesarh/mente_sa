import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Search, Edit, Trash2, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import {
  useSessions,
  useDeleteSession,
  useUpdateSessionStatus,
  useCreateSession,
  useUpdateSession,
} from "@/hooks/useSessions";
import { useCompanies } from "@/hooks/useCompanies";
import { useEmployees } from "@/hooks/useEmployees";
import { usePsychologists } from "@/hooks/usePsychologists";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { SessionStatus } from "@/data/sessions";
import { toast } from "sonner";

const statusConfig: Record<SessionStatus, { label: string; variant: any }> = {
  scheduled: { label: "Agendada", variant: "secondary" },
  confirmed: { label: "Confirmada", variant: "default" },
  done: { label: "Realizada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
  no_show: { label: "Faltou", variant: "destructive" },
};

export default function SessoesPage() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSessions();
  const { data: companies } = useCompanies();
  const { data: employees } = useEmployees();
  const { data: psychologists } = usePsychologists();
  const deleteSession = useDeleteSession();
  const updateStatus = useUpdateSessionStatus();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    id: string | null;
  }>({ open: false, mode: "create", id: null });

  const [formData, setFormData] = useState({
    company_id: "",
    employee_id: "",
    psychologist_id: "",
    scheduled_at: "",
    duration_min: "50",
    status: "scheduled" as SessionStatus,
    notes: "",
  });

  const filteredSessions = sessions?.filter((session) => {
    const matchesSearch =
      session.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.psychologist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.company?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || session.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const companyEmployees = employees?.filter((e) => e.company_id === formData.company_id);

  const handleOpenForm = (session?: any) => {
    if (session) {
      setFormDialog({ open: true, mode: "edit", id: session.id });
      setFormData({
        company_id: session.company_id || "",
        employee_id: session.employee_id || "",
        psychologist_id: session.psychologist_id || "",
        scheduled_at: session.scheduled_at
          ? new Date(session.scheduled_at).toISOString().slice(0, 16)
          : "",
        duration_min: session.duration_min.toString(),
        status: session.status,
        notes: session.notes || "",
      });
    } else {
      setFormDialog({ open: true, mode: "create", id: null });
      setFormData({
        company_id: "",
        employee_id: "",
        psychologist_id: "",
        scheduled_at: "",
        duration_min: "50",
        status: "scheduled",
        notes: "",
      });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.company_id ||
      !formData.employee_id ||
      !formData.psychologist_id ||
      !formData.scheduled_at
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const payload = {
      company_id: formData.company_id,
      employee_id: formData.employee_id,
      psychologist_id: formData.psychologist_id,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      duration_min: parseInt(formData.duration_min),
      status: formData.status,
      notes: formData.notes || undefined,
    };

    if (formDialog.mode === "create") {
      createSession.mutate(payload, {
        onSuccess: () => setFormDialog({ open: false, mode: "create", id: null }),
      });
    } else if (formDialog.id) {
      updateSession.mutate(
        { id: formDialog.id, ...payload },
        {
          onSuccess: () => setFormDialog({ open: false, mode: "create", id: null }),
        }
      );
    }
  };

  const handleDelete = () => {
    if (deleteDialog.id) {
      deleteSession.mutate(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
    }
  };

  if (isLoading) {
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
        title="Sessões"
        description="Gerencie as sessões agendadas"
        actionLabel="Agendar Sessão"
        actionIcon={Plus}
        onAction={() => handleOpenForm()}
      />

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por colaborador, psicólogo ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredSessions && filteredSessions.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Psicólogo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {new Date(session.scheduled_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{session.employee?.name || "-"}</TableCell>
                  <TableCell>{session.company?.name || "-"}</TableCell>
                  <TableCell>{session.psychologist?.name || "-"}</TableCell>
                  <TableCell>{session.duration_min} min</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[session.status].variant}>
                      {statusConfig[session.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(session)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {session.status === "scheduled" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus.mutate({ id: session.id, status: "confirmed" })
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        {(session.status === "scheduled" || session.status === "confirmed") && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus.mutate({ id: session.id, status: "done" })
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como Realizada
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus.mutate({ id: session.id, status: "cancelled" })
                              }
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus.mutate({ id: session.id, status: "no_show" })
                              }
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Marcar Falta
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog({ open: true, id: session.id })}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            title="Nenhuma sessão encontrada"
            description={
              searchTerm || statusFilter !== "all"
                ? "Nenhuma sessão corresponde aos filtros."
                : "Comece agendando a primeira sessão."
            }
            actionLabel={searchTerm || statusFilter !== "all" ? undefined : "Agendar Sessão"}
            onAction={
              searchTerm || statusFilter !== "all" ? undefined : () => handleOpenForm()
            }
          />
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog({ open, mode: "create", id: null })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formDialog.mode === "create" ? "Agendar Sessão" : "Editar Sessão"}
            </DialogTitle>
            <DialogDescription>
              {formDialog.mode === "create"
                ? "Agende uma nova sessão"
                : "Atualize os dados da sessão"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_id">Empresa *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company_id: value, employee_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employee_id">Colaborador *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                  disabled={!formData.company_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyEmployees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="psychologist_id">Psicólogo *</Label>
              <Select
                value={formData.psychologist_id}
                onValueChange={(value) => setFormData({ ...formData, psychologist_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o psicólogo" />
                </SelectTrigger>
                <SelectContent>
                  {psychologists
                    ?.filter((p) => p.is_active)
                    .map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id}>
                        {psychologist.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_at">Data e Hora *</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration_min">Duração (minutos)</Label>
                <Input
                  id="duration_min"
                  type="number"
                  min="30"
                  max="120"
                  step="10"
                  value={formData.duration_min}
                  onChange={(e) => setFormData({ ...formData, duration_min: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: SessionStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais sobre a sessão"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormDialog({ open: false, mode: "create", id: null })}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createSession.isPending || updateSession.isPending}>
                {createSession.isPending || updateSession.isPending
                  ? "Salvando..."
                  : formDialog.mode === "create"
                  ? "Agendar"
                  : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        onConfirm={handleDelete}
        title="Excluir sessão?"
        description="Esta ação não pode ser desfeita. A sessão será removida permanentemente."
      />
    </div>
  );
}

