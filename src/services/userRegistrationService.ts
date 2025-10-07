import api from './api';

export interface UserRegistrationData {
  email: string;
  password: string;
  role: 'admin' | 'operador';
  department_id?: number;
}

export interface UserRegistrationResponse {
  id: number;
  email: string;
  role: string;
  department_id?: number;
  is_blocked: boolean;
  failed_attempts: number;
  created_at: string;
  updated_at: string;
}

export const userRegistrationService = {
  async registerUser(userData: UserRegistrationData): Promise<UserRegistrationResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};
