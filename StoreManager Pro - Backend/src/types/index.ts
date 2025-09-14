export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface DecodedToken {
  uid: string;
  email: string;
  iat: number;
  exp: number;
}

export interface RequestWithUser extends Request {
  user?: User;
}