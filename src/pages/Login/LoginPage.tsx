// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/auth/LoginForm';
import type { LoginFormData } from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
    const { login, error, clearError, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (formData: LoginFormData) => {
        await login(formData);
        // La redirección se maneja automáticamente en el useEffect de arriba
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Lado izquierdo - Formulario */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Bienvenido a DocsFlow
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Inicia sesión para gestionar tus documentos
                        </p>
                    </div>

                    <div className="mt-8">
                        <LoginForm
                            onSubmit={handleLogin}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>
                </div>
            </div>

            {/* Lado derecho - Ilustración */}
            <div className="hidden lg:block relative w-0 flex-1">
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-600 to-indigo-700">
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-white px-12">
                            <svg className="mx-auto h-32 w-32 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-3xl font-bold mb-4">Gestiona tus documentos eficientemente</h3>
                            <p className="text-blue-100 text-lg">
                                DocsFlow te ayuda a organizar, compartir y colaborar en tus documentos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;