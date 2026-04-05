import { TrendingUp, Clock, Shield, Award, HeartHandshake, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Redução do Turnover",
    description: "Empresas com programas de saúde mental têm até 40% menos rotatividade.",
  },
  {
    icon: Clock,
    title: "Aumento de Produtividade",
    description: "Colaboradores emocionalmente saudáveis são até 31% mais produtivos.",
  },
  {
    icon: Shield,
    title: "Conformidade LGPD",
    description: "Total separação entre dados administrativos e clínicos.",
  },
  {
    icon: Award,
    title: "Profissionais Qualificados",
    description: "Psicólogos validados pelo CRP e selecionados por curadoria técnica.",
  },
  {
    icon: HeartHandshake,
    title: "Atendimento Humanizado",
    description: "Foco no bem-estar com abordagem ética, acolhedora e personalizada.",
  },
  {
    icon: CheckCircle,
    title: "Implementação Simples",
    description: "Plataforma intuitiva, sem necessidade de treinamento complexo.",
  },
];

const stats = [
  { value: "40%", label: "Redução no absenteísmo", width: "40%" },
  { value: "31%", label: "Aumento na produtividade", width: "31%" },
  { value: "50%", label: "Melhoria no clima organizacional", width: "50%" },
  { value: "95%", label: "Satisfação dos colaboradores", width: "95%" },
];

const BenefitsSection = () => {
  return (
    <section id="empresas" className="page-section bg-secondary/40">
      <div className="container mx-auto px-4 xl:px-6">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* ── Content ───────────────────────────────────── */}
          <div>
            <p className="section-label mb-3">Para Empresas</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              Por que investir em saúde mental corporativa?
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              A saúde mental dos colaboradores impacta diretamente nos resultados.
              Com o Projeto Mente Sã, você oferece um benefício valioso com total controle gerencial.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border card-hover"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-primary-soft border border-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-0.5">
                      {benefit.title}
                    </h4>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Stats card ────────────────────────────────── */}
          <div className="relative">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-elevated">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    Resultados Comprovados
                  </h3>
                  <p className="text-xs text-muted-foreground">Média entre clientes ativos</p>
                </div>
              </div>

              <div className="space-y-5">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className="text-base font-bold text-primary">{stat.value}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full"
                        style={{ width: stat.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 pt-5 border-t border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Dados coletados de empresas parceiras em 2025
                </span>
              </div>
            </div>

            {/* Decorative shadow card */}
            <div className="absolute -z-10 top-3 right-3 w-full h-full bg-primary/4 rounded-2xl border border-primary/8" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
