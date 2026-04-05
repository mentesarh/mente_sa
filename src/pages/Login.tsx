import { Link, useNavigate } from "react-router-dom";
import { Brain, ShieldCheck, ArrowRight } from "lucide-react";
import { PUBLIC_LOGIN_PROFILES, getDashboardRouteByRole } from "@/types/roles";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import BrandPanel from "@/components/auth/BrandPanel";

// ── Visual identity per profile — paleta baseada no teal do site ──
const PROFILE_STYLES = {
  coordenacao: {
    iconBg: "hsl(172 68% 33% / 0.10)",
    iconColor: "hsl(172, 68%, 28%)",
    accent: "hsl(172, 68%, 30%)",
    accentHex: "#157a6e",
    hoverShadow: "0 4px 24px -4px hsl(172 68% 33% / 0.18)",
    hoverBorder: "hsl(172 68% 33% / 0.32)",
    tag: "Administração",
  },
  empresa: {
    iconBg: "hsl(196 60% 36% / 0.10)",
    iconColor: "hsl(196, 62%, 30%)",
    accent: "hsl(196, 62%, 32%)",
    accentHex: "#1a6b82",
    hoverShadow: "0 4px 24px -4px hsl(196 60% 36% / 0.18)",
    hoverBorder: "hsl(196 60% 36% / 0.32)",
    tag: "Gestão",
  },
  psicologo: {
    iconBg: "hsl(158 58% 36% / 0.10)",
    iconColor: "hsl(158, 60%, 28%)",
    accent: "hsl(158, 60%, 30%)",
    accentHex: "#1a6b4a",
    hoverShadow: "0 4px 24px -4px hsl(158 58% 36% / 0.18)",
    hoverBorder: "hsl(158 58% 36% / 0.32)",
    tag: "Clínico",
  },
  colaborador: {
    iconBg: "hsl(185 62% 34% / 0.10)",
    iconColor: "hsl(185, 64%, 28%)",
    accent: "hsl(185, 64%, 30%)",
    accentHex: "#186e7a",
    hoverShadow: "0 4px 24px -4px hsl(185 62% 34% / 0.18)",
    hoverBorder: "hsl(185 62% 34% / 0.32)",
    tag: "Benefício",
  },
} as const;

type ProfileSlug = keyof typeof PROFILE_STYLES;

