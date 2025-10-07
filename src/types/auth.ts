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

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}

export interface ForgotPasswordData {
    email: string;
  }
  
  export interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword: string;
  }
