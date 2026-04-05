import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Users, Calendar } from "lucide-react";
import { useCompany, useUpdateCompany } from "@/hooks/useCompanies";
import { useEmployeesByCompany } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

export default function EditarEmpresaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: company, isLoading } = useCompany(id!);
  const { data: employees } = useEmployeesByCompany(id!);
  const updateCompany = useUpdateCompany();

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    is_active: true,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        cnpj: company.cnpj || "",
        contact_name: company.contact_name || "",
        contact_email: company.contact_email || "",
        contact_phone: company.contact_phone || "",
        is_active: company.is_active,
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    updateCompany.mutate(
      { id: id!, ...formData },
      {
        onSuccess: () => navigate("/coordenacao/empresas"),
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return <div>Empresa não encontrada</div>;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/coordenacao/empresas")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="employees">Colaboradores ({employees?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Editar Empresa</h2>
                <p className="text-muted-foreground">Atualize os dados da empresa</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>

                <Separator />

                <h3 className="font-semibold text-foreground">Contato</h3>

                <div>
                  <Label htmlFor="contact_name">Nome do Responsável</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">E-mail</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Empresa ativa</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate("/coordenacao/empresas")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateCompany.isPending}>
                  {updateCompany.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Colaboradores</h3>
                <p className="text-sm text-muted-foreground">
                  {employees?.length || 0} colaborador(es) vinculado(s)
                </p>
              </div>
            </div>

            {employees && employees.length > 0 ? (
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{employee.name}</p>
                      {employee.email && (
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum colaborador vinculado a esta empresa
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


