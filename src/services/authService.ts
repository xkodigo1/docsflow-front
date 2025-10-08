import api from './api';
import type { LoginData, AuthResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    
    // Guardar el token temporalmente para obtener la información del usuario
    const tempToken = data.access_token;
    localStorage.setItem('token', tempToken);
    
    // Obtener la información real del usuario
    const user = await this.getCurrentUser();
    
    return {
      user,
      token: tempToken,
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
