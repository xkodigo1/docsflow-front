// src/components/auth/PublicRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../auth/LoadingSpinner';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Cargando..." />;
  }

  // Si está autenticado, redirigir a la app
  // Si no está autenticado, mostrar la página pública
  return isAuthenticated ? <Navigate to="/app" replace /> : <>{children}</>;
};

export default PublicRoute;