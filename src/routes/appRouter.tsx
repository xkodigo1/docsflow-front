import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/layout";
import DocsPage from "../pages/paginaPrincipal";
import PrivacidadPage from "../pages/footer/privacidad";
import SoportePage from "../pages/footer/soporte";

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas con Layout como wrapper */}
      <Route path="/" element={<Layout />}>
        {/*<Route index element={<DocsPage />} />*/}
        <Route path="docs" element={<DocsPage />} />
        <Route path="upload" element={<DocsPage />} />
        <Route path="privacidad" element={<PrivacidadPage />} />
        <Route path="soporte" element={<SoportePage />} />
      </Route>
    </Routes>
  );
}
