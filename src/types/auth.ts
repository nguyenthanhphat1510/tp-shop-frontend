export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
}