import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Plus, Search, Edit, Trash2, Power, UserPlus, ArrowLeft } from "lucide-react";
import {
  usePsychologists,
  useDeletePsychologist,
  useTogglePsychologistActive,
  useCreatePsychologist,
  useUpdatePsychologist,
} from "@/hooks/usePsychologists";
import { useCreateUser } from "@/hooks/useCreateUser";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

export default function PsicologosPage() {
  const navigate = useNavigate();
  const { data: psychologists, isLoading } = usePsychologists();
  const deletePsychologist = useDeletePsychologist();
  const toggleActive = useTogglePsychologistActive();
  const createPsychologist = useCreatePsychologist();
  const updatePsychologist = useUpdatePsychologist();
  const createUser = useCreateUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    id: string | null;
  }>({ open: false, mode: "create", id: null });
  const [userDialog, setUserDialog] = useState<{ open: boolean; psychologist: any | null }>({
    open: false,
    psychologist: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    crp: "",
    specialties: "",
    is_active: true,
  });

  const [userFormData, setUserFormData] = useState({
    display_name: "",
    email: "",
    password: "",
  });

  const filteredPsychologists = psychologists?.filter(
    (psychologist) =>
      psychologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psychologist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psychologist.crp?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (psychologist?: any) => {
    if (psychologist) {
      setFormDialog({ open: true, mode: "edit", id: psychologist.id });
      setFormData({
        name: psychologist.name,
        email: psychologist.email || "",
        phone: psychologist.phone || "",
        crp: psychologist.crp || "",
        specialties: psychologist.specialties?.join(", ") || "",
        is_active: psychologist.is_active,
      });
    } else {
      setFormDialog({ open: true, mode: "create", id: null });
      setFormData({
        name: "",
        email: "",
        phone: "",
        crp: "",
        specialties: "",
        is_active: true,
      });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }

    const specialtiesArray = formData.specialties
      ? formData.specialties.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      crp: formData.crp || undefined,
      specialties: specialtiesArray.length > 0 ? specialtiesArray : undefined,
      is_active: formData.is_active,
    };

    if (formDialog.mode === "create") {
      createPsychologist.mutate(payload, {
        onSuccess: (newPsychologist) => {
          setFormDialog({ open: false, mode: "create", id: null });
          // Abrir automaticamente o dialog para criar usuário
          handleOpenUserDialog(newPsychologist);
        },
      });
    } else if (formDialog.id) {
      updatePsychologist.mutate(
        { id: formDialog.id, ...payload },
        {
          onSuccess: () => setFormDialog({ open: false, mode: "create", id: null }),
        }
      );
    }
  };

  const handleOpenUserDialog = (psychologist: any) => {
    setUserDialog({ open: true, psychologist });
    setUserFormData({
      display_name: psychologist.name,
      email: psychologist.email || "",
      password: "",
    });
  };

  const handleSubmitUserForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userFormData.email || !userFormData.display_name) {
      toast.error("E-mail e nome são obrigatórios");
      return;
    }

    const result = await createUser.mutateAsync({
      email: userFormData.email,
      password: userFormData.password || undefined,
      role: "psicologo",
      display_name: userFormData.display_name,
      psychologist_id: userDialog.psychologist?.id,
    });

    if (result.success) {
      if (result.password) {
        toast.success(`Usuário criado! Senha gerada: ${result.password}`, {
          duration: 10000,
        });
      }
      setUserDialog({ open: false, psychologist: null });
    }
  };

  const handleDelete = () => {
    if (deleteDialog.id) {
      deletePsychologist.mutate(deleteDialog.id);
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
        title="Psicólogos"
        description="Gerencie os psicólogos parceiros"
        actionLabel="Adicionar Psicólogo"
        actionIcon={Plus}
        onAction={() => handleOpenForm()}
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou CRP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filteredPsychologists && filteredPsychologists.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CRP</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPsychologists.map((psychologist) => (
                <TableRow key={psychologist.id}>
                  <TableCell className="font-medium">{psychologist.name}</TableCell>
                  <TableCell>{psychologist.crp || "-"}</TableCell>
                  <TableCell>{psychologist.email || "-"}</TableCell>
                  <TableCell>{psychologist.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={psychologist.is_active ? "default" : "secondary"}>
                      {psychologist.is_active ? "Ativo" : "Inativo"}
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
                        <DropdownMenuItem onClick={() => handleOpenForm(psychologist)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleOpenUserDialog(psychologist)}
                          className="text-accent font-medium"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          🔑 Criar Acesso ao Portal
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleActive.mutate({
                              id: psychologist.id,
                              is_active: !psychologist.is_active,
                            })
                          }
                        >
                          <Power className="w-4 h-4 mr-2" />
                          {psychologist.is_active ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog({ open: true, id: psychologist.id })}
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
            icon={Stethoscope}
            title="Nenhum psicólogo encontrado"
            description={
              searchTerm
                ? "Nenhum psicólogo corresponde à sua busca."
                : "Comece adicionando o primeiro psicólogo parceiro."
            }
            actionLabel={searchTerm ? undefined : "Adicionar Psicólogo"}
            onAction={searchTerm ? undefined : () => handleOpenForm()}
          />
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog({ open, mode: "create", id: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formDialog.mode === "create" ? "Adicionar Psicólogo" : "Editar Psicólogo"}
            </DialogTitle>
            <DialogDescription>
              {formDialog.mode === "create"
                ? "Cadastre um novo psicólogo parceiro"
                : "Atualize os dados do psicólogo"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. João Silva"
                required
              />
            </div>
            <div>
              <Label htmlFor="crp">CRP</Label>
              <Input
                id="crp"
                value={formData.crp}
                onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                placeholder="CRP 01/12345"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
              <Input
                id="specialties"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="TCC, Psicanálise, Sistêmica"
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
              <Button
                type="submit"
                disabled={createPsychologist.isPending || updatePsychologist.isPending}
              >
                {createPsychologist.isPending || updatePsychologist.isPending
                  ? "Salvando..."
                  : formDialog.mode === "create"
                  ? "Adicionar"
                  : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog
        open={userDialog.open}
        onOpenChange={(open) => setUserDialog({ open, psychologist: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔑 Criar Acesso ao Portal</DialogTitle>
            <DialogDescription>
              Crie as credenciais de login para <strong>{userDialog.psychologist?.name}</strong> acessar o portal como Psicólogo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitUserForm} className="space-y-4">
            <div>
              <Label htmlFor="user_display_name">Nome Completo *</Label>
              <Input
                id="user_display_name"
                value={userFormData.display_name}
                onChange={(e) => setUserFormData({ ...userFormData, display_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="user_email">E-mail *</Label>
              <Input
                id="user_email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="user_password">Senha (deixe vazio para gerar automaticamente)</Label>
              <Input
                id="user_password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserDialog({ open: false, psychologist: null })}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Criando..." : "Criar Usuário"}
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
        title="Excluir psicólogo?"
        description="Esta ação não pode ser desfeita. O psicólogo e todos os dados relacionados serão removidos."
      />
    </div>
  );
}