const Login = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && role) {
      navigate(getDashboardRouteByRole(role), { replace: true });
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "hsl(215,30%,7%)" }}
      >
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: "hsl(172,68%,40%/0.20)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "hsl(172,68%,50%)" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — shared branding ─────────────────── */}
      <BrandPanel />

      {/* ── Right panel — profile selection ──────────────── */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ background: "hsl(220,20%,97%)" }}
      >
        {/* Subtle ambient decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(172,68%,40%/0.055) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-32 -left-16 w-[380px] h-[380px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(158,60%,38%/0.04) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[432px] px-6 py-10 sm:px-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, hsl(172,68%,36%), hsl(158,58%,38%))",
                boxShadow: "0 0 16px hsl(172,68%,40%/0.30)",
              }}
            >
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[15px] text-foreground tracking-tight block leading-none">
                Mente Sã
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                Saúde Mental Corporativa
              </span>
            </div>
          </div>

          <div className="animate-fade-in">
            {/* ── Header ──────────────────────────────────────── */}
            <div className="mb-8">
              <p
                className="text-[10.5px] font-bold uppercase tracking-[0.1em] mb-2"
                style={{ color: "hsl(172,68%,36%)" }}
              >
                Portal de Acesso
              </p>
              <h2 className="text-[1.65rem] font-bold text-foreground tracking-[-0.025em] leading-tight mb-1">
                Bem-vindo de volta
              </h2>
              <p className="text-[13.5px] text-muted-foreground leading-snug">
                Selecione seu perfil de acesso para continuar
              </p>
            </div>

            {/* ── Profile cards ────────────────────────────────── */}
            <div className="space-y-2.5">
              {PUBLIC_LOGIN_PROFILES.map((profile) => {
                const slug = profile.slug as ProfileSlug;
                const styles = PROFILE_STYLES[slug] ?? PROFILE_STYLES.colaborador;
                const Icon = profile.icon;
                const isHov = hovered === slug;
                const isPrs = pressed === slug;

                return (
                  <button
                    key={slug}
                    onClick={() => navigate(`/login/${slug}`)}
                    onMouseEnter={() => setHovered(slug)}
                    onMouseLeave={() => { setHovered(null); setPressed(null); }}
                    onMouseDown={() => setPressed(slug)}
                    onMouseUp={() => setPressed(null)}
                    className={cn(
                      "relative w-full flex items-center gap-4 text-left",
                      "rounded-xl cursor-pointer overflow-hidden",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(220,20%,97%)]",
                      "transition-all duration-200 ease-out",
                    )}
                    style={{
                      background: isHov
                        ? `linear-gradient(135deg, white 75%, ${styles.iconBg} 100%)`
                        : "white",
                      border: isHov
                        ? `1.5px solid ${styles.hoverBorder}`
                        : "1.5px solid hsl(220,14%,90%)",
                      boxShadow: isHov
                        ? styles.hoverShadow
                        : "0 1px 3px rgba(0,0,0,0.04)",
                      transform: isPrs
                        ? "translateY(0) scale(0.99)"
                        : isHov
                        ? "translateY(-2px)"
                        : "translateY(0)",
                      padding: "14px 16px",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-opacity duration-200"
                      style={{
                        background: styles.accentHex,
                        opacity: isHov ? 1 : 0,
                      }}
                    />

                    {/* Icon container */}
                    <div
                      className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200"
                      style={{
                        background: styles.iconBg,
                        transform: isHov ? "scale(1.08)" : "scale(1)",
                      }}
                    >
                      <Icon
                        className="w-[19px] h-[19px]"
                        style={{ color: styles.iconColor }}
                      />
                    </div>

                    {/* Text block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="font-semibold text-[14px] leading-tight tracking-[-0.01em] transition-colors duration-150"
                          style={{
                            color: isHov ? styles.accentHex : "hsl(var(--foreground))",
                          }}
                        >
                          {profile.label}
                        </span>
                        <span
                          className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md tracking-wide uppercase transition-opacity duration-150"
                          style={{
                            background: styles.iconBg,
                            color: styles.iconColor,
                            opacity: isHov ? 1 : 0.7,
                          }}
                        >
                          {styles.tag}
                        </span>
                      </div>
                      <span className="text-[12px] text-muted-foreground leading-snug block">
                        {profile.description}
                      </span>
                    </div>

                    {/* Arrow icon container */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: isHov ? `${styles.accentHex}1a` : "transparent",
                      }}
                    >
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-all duration-200"
                        style={{
                          color: isHov ? styles.accentHex : "hsl(var(--muted-foreground))",
                          transform: isHov ? "translateX(1px)" : "translateX(0)",
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Footer section ───────────────────────────────── */}
            <div className="mt-7 flex flex-col items-center gap-3.5">
              {/* Divider */}
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground/40 px-1">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <p className="text-[12.5px] text-muted-foreground text-center">
                Precisa de acesso?{" "}
                <a
                  href="https://wa.me/559392222356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: "hsl(172,68%,36%)" }}
                >
                  Entre em contato
                </a>
              </p>

              {/* Security badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "hsl(220,14%,93%)",
                  border: "1px solid hsl(220,14%,88%)",
                }}
              >
                <ShieldCheck className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[10.5px] font-medium text-muted-foreground/55">
                  Ambiente seguro · SSL · LGPD
                </span>
              </div>

              {/* Restricted access — very subtle */}
              <Link
                to="/login/master-admin"
                className="text-[11px] text-muted-foreground/22 hover:text-muted-foreground/50 transition-colors"
              >
                Acesso restrito
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
