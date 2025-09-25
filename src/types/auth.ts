export interface User {
    id: number;
    email: string;
    name: string;
    role?: string;
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

