/**
 * BrandPanel — painel esquerdo institucional compartilhado
 * entre Login (seleção de perfil) e LoginFormPage (formulário).
 */
import { Link } from "react-router-dom";
import { Brain, Check, Star } from "lucide-react";

const FEATURES = [
  "Sigilo clínico garantido por lei",
  "Psicólogos certificados pelo CRP",
  "Dashboard gerencial em tempo real",
];

const BrandPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative overflow-hidden flex-col shrink-0">
      {/* ── Base dark gradient ─────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, hsl(222,47%,10%) 0%, hsl(215,30%,7%) 55%, hsl(210,38%,6%) 100%)",
        }}
      />

      {/* ── Atmospheric glows ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Teal glow — upper right */}
        <div
          className="absolute -top-24 -right-12 w-[520px] h-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, hsl(172,68%,40%/0.22) 0%, transparent 68%)",
          }}
        />
        {/* Emerald glow — lower left */}
        <div
          className="absolute -bottom-40 -left-20 w-[460px] h-[460px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, hsl(158,60%,38%/0.14) 0%, transparent 68%)",
          }}
        />
        {/* Center ambient haze */}
        <div
          className="absolute top-[42%] left-[30%] w-[320px] h-[180px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(172,68%,40%/0.07) 0%, transparent 70%)",
          }}
        />

        {/* Decorative concentric ring set — anchored right-center */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[55%]">
          {[600, 460, 320].map((size, i) => (
            <div
              key={size}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: size,
                height: size,
                border: `1px solid rgba(255,255,255,${0.035 - i * 0.008})`,
              }}
            />
          ))}
        </div>

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            opacity: 0.045,
          }}
        />

        {/* Diagonal shimmer line */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 40px)",
          }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full px-10 py-10 xl:px-12 xl:py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group w-fit">
          <div
            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(172,68%,36%), hsl(158,58%,38%))",
              boxShadow: "0 0 28px hsl(172,68%,40%/0.35), 0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none">
            <span
              className="font-bold text-[15px] text-white tracking-[-0.02em] block mb-0.5"
            >
              Mente Sã
            </span>
            <span className="text-[9.5px] font-medium text-white/32 tracking-[0.08em] uppercase">
              Saúde Mental Corporativa
            </span>
          </div>
        </Link>

        {/* Main content — vertically centered */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-[296px] xl:max-w-[316px]">
            {/* Status pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-[5px] mb-7 w-fit"
              style={{
                background: "hsl(172,68%,40%/0.10)",
                border: "1px solid hsl(172,68%,40%/0.22)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "hsl(172,68%,60%)" }}
              />
              <span
                className="text-[10.5px] font-semibold tracking-[0.06em] uppercase"
                style={{ color: "hsl(172,68%,62%)" }}
              >
                Plataforma ativa
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-bold tracking-[-0.025em] leading-[1.08] mb-[18px]">
              <span className="block text-white"
                style={{ fontSize: "clamp(1.75rem, 2.1vw, 2.25rem)" }}
              >
                Cuide de quem
              </span>
              <span
                className="block"
                style={{
                  fontSize: "clamp(1.75rem, 2.1vw, 2.25rem)",
                  background:
                    "linear-gradient(120deg, hsl(172,68%,62%) 0%, hsl(158,60%,62%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                move sua empresa
              </span>
            </h1>

            <p
              className="leading-relaxed mb-8"
              style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.42)" }}
            >
              Conectamos empresas, psicólogos e colaboradores
              numa plataforma ética, segura e construída para
              o ambiente corporativo moderno.
            </p>

            {/* Feature checklist */}
            <ul className="space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "hsl(172,68%,40%/0.18)",
                      border: "1px solid hsl(172,68%,40%/0.32)",
                    }}
                  >
                    <Check
                      className="w-[9px] h-[9px]"
                      style={{ color: "hsl(172,68%,62%)" }}
                      strokeWidth={3}
                    />
                  </div>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)" }}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Testimonial card */}
        <div
          className="rounded-2xl p-5 mb-7"
          style={{
            background: "rgba(255,255,255,0.038)",
            border: "1px solid rgba(255,255,255,0.065)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Stars */}
          <div className="flex gap-0.5 mb-2.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          <p
            className="leading-relaxed mb-3 italic"
            style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.48)" }}
          >
            "O absenteísmo caiu 35% e a satisfação da equipe subiu
            consideravelmente desde que implementamos o Mente Sã."
          </p>

          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, hsl(172,68%,38%), hsl(158,60%,40%))",
              }}
            >
              <span className="text-[9px] font-bold text-white">A</span>
            </div>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>
              Diretora de RH — Empresa parceira, São Paulo
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)" }}>
            © 2026 Projeto Mente Sã
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(172,68%,50%)" }}
            />
            <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.22)" }}>
              Dados protegidos · LGPD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPanel;
