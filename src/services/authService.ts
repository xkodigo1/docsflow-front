import api from './api';
import type { LoginData, AuthResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await api.post('/login', credentials);
    const data = response.data;
    
    // El backend devuelve access_token, pero el frontend espera token
    return {
      user: {
        id: 0, // Se obtendrá del token
        email: credentials.email,
        role: 'operador' as const,
        department_id: undefined,
        is_blocked: false,
        failed_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      token: data.access_token,
      message: 'Login exitoso'
    };
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async logout() {
    // En el backend no hay endpoint de logout, solo removemos el token local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
