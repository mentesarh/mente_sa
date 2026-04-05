import { useState } from "react";
import { UserCog, Search, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { masterAdminNavItems } from "@/pages/master-admin/MasterAdminDashboard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, getRoleLabel } from "@/types/roles";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCreateUser } from "@/hooks/useCreateUser";
import { ArrowLeft } from "lucide-react";

interface ProfileRow {
  id: string;
  role: UserRole;
  display_name: string | null;
  full_name: string | null;
  email: string | null;
  status: string | null;
  created_at: string;
}

const ROLE_VARIANT: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
  master_admin: "destructive",
  coordenacao: "default",
  empresa_rh: "secondary",
  psicologo: "outline",
  colaborador: "outline",
};

function useProfiles() {
  return useQuery({
    queryKey: ["master-admin-profiles"],
    queryFn: async (): Promise<ProfileRow[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, display_name, full_name, email, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });
}

function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-admin-profiles"] });
      toast.success("Role atualizado com sucesso.");
    },
    onError: () => toast.error("Erro ao atualizar role."),
  });
}

function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-admin-profiles"] });
      toast.success("Status do usuário atualizado.");
    },
    onError: () => toast.error("Erro ao atualizar status."),
  });
}

export default function UsuariosPage() {
  const navigate = useNavigate();
  const { data: profiles, isLoading, refetch } = useProfiles();
  const updateRole = useUpdateUserRole();
  const toggleStatus = useToggleUserStatus();
  const createUser = useCreateUser();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [createDialog, setCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    display_name: "",
    email: "",
    password: "",
    role: "colaborador" as UserRole,
  });

  const filtered = profiles?.filter((p) => {
    const matchSearch =
      (p.display_name ?? p.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.display_name) {
      toast.error("E-mail e nome são obrigatórios.");
      return;
    }
    const result = await createUser.mutateAsync({
      email: newUser.email,
      password: newUser.password || undefined,
      role: newUser.role,
      display_name: newUser.display_name,
    });
    if (result.success) {
      if (result.password) {
        toast.success(`Usuário criado! Senha gerada: ${result.password}`, { duration: 10000 });
      }
      setCreateDialog(false);
      setNewUser({ display_name: "", email: "", password: "", role: "colaborador" });
      refetch();
    }
  };

  return (
    <DashboardLayout
      title="Usuários"
      subtitle="Gerencie todos os usuários da plataforma"
      navItems={masterAdminNavItems}
    >
      <Button variant="ghost" onClick={() => navigate("/master-admin")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <PageHeader
        title="Usuários"
        description="Lista completa de usuários cadastrados"
        actionLabel="Novo Usuário"
        actionIcon={Plus}
        onAction={() => setCreateDialog(true)}
      />

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            <SelectItem value="master_admin">Master Admin</SelectItem>
            <SelectItem value="coordenacao">Coordenação</SelectItem>
            <SelectItem value="empresa_rh">Empresa RH</SelectItem>
            <SelectItem value="psicologo">Psicólogo</SelectItem>
            <SelectItem value="colaborador">Colaborador</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} title="Atualizar">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered && filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.display_name ?? p.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANT[p.role] ?? "outline"}>
                      {getRoleLabel(p.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === "ativo" ? "default" : "secondary"}>
                      {p.status ?? "ativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {/* Alterar role */}
                      <Select
                        value={p.role}
                        onValueChange={(val) =>
                          updateRole.mutate({ id: p.id, role: val as UserRole })
                        }
                      >
                        <SelectTrigger className="h-8 w-[130px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="master_admin">Master Admin</SelectItem>
                          <SelectItem value="coordenacao">Coordenação</SelectItem>
                          <SelectItem value="empresa_rh">Empresa RH</SelectItem>
                          <SelectItem value="psicologo">Psicólogo</SelectItem>
                          <SelectItem value="colaborador">Colaborador</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Ativar / inativar */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          toggleStatus.mutate({
                            id: p.id,
                            status: p.status === "ativo" ? "inativo" : "ativo",
                          })
                        }
                      >
                        {p.status === "ativo" ? "Inativar" : "Ativar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState
            icon={UserCog}
            title="Nenhum usuário encontrado"
            description={search || roleFilter !== "all" ? "Ajuste os filtros." : "Nenhum usuário cadastrado ainda."}
          />
        </div>
      )}

      {/* Dialog criar usuário */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Crie um novo usuário na plataforma.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={newUser.display_name}
                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                placeholder="Nome do usuário"
                required
              />
            </div>
            <div>
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="usuario@email.com"
                required
              />
            </div>
            <div>
              <Label>Senha (deixe vazio para gerar automaticamente)</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <Label>Perfil *</Label>
              <Select
                value={newUser.role}
                onValueChange={(val) => setNewUser({ ...newUser, role: val as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master_admin">Master Admin</SelectItem>
                  <SelectItem value="coordenacao">Coordenação</SelectItem>
                  <SelectItem value="empresa_rh">Empresa RH</SelectItem>
                  <SelectItem value="psicologo">Psicólogo</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
