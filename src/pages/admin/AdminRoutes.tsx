import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import EmpresasPage from "./empresas/EmpresasPage";
import NovaEmpresaPage from "./empresas/NovaEmpresaPage";
import EditarEmpresaPage from "./empresas/EditarEmpresaPage";
import PsicologosPage from "./psicologos/PsicologosPage";
import ColaboradoresPage from "./colaboradores/ColaboradoresPage";
import SessoesPage from "./sessoes/SessoesPage";
import RelatoriosPage from "./relatorios/RelatoriosPage";
import ConfiguracoesPage from "./configuracoes/ConfiguracoesPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
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
};

export default AdminRoutes;
