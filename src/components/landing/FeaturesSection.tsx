import { Building2, UserCircle, Stethoscope, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Building2,
    title: "Para Empresas (RH)",
    description:
      "Gerencie o benefício de saúde mental da sua equipe com dashboard completo, relatórios gerenciais e total conformidade com a LGPD.",
    benefits: ["Dashboard gerencial completo", "Relatórios de utilização", "Controle de sessões"],
    href: "/empresa",
    accent: "primary",
  },
  {
    icon: Stethoscope,
    title: "Para Psicólogos",
    description:
      "Conecte-se com colaboradores de diversas empresas, gerencie sua agenda e foque no atendimento de qualidade.",
    benefits: ["Gestão de agenda semanal", "Histórico de pacientes", "Relatórios de sessões"],
    href: "/psicologo",
    accent: "accent",
  },
  {
    icon: Users,
    title: "Para Colaboradores",
    description:
      "Acesso fácil e confidencial ao atendimento psicológico. Agende sessões com total sigilo profissional.",
    benefits: ["Agendamento online simples", "Escolha do profissional", "100% sigiloso"],
    href: "/colaborador",
    accent: "primary",
  },
  {
    icon: UserCircle,
    title: "Coordenação Técnica",
    description:
      "Visão completa da operação, gestão de empresas, psicólogos e relatórios consolidados para decisões estratégicas.",
    benefits: ["Dashboard macro completo", "Gestão de parceiros", "Configurações do sistema"],
    href: "/coordenacao",
    accent: "accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="como-funciona" className="page-section bg-background">
      <div className="container mx-auto px-4 xl:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label mb-3">Como Funciona</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Uma plataforma, quatro experiências
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            O Projeto Mente Sã conecta todos os envolvidos no cuidado com a saúde mental corporativa
            de forma simples, segura e eficiente.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/30 card-hover transition-all duration-200"
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200 ${
                    feature.accent === "primary"
                      ? "bg-gradient-primary-soft border border-primary/15 text-primary"
                      : "bg-accent/8 border border-accent/15 text-accent"
                  }`}
                >
                  <feature.icon className="w-5.5 h-5.5" style={{ width: 22, height: 22 }} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-semibold text-foreground mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-1.5 mb-5">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle
                          className={`w-4 h-4 shrink-0 ${
                            feature.accent === "primary" ? "text-primary" : "text-accent"
                          }`}
                        />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={feature.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all duration-150"
                  >
                    Acessar portal
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
