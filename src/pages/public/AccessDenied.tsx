import { useNavigate } from "react-router-dom";
import { ShieldX, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleLabel, getDashboardRouteByRole } from "@/types/roles";

const AccessDenied = () => {
  const navigate = useNavigate();
  const { signOut, role } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-destructive/8 border border-destructive/15 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          Acesso Negado
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-1">
          Seu usuário não possui permissão para acessar esta área.
        </p>

        {role && (
          <p className="text-sm text-muted-foreground mb-7">
            Autenticado como{" "}
            <span className="font-semibold text-foreground">{getRoleLabel(role)}</span>.
          </p>
        )}

        {!role && <div className="mb-7" />}

        <div className="flex flex-col gap-2.5">
          {role && (
            <Button
              onClick={() => navigate(getDashboardRouteByRole(role))}
              className="shadow-primary"
            >
              <Home className="w-4 h-4" />
              Ir para meu Dashboard
            </Button>
          )}
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sair e trocar de conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
