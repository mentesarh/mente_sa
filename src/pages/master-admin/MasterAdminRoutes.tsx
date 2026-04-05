import { Routes, Route, Navigate } from "react-router-dom";
import MasterAdminDashboard from "./MasterAdminDashboard";
import UsuariosPage from "./usuarios/UsuariosPage";

// Páginas de master-admin que reutilizam os componentes da coordenação
// com acesso total (sem restrições de role da RLS)
import EmpresasPage from "@/pages/admin/empresas/EmpresasPage";
import NovaEmpresaPage from "@/pages/admin/empresas/NovaEmpresaPage";
import EditarEmpresaPage from "@/pages/admin/empresas/EditarEmpresaPage";
import PsicologosPage from "@/pages/admin/psicologos/PsicologosPage";
import ColaboradoresPage from "@/pages/admin/colaboradores/ColaboradoresPage";
import RelatoriosPage from "@/pages/admin/relatorios/RelatoriosPage";
import ConfiguracoesPage from "@/pages/admin/configuracoes/ConfiguracoesPage";

// Wrapper para redirecionar paths internos (empresas usam /coordenacao internamente)
// Para master-admin, as páginas de empresas/psicologos reutilizadas ainda
// navegam para /coordenacao/ — isso é aceitável pois master_admin
// também tem acesso a /coordenacao/* via ProtectedRoute

const MasterAdminRoutes = () => (
  <Routes>
    <Route index element={<MasterAdminDashboard />} />
    <Route path="dashboard" element={<MasterAdminDashboard />} />
    <Route path="usuarios" element={<UsuariosPage />} />
    <Route path="empresas" element={<EmpresasPage />} />
    <Route path="empresas/novo" element={<NovaEmpresaPage />} />
    <Route path="empresas/:id" element={<EditarEmpresaPage />} />
    <Route path="psicologos" element={<PsicologosPage />} />
    <Route path="colaboradores" element={<ColaboradoresPage />} />
    <Route path="relatorios" element={<RelatoriosPage />} />
    <Route path="configuracoes" element={<ConfiguracoesPage />} />
    <Route path="*" element={<Navigate to="/master-admin" replace />} />
  </Routes>
);

export default MasterAdminRoutes;
