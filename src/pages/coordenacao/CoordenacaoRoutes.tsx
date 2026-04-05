/**
 * CoordenacaoRoutes
 * Reutiliza os componentes de página do antigo /admin, agora sob /coordenacao/*
 */
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EmpresasPage from "@/pages/admin/empresas/EmpresasPage";
import NovaEmpresaPage from "@/pages/admin/empresas/NovaEmpresaPage";
import EditarEmpresaPage from "@/pages/admin/empresas/EditarEmpresaPage";
import PsicologosPage from "@/pages/admin/psicologos/PsicologosPage";
import ColaboradoresPage from "@/pages/admin/colaboradores/ColaboradoresPage";
import SessoesPage from "@/pages/admin/sessoes/SessoesPage";
import RelatoriosPage from "@/pages/admin/relatorios/RelatoriosPage";
import ConfiguracoesPage from "@/pages/admin/configuracoes/ConfiguracoesPage";

const CoordenacaoRoutes = () => (
  <Routes>
    <Route index element={<AdminDashboard />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="empresas" element={<EmpresasPage />} />
    <Route path="empresas/novo" element={<NovaEmpresaPage />} />
    <Route path="empresas/:id" element={<EditarEmpresaPage />} />
    <Route path="psicologos" element={<PsicologosPage />} />
    <Route path="colaboradores" element={<ColaboradoresPage />} />
    <Route path="sessoes" element={<SessoesPage />} />
    <Route path="relatorios" element={<RelatoriosPage />} />
    <Route path="configuracoes" element={<ConfiguracoesPage />} />
    <Route path="*" element={<Navigate to="/coordenacao" replace />} />
  </Routes>
);

export default CoordenacaoRoutes;
