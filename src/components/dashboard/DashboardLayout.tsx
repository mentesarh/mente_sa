import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleLabel } from "@/types/roles";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  userType?: string;
  userName?: string;
  actions?: ReactNode;
}

const DashboardLayout = ({
  children,
  title,
  subtitle,
  navItems,
  userType: propUserType,
  userName: propUserName,
  actions,
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, role, profile } = useAuth();

  const displayUserName =
    propUserName ||
    profile?.display_name ||
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const displayUserType =
    propUserType || (role ? getRoleLabel(role) : "");

  const initials = displayUserName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (href: string) =>
    location.pathname === href ||
    (href !== "/" && location.pathname.startsWith(href + "/"));

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(220,16%,96%)" }}>
      {/* ── Mobile overlay ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(10,14,23,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════ */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 flex flex-col lg:static lg:translate-x-0 transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          width: 256,
          background: "linear-gradient(180deg, hsl(222,38%,10%) 0%, hsl(220,34%,8%) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.055)",
        }}
      >
        {/* ── Branding ───────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 shrink-0"
          style={{
            height: 68,
            borderBottom: "1px solid rgba(255,255,255,0.055)",
          }}
        >
          <Link
            to="/"
            className="flex items-center gap-3 group"
            onClick={() => setSidebarOpen(false)}
          >
            {/* Logo icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200"
              style={{
                background: "linear-gradient(135deg, hsl(172,68%,36%), hsl(158,58%,38%))",
                boxShadow: "0 0 20px hsl(172,68%,40%/0.30), 0 4px 10px rgba(0,0,0,0.30)",
              }}
            >
              <Brain className="w-[18px] h-[18px] text-white" />
            </div>

            {/* Brand text */}
            <div className="leading-none">
              <span
                className="block font-bold tracking-[-0.02em]"
                style={{ fontSize: 15, color: "rgba(255,255,255,0.92)" }}
              >
                Mente Sã
              </span>
              <span
                className="block mt-0.5 font-medium tracking-wide uppercase"
                style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em" }}
              >
                {displayUserType}
              </span>
            </div>
          </Link>
        </div>

        {/* ── Navigation ─────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {/* Section label */}
          <p
            className="px-3 mb-2 uppercase font-semibold tracking-widest"
            style={{ fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.12em" }}
          >
            Menu
          </p>

          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="relative flex items-center gap-3 rounded-lg transition-all duration-150 group"
                  style={{
                    padding: "9px 12px",
                    background: active
                      ? "rgba(255,255,255,0.07)"
                      : "transparent",
                    color: active
                      ? "rgba(255,255,255,0.92)"
                      : "rgba(255,255,255,0.46)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.045)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.46)";
                    }
                  }}
                >
                  {/* Active left accent bar */}
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                      style={{
                        width: 3,
                        height: 20,
                        background: "linear-gradient(180deg, hsl(172,68%,56%), hsl(158,60%,50%))",
                        boxShadow: "0 0 8px hsl(172,68%,50%/0.50)",
                      }}
                    />
                  )}

                  {/* Icon */}
                  <item.icon
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      color: active ? "hsl(172,68%,56%)" : "inherit",
                    }}
                  />

                  {/* Label */}
                  <span
                    className="flex-1 font-medium"
                    style={{ fontSize: 13.5 }}
                  >
                    {item.label}
                  </span>

                  {/* Active dot */}
                  {active && (
                    <div
                      className="rounded-full shrink-0"
                      style={{
                        width: 6,
                        height: 6,
                        background: "hsl(172,68%,56%)",
                        boxShadow: "0 0 6px hsl(172,68%,56%/0.70)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── User panel ─────────────────────────────── */}
        <div
          className="px-3 pb-4 pt-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}
        >
          {/* User info */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold"
              style={{
                background: "linear-gradient(135deg, hsl(172,68%,36%), hsl(158,58%,38%))",
                fontSize: 12,
                color: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.30)",
              }}
            >
              {initials}
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold truncate leading-tight"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}
              >
                {displayUserName}
              </p>
              <p
                className="truncate leading-tight mt-0.5"
                style={{ fontSize: 11, color: "rgba(255,255,255,0.32)" }}
              >
                {displayUserType}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full rounded-lg transition-all duration-150"
            style={{
              padding: "8px 12px",
              fontSize: 13,
              color: "rgba(255,255,255,0.36)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.09)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.36)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span className="font-medium">Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* ── Mobile topbar ────────────────────────────── */}
        <header
          className="lg:hidden flex items-center justify-between px-4 shrink-0"
          style={{
            height: 56,
            background: "hsl(222,38%,10%)",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
          }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(172,68%,36%), hsl(158,58%,38%))" }}
            >
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white" style={{ fontSize: 15 }}>Mente Sã</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* ── Page header ──────────────────────────────── */}
        <div
          className="px-6 lg:px-10 shrink-0 flex items-center justify-between"
          style={{
            paddingTop: 28,
            paddingBottom: 24,
            background: "transparent",
          }}
        >
          <div>
            <h1
              className="font-bold tracking-tight leading-tight"
              style={{ fontSize: 22, color: "hsl(220,30%,12%)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mt-0.5"
                style={{ fontSize: 13.5, color: "hsl(220,12%,54%)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>

        {/* ── Page content ─────────────────────────────── */}
        <main className="flex-1 px-6 lg:px-10 pb-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
