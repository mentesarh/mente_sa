import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search, Edit, Trash2, Power, UserPlus, Upload, ArrowLeft } from "lucide-react";
import {
  useEmployees,
  useDeleteEmployee,
  useToggleEmployeeActive,
  useCreateEmployee,
  useUpdateEmployee,
  useCreateEmployeesBatch,
} from "@/hooks/useEmployees";
import { useCompanies } from "@/hooks/useCompanies";
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
import { toast } from "sonner";

export default function ColaboradoresPage() {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useEmployees();
  const { data: companies } = useCompanies();
  const deleteEmployee = useDeleteEmployee();
  const toggleActive = useToggleEmployeeActive();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const createEmployeesBatch = useCreateEmployeesBatch();
  const createUser = useCreateUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    id: string | null;
  }>({ open: false, mode: "create", id: null });
  const [userDialog, setUserDialog] = useState<{ open: boolean; employee: any | null }>({
    open: false,
    employee: null,
  });
  const [csvDialog, setCsvDialog] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    company_id: "",
    is_active: true,
  });

  const [userFormData, setUserFormData] = useState({
    display_name: "",
    email: "",
    password: "",
  });

  const filteredEmployees = employees?.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.cpf?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      companyFilter === "all" || employee.company_id === companyFilter;

    return matchesSearch && matchesCompany;
  });

  const handleOpenForm = (employee?: any) => {
    if (employee) {
      setFormDialog({ open: true, mode: "edit", id: employee.id });
      setFormData({
        name: employee.name,
        email: employee.email || "",
        cpf: employee.cpf || "",
        phone: employee.phone || "",
        company_id: employee.company_id || "",
        is_active: employee.is_active,
      });
    } else {
      setFormDialog({ open: true, mode: "create", id: null });
      setFormData({
        name: "",
        email: "",
        cpf: "",
        phone: "",
        company_id: "",
        is_active: true,
      });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.company_id) {
      toast.error("Nome e empresa são obrigatórios");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email || undefined,
      cpf: formData.cpf || undefined,
      phone: formData.phone || undefined,
      company_id: formData.company_id,
      is_active: formData.is_active,
    };

    if (formDialog.mode === "create") {
      createEmployee.mutate(payload, {
        onSuccess: (newEmployee) => {
          setFormDialog({ open: false, mode: "create", id: null });
          // Abrir automaticamente o dialog para criar usuário
          handleOpenUserDialog(newEmployee);
        },
      });
    } else if (formDialog.id) {
      updateEmployee.mutate(
        { id: formDialog.id, ...payload },
        {
          onSuccess: () => setFormDialog({ open: false, mode: "create", id: null }),
        }
      );
    }
  };

  const handleOpenUserDialog = (employee: any) => {
    setUserDialog({ open: true, employee });
    setUserFormData({
      display_name: employee.name,
      email: employee.email || "",
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
      role: "colaborador",
      display_name: userFormData.display_name,
      employee_id: userDialog.employee?.id,
      company_id: userDialog.employee?.company_id,
    });

    if (result.success) {
      if (result.password) {
        toast.success(`Usuário criado! Senha gerada: ${result.password}`, {
          duration: 10000,
        });
      }
      setUserDialog({ open: false, employee: null });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      
      // Skip header
      const dataLines = lines.slice(1);
      
      const parsed = dataLines.map((line, index) => {
        const [company_cnpj_or_name, name, email, cpf, phone] = line.split(",").map((s) => s.trim());
        
        // Find company by CNPJ or name
        const company = companies?.find(
          (c) => c.cnpj === company_cnpj_or_name || c.name === company_cnpj_or_name
        );

        return {
          rowIndex: index + 2,
          company_cnpj_or_name,
          company_id: company?.id || null,
          company_name: company?.name || "Não encontrada",
          name,
          email: email || undefined,
          cpf: cpf || undefined,
          phone: phone || undefined,
          valid: !!company && !!name,
        };
      });

      setCsvPreview(parsed.slice(0, 10)); // Preview primeiras 10 linhas
      setCsvDialog(true);
    };

    reader.readAsText(file);
  };

  const handleImportCsv = () => {
    const validRows = csvPreview.filter((row) => row.valid);
    
    if (validRows.length === 0) {
      toast.error("Nenhuma linha válida para importar");
      return;
    }

    const payload = validRows.map((row) => ({
      company_id: row.company_id!,
      name: row.name,
      email: row.email,
      cpf: row.cpf,
      phone: row.phone,
    }));

    createEmployeesBatch.mutate(payload, {
      onSuccess: () => {
        setCsvDialog(false);
        setCsvPreview([]);
      },
    });
  };

  const handleDelete = () => {
    if (deleteDialog.id) {
      deleteEmployee.mutate(deleteDialog.id);
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
        title="Colaboradores"
        description="Gerencie os colaboradores das empresas"
        actionLabel="Novo Colaborador"
        actionIcon={Plus}
        onAction={() => handleOpenForm()}
      />

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies?.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => document.getElementById("csv-upload")?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV
        </Button>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Table */}
      {filteredEmployees && filteredEmployees.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.company?.name || "-"}</TableCell>
                  <TableCell>{employee.email || "-"}</TableCell>
                  <TableCell>{employee.cpf || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={employee.is_active ? "default" : "secondary"}>
                      {employee.is_active ? "Ativo" : "Inativo"}
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
                        <DropdownMenuItem onClick={() => handleOpenForm(employee)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleOpenUserDialog(employee)}
                          className="text-accent font-medium"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          🔑 Criar Acesso ao Portal
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleActive.mutate({
                              id: employee.id,
                              is_active: !employee.is_active,
                            })
                          }
                        >
                          <Power className="w-4 h-4 mr-2" />
                          {employee.is_active ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog({ open: true, id: employee.id })}
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
            icon={Users}
            title="Nenhum colaborador encontrado"
            description={
              searchTerm || companyFilter !== "all"
                ? "Nenhum colaborador corresponde aos filtros."
                : "Comece adicionando o primeiro colaborador."
            }
            actionLabel={searchTerm || companyFilter !== "all" ? undefined : "Novo Colaborador"}
            onAction={
              searchTerm || companyFilter !== "all" ? undefined : () => handleOpenForm()
            }
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
              {formDialog.mode === "create" ? "Novo Colaborador" : "Editar Colaborador"}
            </DialogTitle>
            <DialogDescription>
              {formDialog.mode === "create"
                ? "Cadastre um novo colaborador"
                : "Atualize os dados do colaborador"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <Label htmlFor="company_id">Empresa *</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
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
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                disabled={createEmployee.isPending || updateEmployee.isPending}
              >
                {createEmployee.isPending || updateEmployee.isPending
                  ? "Salvando..."
                  : formDialog.mode === "create"
                  ? "Criar"
                  : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Preview Dialog */}
      <Dialog open={csvDialog} onOpenChange={setCsvDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização da Importação</DialogTitle>
            <DialogDescription>
              Verifique os dados antes de importar. Apenas linhas válidas serão importadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <p className="font-medium">
                Total: {csvPreview.length} linhas | Válidas:{" "}
                {csvPreview.filter((r) => r.valid).length}
              </p>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Linha</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvPreview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.rowIndex}</TableCell>
                      <TableCell>
                        {row.company_name}
                        {!row.company_id && (
                          <Badge variant="destructive" className="ml-2">
                            Não encontrada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{row.name || "-"}</TableCell>
                      <TableCell>{row.email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={row.valid ? "default" : "destructive"}>
                          {row.valid ? "Válida" : "Inválida"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCsvDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImportCsv} disabled={createEmployeesBatch.isPending}>
                {createEmployeesBatch.isPending ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog
        open={userDialog.open}
        onOpenChange={(open) => setUserDialog({ open, employee: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔑 Criar Acesso ao Portal</DialogTitle>
            <DialogDescription>
              Crie as credenciais de login para <strong>{userDialog.employee?.name}</strong> acessar o portal como Colaborador
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
                onClick={() => setUserDialog({ open: false, employee: null })}
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
        title="Excluir colaborador?"
        description="Esta ação não pode ser desfeita. O colaborador e todos os dados relacionados serão removidos."
      />
    </div>
  );
}

