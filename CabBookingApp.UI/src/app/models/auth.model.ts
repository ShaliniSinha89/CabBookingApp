export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role?: string;
  fullName?: string;
}
