import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomeRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Mostrar loading mientras se carga el usuario
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirigir según el rol del usuario
  if (user?.role === 'admin') {
    return <Navigate to="/documents" replace />;
  } else if (user?.role === 'operador') {
    return <Navigate to="/my-documents" replace />;
  }

  // Fallback por seguridad - redirigir a login si no hay usuario
  return <Navigate to="/login" replace />;
};

export default HomeRedirect;
