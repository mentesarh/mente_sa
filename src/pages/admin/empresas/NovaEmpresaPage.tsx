import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, User } from "lucide-react";
import { useCreateCompany } from "@/hooks/useCompanies";
import { useCreateUser } from "@/hooks/useCreateUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function NovaEmpresaPage() {
  const navigate = useNavigate();
  const createCompany = useCreateCompany();
  const createUser = useCreateUser();

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    is_active: true,
  });

  const [userFormData, setUserFormData] = useState({
    display_name: "",
    email: "",
    password: "",
  });

  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    createCompany.mutate(formData, {
      onSuccess: (company) => {
        setCreatedCompanyId(company.id);
        setShowUserForm(true);
      },
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userFormData.email || !userFormData.display_name) {
      toast.error("E-mail e nome são obrigatórios");
      return;
    }

    if (!createdCompanyId) {
      toast.error("Empresa não encontrada");
      return;
    }

    const result = await createUser.mutateAsync({
      email: userFormData.email,
      password: userFormData.password || undefined,
      role: "empresa_rh",
      display_name: userFormData.display_name,
      company_id: createdCompanyId,
    });

    if (result.success) {
      if (result.password) {
        toast.success(`Usuário criado! Senha gerada: ${result.password}`, {
          duration: 10000,
        });
      }
      navigate("/coordenacao/empresas");
    }
  };

  const handleSkipUser = () => {
    navigate("/coordenacao/empresas");
  };

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/coordenacao/empresas")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {!showUserForm ? (
        <Card className="p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Nova Empresa</h2>
              <p className="text-muted-foreground">Cadastre uma nova empresa parceira</p>
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
                  placeholder="Ex: Tech Solutions Ltda"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
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
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">E-mail</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contato@empresa.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
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
              <Button type="submit" disabled={createCompany.isPending}>
                {createCompany.isPending ? "Criando..." : "Criar Empresa"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <User className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Criar Usuário Empresa</h2>
              <p className="text-muted-foreground">
                Empresa criada com sucesso! Agora crie o usuário de acesso.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="user_display_name">Nome Completo *</Label>
                <Input
                  id="user_display_name"
                  value={userFormData.display_name}
                  onChange={(e) => setUserFormData({ ...userFormData, display_name: e.target.value })}
                  placeholder="Nome do responsável RH"
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
                  placeholder="rh@empresa.com"
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
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se deixar vazio, uma senha será gerada automaticamente
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleSkipUser}>
                Pular
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}


