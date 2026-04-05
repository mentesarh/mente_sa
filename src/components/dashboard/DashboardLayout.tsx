import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Menu, X, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

const DashboardLayout = ({
  children,
  title,
  subtitle,
  navItems,
  userType: propUserType,
  userName: propUserName,
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Overlay mobile ────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex",
          "bg-gradient-sidebar border-r border-sidebar-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-[15px] leading-tight block">
                Mente Sã
              </span>
              <span className="text-[11px] text-sidebar-foreground/50 leading-tight">
                {displayUserType}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-sidebar-foreground/30 px-3 mb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== location.pathname.split("/")[0] + "/" &&
                location.pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-sidebar-primary")} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-xs font-bold text-white">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-sidebar-accent-foreground truncate leading-tight">
                {displayUserName}
              </p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate leading-tight">
                {displayUserType}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-xs">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[15px] text-foreground">Mente Sã</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Page Header */}
        <div className="bg-card border-b border-border px-6 py-5 lg:px-8 lg:py-6 shrink-0">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
