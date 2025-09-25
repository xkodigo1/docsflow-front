// src/services/authService.ts
import axios from 'axios';
import type { LoginData, AuthResponse, User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    async login(credentials: LoginData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);

        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }

        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    async logout(): Promise<void> {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.Authorization;
    },

    async validateToken(): Promise<boolean> {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return false;

            await this.getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }
};

export const authServicePassword = {
  
    async forgotPassword(email: string): Promise<{ message: string }> {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    },
  
    async resetPassword(token: string, password: string): Promise<{ message: string }> {
      const response = await api.post<{ message: string }>('/auth/reset-password', { 
        token, 
        password 
      });
      return response.data;
    },
  
    async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
      const response = await api.get<{ valid: boolean; email?: string }>(`/auth/validate-reset-token/${token}`);
      return response.data;
    }
  };