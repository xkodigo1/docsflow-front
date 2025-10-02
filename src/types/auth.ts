export interface User {
    id: number;
    role: string;
    department_id: number | null;
    email?: string;  // Opcional por ahora
    name?: string;   // Opcional por ahora
    createdAt?: string;
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
