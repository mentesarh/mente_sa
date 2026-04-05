import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard,
  Calendar,
  User,
  Shield,
  Heart,
  Clock,
  ArrowRight,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSessions";
import { useMemo } from "react";

const navItems = [
  { label: "Início", href: "/colaborador", icon: LayoutDashboard },
  { label: "Agendar Sessão", href: "/colaborador/agendar", icon: Calendar },
  { label: "Minhas Sessões", href: "/colaborador/minhas-sessoes", icon: Clock },
  { label: "Meu Perfil", href: "/colaborador/perfil", icon: User },
];

const ColaboradorDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { data: sessions } = useSessions();

  const userId = user?.id;
  const displayName =
    profile?.display_name || profile?.full_name || user?.email?.split("@")[0] || "Colaborador";
  const firstName = displayName.split(" ")[0];

  const mySessions = useMemo(
    () => (sessions ?? []).filter((s) => s.employee_id === userId),
    [sessions, userId]
  );

  const nextSession = useMemo(() => {
    const now = new Date();
    return mySessions
      .filter(
        (s) =>
          new Date(s.scheduled_at) > now &&
          (s.status === "scheduled" || s.status === "confirmed")
      )
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
  }, [mySessions]);

  const history = useMemo(() => {
    return mySessions
      .filter((s) => s.status === "done")
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
      .slice(0, 3);
  }, [mySessions]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout
      title={`Olá, ${firstName}`}
      subtitle="Cuide da sua saúde mental"
      navItems={navItems}
    >
      {/* Hero card */}
      <div className="bg-gradient-primary rounded-2xl p-8 mb-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6" />
            <span className="font-medium">Projeto Mente Sã</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Seu bem-estar é nossa prioridade
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Você tem acesso a atendimento psicológico profissional e confidencial através do
            benefício oferecido pela sua empresa.
          </p>
          <Button
            size="lg"
            className="bg-background text-primary hover:bg-background/90"
            onClick={() => navigate("/colaborador/agendar")}
          >
            Agendar Sessão
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Próxima sessão */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Próxima Sessão</h3>

          {nextSession ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 p-6 bg-secondary rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg capitalize">
                      {formatDate(nextSession.scheduled_at)}
                    </p>
                    <p className="text-muted-foreground">{formatTime(nextSession.scheduled_at)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {nextSession.psychologist && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{nextSession.psychologist.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">Atendimento online</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[140px]">
                <Button variant="outline" onClick={() => navigate("/colaborador/agendar")}>
                  Reagendar
                </Button>
                <Button variant="ghost" className="text-destructive hover:text-destructive">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">
                Nenhuma sessão agendada
              </h4>
              <p className="text-muted-foreground mb-6">
                Agende uma sessão com um de nossos psicólogos
              </p>
              <Button onClick={() => navigate("/colaborador/agendar")}>
                Agendar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Histórico */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Histórico</h3>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-xs"
                onClick={() => navigate("/colaborador/minhas-sessoes")}
              >
                Ver todas
              </Button>
            )}
          </div>
          {history.length > 0 ? (
            <>
              <div className="space-y-3">
                {history.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {new Date(s.scheduled_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <span className="text-xs text-accent font-medium">Realizada</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {mySessions.filter((s) => s.status === "done").length} sessão(ões) realizada(s)
              </p>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma sessão realizada ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Sigilo */}
      <div className="bg-secondary/50 rounded-2xl p-6 border border-border mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Seu sigilo é garantido</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Todas as informações compartilhadas durante as sessões são estritamente confidenciais.
              Seu empregador não tem acesso a nenhum conteúdo das suas sessões ou informações pessoais
              de saúde. O único dado compartilhado com a empresa é o número agregado de sessões
              utilizadas, sem identificação individual.
            </p>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-auto py-5 flex-col items-start text-left"
          onClick={() => navigate("/colaborador/agendar")}
        >
          <Calendar className="w-5 h-5 mb-1 text-primary" />
          <span className="font-medium text-foreground">Agendar Sessão</span>
          <span className="text-xs text-muted-foreground font-normal">Escolha data e psicólogo</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-5 flex-col items-start text-left"
          onClick={() => navigate("/colaborador/minhas-sessoes")}
        >
          <Clock className="w-5 h-5 mb-1 text-primary" />
          <span className="font-medium text-foreground">Minhas Sessões</span>
          <span className="text-xs text-muted-foreground font-normal">Histórico e próximas</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-5 flex-col items-start text-left"
          onClick={() => navigate("/colaborador/perfil")}
        >
          <MessageCircle className="w-5 h-5 mb-1 text-primary" />
          <span className="font-medium text-foreground">Preciso de Ajuda</span>
          <span className="text-xs text-muted-foreground font-normal">Fale com o suporte</span>
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default ColaboradorDashboard;
