import { Brain, Mail, Phone, MapPin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-sidebar border-t border-white/6">
      <div className="container mx-auto px-4 xl:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-[15px] text-white leading-tight block">Mente Sã</span>
                <span className="text-[10px] text-white/35 leading-tight">Saúde Mental Corporativa</span>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Transformando o bem-estar mental nas empresas através de atendimento psicológico
              de qualidade, ético e acessível.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-sm text-white/80 mb-4">Plataforma</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Como Funciona", href: "/#como-funciona" },
                { label: "Para Empresas", href: "/#empresas" },
                { label: "Blog", href: "#" },
                { label: "Sobre", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors duration-150"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portais */}
          <div>
            <h4 className="font-semibold text-sm text-white/80 mb-4">Portais de Acesso</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Coordenação", path: "/coordenacao" },
                { label: "Empresa (RH)", path: "/empresa" },
                { label: "Psicólogo", path: "/psicologo" },
                { label: "Colaborador", path: "/colaborador" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-sm text-white/80 mb-4">Contato</h4>
            <ul className="space-y-3">
              {[
                { icon: Mail, label: "mentesa.rh@gmail.com", href: "mailto:mentesa.rh@gmail.com" },
                { icon: Phone, label: "(93) 92222-356", href: "tel:+559392222356" },
                {
                  icon: Instagram,
                  label: "@mentesasaudeempresarial",
                  href: "https://instagram.com/mentesasaudeempresarial",
                  external: true,
                },
                { icon: MapPin, label: "São Paulo, SP — Brasil", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white/80 transition-colors duration-150"
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/8 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30">
            © 2026 Projeto Mente Sã. Todos os direitos reservados.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
