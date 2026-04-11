import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain, ArrowLeft, Eye, EyeOff, ShieldAlert,
  LockKeyhole, AtSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getRoleBySlug,
  getRoleLabel,
  getDashboardRouteByRole,
  PUBLIC_LOGIN_PROFILES,
  UserRole,
} from "@/types/roles";
import BrandPanel from "@/components/auth/BrandPanel";

// ── Visual identity per profile — paleta baseada no teal do site ──
const PROFILE_STYLES = {
  coordenacao:  { iconBg: "hsl(172 68% 33% / 0.10)", iconColor: "#157a6e", accent: "#157a6e" },
  empresa:      { iconBg: "hsl(196 62% 36% / 0.10)", iconColor: "#1a6b82", accent: "#1a6b82" },
  psicologo:    { iconBg: "hsl(158 60% 36% / 0.10)", iconColor: "#1a6b4a", accent: "#1a6b4a" },
  colaborador:  { iconBg: "hsl(185 64% 34% / 0.10)", iconColor: "#186e7a", accent: "#186e7a" },
  "master-admin": { iconBg: "hsl(220 32% 20% / 0.10)", iconColor: "#2d4a6e", accent: "#2d4a6e" },
} as const;

type ProfileSlug = keyof typeof PROFILE_STYLES;

const LoginFormPage = () => {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();
  const { signIn, signOut, user, role: currentRole, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Pré-aquece a conexão com o Supabase assim que a tela de login abre
  // Isso reduz o cold start na hora que o usuário clicar em Entrar
  useEffect(() => {
    supabase.auth.getSession().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const expectedRole: UserRole | null = getRoleBySlug(roleSlug ?? "");

  useEffect(() => {
    if (!roleSlug || !expectedRole) navigate("/login", { replace: true });
  }, [roleSlug, expectedRole, navigate]);

  useEffect(() => {
    if (!loading && user && currentRole)
      navigate(getDashboardRouteByRole(currentRole), { replace: true });
  }, [user, currentRole, loading, navigate]);

  if (!expectedRole) return null;

  const publicProfile = PUBLIC_LOGIN_PROFILES.find((p) => p.slug === roleSlug);
  const ProfileIcon = publicProfile?.icon ?? ShieldAlert;
  const roleLabel =
    expectedRole === "master_admin" ? "Master Admin" : getRoleLabel(expectedRole);

  const slug = (roleSlug ?? "colaborador") as ProfileSlug;
  const styles = PROFILE_STYLES[slug] ?? PROFILE_STYLES.colaborador;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setSubmitting(true);
    setSlowConnection(false);
    // Avisa o usuário se demorar mais de 8s (cold start do Supabase)
    const slowTimer = setTimeout(() => setSlowConnection(true), 8000);
    try {
      const { error, profile } = await signIn(formData.email, formData.password);
      if (error) {
        toast.error(
          error.message?.includes("Invalid login credentials")
            ? "E-mail ou senha incorretos."
            : error.message || "Verifique suas credenciais e tente novamente."
        );
        return;
      }
      if (!profile) {
        toast.error("Perfil não encontrado. Entre em contato com o administrador.", {
          duration: 6000,
        });
        return;
      }
      if (profile.role !== expectedRole) {
        signOut(); // fire-and-forget — não bloqueia o usuário
        toast.error(
          `Este e-mail é cadastrado como "${getRoleLabel(profile.role)}". Acesse pelo portal correto.`,
          { duration: 7000 }
        );
        return;
      }
      toast.success("Acesso realizado com sucesso!");
      navigate(getDashboardRouteByRole(profile.role), { replace: true });
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      clearTimeout(slowTimer);
      setSubmitting(false);
      setSlowConnection(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — shared branding ─────────────────── */}
      <BrandPanel />

      {/* ── Right panel — login form ──────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ background: "hsl(220,20%,97%)" }}
      >
        {/* Ambient decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-40 -right-32 w-[460px] h-[460px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(172 68% 33% / 0.06) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-32 -left-16 w-[360px] h-[360px] rounded-full"
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
            {/* Back button */}
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
              Voltar ao início
            </button>

            {/* Profile identity block */}
            <div className="flex items-start gap-4 mb-8 pb-8 border-b border-border">
              {/* Role icon */}
              <div
                className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: styles.iconBg,
                  boxShadow: `0 0 0 1px ${styles.accent}25, 0 4px 12px ${styles.accent}14`,
                }}
              >
                <ProfileIcon
                  className="w-6 h-6"
                  style={{ color: styles.iconColor }}
                />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                {/* Breadcrumb */}
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground/60 mb-1">
                  Acesso como
                </p>
                <h2 className="text-[1.5rem] font-bold text-foreground tracking-[-0.025em] leading-tight">
                  {roleLabel}
                </h2>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[13px] font-semibold text-foreground"
                >
                  E-mail
                </Label>
                <div className="relative">
                  <AtSign
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-11 pl-10 bg-white border-border"
                    style={
                      formData.email
                        ? { borderColor: `${styles.accent}50` }
                        : {}
                    }
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-[13px] font-semibold text-foreground"
                  >
                    Senha
                  </Label>
                  <a
                    href="#"
                    className="text-[12px] font-medium hover:underline transition-colors"
                    style={{ color: "hsl(172,68%,36%)" }}
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <LockKeyhole
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="h-11 pl-10 pr-11 bg-white border-border"
                    style={
                      formData.password
                        ? { borderColor: `${styles.accent}50` }
                        : {}
                    }
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer group pt-0.5">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    id="remember"
                  />
                  <div
                    className="w-4 h-4 rounded border-[1.5px] border-border bg-white peer-checked:border-transparent transition-all duration-150 flex items-center justify-center"
                    style={{ borderColor: "hsl(220,14%,84%)" }}
                  />
                </div>
                <span className="text-[13px] text-muted-foreground select-none">
                  Manter-me conectado
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] mt-1"
                style={{
                  background: submitting
                    ? styles.accent + "99"
                    : `linear-gradient(135deg, ${styles.accent}, ${styles.accent}dd)`,
                  boxShadow: submitting
                    ? "none"
                    : `0 4px 16px -2px ${styles.accent}40`,
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    />
                    {slowConnection ? "Aguarde, conectando..." : "Entrando..."}
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center gap-3.5">
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

              {/* Security indicator */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl"
                style={{
                  background: "white",
                  border: "1px solid hsl(220,14%,90%)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: styles.iconBg }}
                >
                  <ProfileIcon className="w-3.5 h-3.5" style={{ color: styles.iconColor }} />
                </div>
                <span className="text-[11px] text-muted-foreground/70 font-medium">
                  Entrando como <strong className="text-foreground">{roleLabel}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginFormPage;
