// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/auth/LoginForm';
import type { LoginFormData } from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { login, error,  isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (formData: LoginFormData) => {
    await login(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Formulario (más ancho) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Logo más pequeño y minimalista */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 rounded-lg p-3">
                <svg 
                  className="h-8 w-8 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DocsFlow</h1>
            <p className="mt-2 text-sm text-gray-600">Gestión documental simplificada</p>
          </div>

          {/* Card del formulario con sombra suave */}
          <div className="bg-white rounded-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Iniciar sesión
              </h2>
              <p className="mt-1 text-sm text-gray-500 text-center">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;