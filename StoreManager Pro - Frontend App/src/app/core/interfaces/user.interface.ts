export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  lastLogin?: Date;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  phone?: string;
  address?: string;
}