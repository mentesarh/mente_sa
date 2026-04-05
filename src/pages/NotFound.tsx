import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Brain, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Rota não encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Página não encontrada</p>
        <p className="text-sm text-muted-foreground mb-8">
          A rota <code className="bg-muted px-1 rounded">{location.pathname}</code> não existe.
        </p>
        <Button asChild>
          <Link to="/" className="gap-2">
            <Home className="w-4 h-4" />
            Voltar ao início
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
