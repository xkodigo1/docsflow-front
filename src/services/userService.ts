import api from './api';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'operador';
  department_id?: number;
  is_blocked: boolean;
  failed_attempts: number;
  created_at: string;
  updated_at: string;
  blocked_at?: string;
  unblocked_at?: string;
}

export interface UserListParams {
  limit?: number;
  offset?: number;
  role?: string;
  department_id?: number;
}

export interface UserListResponse {
  items: User[];
  limit?: number;
  offset?: number;
  role?: string;
}

export const userService = {
  async getUsers(params?: UserListParams): Promise<UserListResponse> {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },
};
