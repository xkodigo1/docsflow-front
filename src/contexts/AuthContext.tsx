// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, LoginData, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!user;

    const clearError = useCallback(() => setError(null), []);

    const checkAuthStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('authToken');

            if (token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            localStorage.removeItem('authToken');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (credentials: LoginData) => {
        try {
            setIsLoading(true);
            clearError();

            const response = await authService.login(credentials);
            setUser(response.user);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(async () => {
        try {
            await authService.logout();
            setUser(null);
            setError(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};