import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Users, Save, ArrowLeft } from "lucide-react";
import { useSettings, useUpsertSetting } from "@/hooks/useSettings";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const navigate = useNavigate();
  const { data: settings, isLoading } = useSettings();
  const upsertSetting = useUpsertSetting();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    system_name: "",
    support_email: "",
    session_default_duration: "",
  });

  useEffect(() => {
    if (settings) {
      const systemName = settings.find((s) => s.key === "system_name");
      const supportEmail = settings.find((s) => s.key === "support_email");
      const sessionDuration = settings.find((s) => s.key === "session_default_duration");

      const parseVal = (v: any): string => {
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return JSON.stringify(v);
        // Remove surrounding quotes if stored as JSON string
        const s = String(v);
        try { return JSON.parse(s); } catch { return s; }
      };
      setGeneralSettings({
        system_name: parseVal(systemName?.value),
        support_email: parseVal(supportEmail?.value),
        session_default_duration: sessionDuration ? String(sessionDuration.value) : "50",
      });
    }
  }, [settings]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, display_name, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar perfis:", error);
      toast.error("Erro ao carregar perfis de usuários");
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const results = await Promise.allSettled([
      upsertSetting.mutateAsync({
        key: "system_name",
        value: generalSettings.system_name,
        description: "Nome do sistema",
      }),
      upsertSetting.mutateAsync({
        key: "support_email",
        value: generalSettings.support_email,
        description: "E-mail de suporte",
      }),
      upsertSetting.mutateAsync({
        key: "session_default_duration",
        value: parseInt(generalSettings.session_default_duration) || 50,
        description: "Duração padrão das sessões em minutos",
      }),
    ]);

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0 && failures.length < results.length) {
      toast.warning("Algumas configurações não foram salvas. Tente novamente.");
    }
    // Individual toasts already shown by each mutation's onSuccess/onError
  };

  const roleLabels: Record<string, string> = {
    master_admin: "Master Admin",
    coordenacao: "Coordenação",
    empresa_rh: "Empresa (RH)",
    psicologo: "Psicólogo",
    colaborador: "Colaborador",
    // legado
    admin: "Coordenação",
    empresa: "Empresa (RH)",
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
        title="Configurações"
        description="Ajuste as configurações do sistema"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>Parâmetros globais da plataforma</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="system_name">Nome do Sistema</Label>
                    <Input
                      id="system_name"
                      value={generalSettings.system_name}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, system_name: e.target.value })
                      }
                      placeholder="Mente Sã Connect"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nome exibido no sistema
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="support_email">E-mail de Suporte</Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={generalSettings.support_email}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, support_email: e.target.value })
                      }
                      placeholder="mentesa.rh@gmail.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      E-mail para contato de suporte
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="session_default_duration">Duração Padrão das Sessões (minutos)</Label>
                    <Input
                      id="session_default_duration"
                      type="number"
                      min="30"
                      max="120"
                      step="10"
                      value={generalSettings.session_default_duration}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          session_default_duration: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Duração padrão ao agendar uma nova sessão
                    </p>
                  </div>
                </div>

                <Separator />

                <Button type="submit" disabled={upsertSetting.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {upsertSetting.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Usuários do Sistema</CardTitle>
                  <CardDescription>Visualização dos perfis cadastrados (somente leitura)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProfiles ? (
                <div className="py-8">
                  <LoadingSpinner />
                </div>
              ) : profiles.length > 0 ? (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {profile.display_name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{profile.display_name || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">
                            Criado em {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{roleLabels[profile.role] || profile.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum usuário encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="mt-6 bg-secondary/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Sobre as Configurações</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As configurações gerais afetam todo o sistema. A seção de usuários é apenas para
                visualização - para criar ou editar usuários, utilize as páginas de Empresas,
                Psicólogos ou Colaboradores.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

