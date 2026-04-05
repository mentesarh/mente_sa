import { ArrowRight, Mail, Phone, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section id="contato" className="page-section relative overflow-hidden bg-gradient-sidebar">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/8 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(220 14% 80%) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 xl:px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 rounded-full px-4 py-1.5 mb-6">
            <MessageCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-semibold text-primary">Fale Conosco</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-5">
            Pronto para transformar a saúde mental da sua empresa?
          </h2>
          <p className="text-[15px] md:text-base text-white/55 mb-10 leading-relaxed max-w-lg mx-auto">
            Entre em contato conosco e descubra como o Projeto Mente Sã pode ajudar
            sua organização a cuidar do bem-estar dos seus colaboradores.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <a href="https://wa.me/559392222356" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/95 shadow-elevated px-8 font-semibold"
              >
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="https://wa.me/559392222356" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/8 hover:border-white/35 px-8"
              >
                Falar com Consultor
              </Button>
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-white/55">
            <a
              href="mailto:mentesa.rh@gmail.com"
              className="flex items-center gap-2 text-sm hover:text-white/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              mentesa.rh@gmail.com
            </a>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <a
              href="tel:+559392222356"
              className="flex items-center gap-2 text-sm hover:text-white/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              (93) 92222-356
            </a>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <a
              href="https://instagram.com/mentesasaudeempresarial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-white/90 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @mentesasaudeempresarial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
