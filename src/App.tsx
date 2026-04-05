import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Páginas públicas
import Index from "./pages/Index";
import Login from "./pages/Login";
import LoginFormPage from "./pages/auth/LoginFormPage";
import AccessDenied from "./pages/public/AccessDenied";
import NotFound from "./pages/NotFound";

// Rotas por perfil
import MasterAdminRoutes from "./pages/master-admin/MasterAdminRoutes";
import CoordenacaoRoutes from "./pages/coordenacao/CoordenacaoRoutes";
import EmpresaRoutes from "./pages/empresa/EmpresaRoutes";
import PsicologoRoutes from "./pages/psicologo/PsicologoRoutes";
import ColaboradorRoutes from "./pages/colaborador/ColaboradorRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — não refaz query se dados são recentes
      gcTime: 1000 * 60 * 10,     // 10 min — mantém em cache após componente desmontar
      retry: 1,                    // só 1 retry — evita loops de erro
      refetchOnWindowFocus: false, // não refaz ao voltar para a aba
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Público */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/:roleSlug" element={<LoginFormPage />} />
            <Route path="/acesso-negado" element={<AccessDenied />} />

            {/* Master Admin — acesso total */}
            <Route
              path="/master-admin/*"
              element={
                <ProtectedRoute allowedRoles={["master_admin"]}>
                  <MasterAdminRoutes />
                </ProtectedRoute>
              }
            />

            {/* Coordenação — master_admin também tem acesso */}
            <Route
              path="/coordenacao/*"
              element={
                <ProtectedRoute allowedRoles={["coordenacao", "master_admin"]}>
                  <CoordenacaoRoutes />
                </ProtectedRoute>
              }
            />

            {/* Empresa RH */}
            <Route
              path="/empresa/*"
              element={
                <ProtectedRoute allowedRoles={["empresa_rh"]}>
                  <EmpresaRoutes />
                </ProtectedRoute>
              }
            />

            {/* Psicólogo */}
            <Route
              path="/psicologo/*"
              element={
                <ProtectedRoute allowedRoles={["psicologo"]}>
                  <PsicologoRoutes />
                </ProtectedRoute>
              }
            />

            {/* Colaborador */}
            <Route
              path="/colaborador/*"
              element={
                <ProtectedRoute allowedRoles={["colaborador"]}>
                  <ColaboradorRoutes />
                </ProtectedRoute>
              }
            />

            {/* Legado: /admin → /coordenacao (backward compat) */}
            <Route path="/admin" element={<Navigate to="/coordenacao" replace />} />
            <Route path="/admin/*" element={<Navigate to="/coordenacao" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
