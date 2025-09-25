import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/layout";
import DocsPage from "../pages/paginaPrincipal";
import PrivacidadPage from "../pages/footer/privacidad";
import SoportePage from "../pages/footer/soporte";
import LoginPage from '../pages/Login/LoginPage';
import Dashboard from '../pages/Login/Dashboard';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ForgotPasswordPage from '../pages/Login/ForgotPassword';
import ResetPasswordPage from '../pages/Login/ResetPasswordPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas con Layout como wrapper */}
      <Route path="/" element={<Layout />}>
        {/*<Route index element={<DocsPage />} />*/}
        <Route path="docs" element={<DocsPage />} />
        <Route path="upload" element={<DocsPage />} />
        <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="privacidad" element={<PrivacidadPage />} />
        <Route path="soporte" element={<SoportePage />} />
      </Route>
    </Routes>
  );
}



