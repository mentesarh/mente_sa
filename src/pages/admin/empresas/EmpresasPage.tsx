import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Search, Edit, Trash2, Power, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useCompanies, useDeleteCompany, useToggleCompanyActive } from "@/hooks/useCompanies";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function EmpresasPage() {
  const navigate = useNavigate();
  const { data: companies, isLoading } = useCompanies();
  const deleteCompany = useDeleteCompany();
  const toggleActive = useToggleCompanyActive();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const filteredCompanies = companies?.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.id) {
      deleteCompany.mutate(deleteDialog.id);
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
        title="Empresas"
        description="Gerencie as empresas parceiras"
        actionLabel="Nova Empresa"
        actionIcon={Plus}
        onAction={() => navigate("/coordenacao/empresas/novo")}
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filteredCompanies && filteredCompanies.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.cnpj || "-"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {company.contact_name && <div>{company.contact_name}</div>}
                      {company.contact_email && (
                        <div className="text-muted-foreground">{company.contact_email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.is_active ? "default" : "secondary"}>
                      {company.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(company.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/coordenacao/empresas/${company.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Ver/Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleActive.mutate({ id: company.id, is_active: !company.is_active })
                          }
                        >
                          <Power className="w-4 h-4 mr-2" />
                          {company.is_active ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog({ open: true, id: company.id })}
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
            icon={Building2}
            title="Nenhuma empresa encontrada"
            description={
              searchTerm
                ? "Nenhuma empresa corresponde à sua busca."
                : "Comece cadastrando a primeira empresa parceira."
            }
            actionLabel={searchTerm ? undefined : "Nova Empresa"}
            onAction={searchTerm ? undefined : () => navigate("/coordenacao/empresas/novo")}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        onConfirm={handleDelete}
        title="Excluir empresa?"
        description="Esta ação não pode ser desfeita. A empresa e todos os dados relacionados serão removidos."
      />
    </div>
  );
}

