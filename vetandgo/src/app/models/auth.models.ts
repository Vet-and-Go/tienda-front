export interface RegisterRequest {
    username: string;
    password: string;
}

export interface RegisterResponse {
    id: number;
    username: string;
    password?: string; // Hashed password might be returned but we probably don't need it in frontend logic often
    role: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    role: string;
    id?: number;
}
