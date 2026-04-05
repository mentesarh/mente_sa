import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { UserRole, canAccessRoute } from "@/types/roles";
import { Brain } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(180deg, hsl(222,38%,10%) 0%, hsl(220,34%,8%) 100%)" }}
      >
        {/* Logo */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
          style={{
            background: "linear-gradient(135deg, hsl(172,68%,36%), hsl(158,58%,38%))",
            boxShadow: "0 0 32px hsl(172,68%,40%/0.35)",
          }}
        >
          <Brain className="w-6 h-6 text-white" />
        </div>

        {/* Spinner refinado */}
        <div className="relative w-8 h-8">
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid hsl(172,68%,40%/0.15)" }}
          />
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ border: "2px solid transparent", borderTopColor: "hsl(172,68%,56%)" }}
          />
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.30)", letterSpacing: "0.04em" }}>
          Verificando acesso...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!role || !canAccessRoute(role, allowedRoles)) {
    return (
      <Navigate
        to="/acesso-negado"
        state={{ from: location, requiredRoles: allowedRoles, userRole: role }}
        replace
      />
    );
  }

  return <>{children}</>;
};
