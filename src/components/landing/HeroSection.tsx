import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Heart, Users, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero pt-16 overflow-hidden flex items-center">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[80px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(220 30% 10% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(220 30% 10% / 1) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 xl:px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-8 xl:gap-16">
          {/* ── Content ───────────────────────────────────── */}
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/16 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-up">
              <Shield className="w-3.5 h-3.5" />
              100% Confidencial e Ético
            </div>

            <h1
              className="text-4xl md:text-5xl xl:text-[3.5rem] font-bold text-foreground leading-[1.1] tracking-tight mb-5 animate-fade-up"
              style={{ animationDelay: "0.08s" }}
            >
              Saúde mental que{" "}
              <span className="text-gradient">transforma</span>{" "}
              equipes
            </h1>

            <p
              className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-up"
              style={{ animationDelay: "0.16s" }}
            >
              Plataforma completa que conecta empresas, colaboradores e psicólogos qualificados.
              Gestão simplificada, atendimento humanizado e total conformidade com a LGPD.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10 animate-fade-up"
              style={{ animationDelay: "0.24s" }}
            >
              <a href="https://wa.me/559392222356" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto shadow-primary px-7">
                  Começar Agora
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-7">
                  Acessar Plataforma
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div
              className="flex flex-wrap items-center gap-4 justify-center lg:justify-start animate-fade-up"
              style={{ animationDelay: "0.32s" }}
            >
              {[
                "Psicólogos certificados CRP",
                "Dados protegidos LGPD",
                "Suporte dedicado",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── Visual ────────────────────────────────────── */}
          <div
            className="flex-1 max-w-sm w-full animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative">
              {/* Main dashboard card */}
              <div className="bg-card rounded-2xl border border-border shadow-elevated p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Bem-estar Mental</p>
                      <p className="text-xs text-muted-foreground">Relatório do mês</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-accent" />
                    <span className="text-xs font-semibold">4.9</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { value: "124", label: "Sessões" },
                    { value: "98%", label: "Satisfação" },
                    { value: "45", label: "Colaboradores" },
                  ].map((s) => (
                    <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-foreground leading-tight">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {[
                    { icon: Shield, text: "Sigilo clínico garantido", color: "text-primary" },
                    { icon: Users, text: "Psicólogos certificados CRP", color: "text-accent" },
                    { icon: Heart, text: "Atendimento humanizado", color: "text-primary" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-secondary rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center shrink-0 shadow-xs">
                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <span className="text-sm text-foreground font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl px-3 py-2 shadow-elevated flex items-center gap-2 animate-float">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-semibold text-foreground">200+ psicólogos</span>
              </div>

              {/* Floating badge 2 */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-3 py-2 shadow-elevated flex items-center gap-2 animate-float" style={{ animationDelay: "1.2s" }}>
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">LGPD Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────── */}
        <div
          className="mt-16 lg:mt-20 grid grid-cols-3 gap-4 md:gap-0 md:flex md:items-center md:justify-center md:divide-x md:divide-border animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: "500+", label: "Empresas parceiras" },
            { value: "50.000+", label: "Colaboradores atendidos" },
            { value: "200+", label: "Psicólogos qualificados" },
          ].map((stat) => (
            <div key={stat.label} className="text-center md:px-12">
              <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
