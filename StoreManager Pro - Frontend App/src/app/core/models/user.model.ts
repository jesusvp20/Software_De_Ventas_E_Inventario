import { User, UserProfile } from '../interfaces/user.interface';

export class UserModel implements User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  lastLogin?: Date;

  constructor(data: Partial<User>) {
    this.uid = data.uid || '';
    this.email = data.email || '';
    this.name = data.name || '';
    this.role = data.role || 'user';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
    this.isActive = data.isActive ?? true;
    this.lastLogin = data.lastLogin ? new Date(data.lastLogin) : undefined;
  }

  // Métodos útiles
  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  get displayName(): string {
    return this.name || this.email.split('@')[0];
  }

  get initials(): string {
    return this.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  get isOnline(): boolean {
    if (!this.lastLogin) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastLogin > fiveMinutesAgo;
  }

  // Validaciones
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static isValidName(name: string): boolean {
    return name.trim().length >= 2;
  }

  // Conversiones
  toProfile(): UserProfile {
    return {
      uid: this.uid,
      name: this.name,
      email: this.email,
      role: this.role
    };
  }

  toJSON(): User {
    return {
      uid: this.uid,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      lastLogin: this.lastLogin
    };
  }

  // Factory methods
  static fromFirebaseUser(firebaseUser: any): UserModel {
    return new UserModel({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      role: 'user',
      createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined,
      lastLogin: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined
    });
  }

  static fromApiResponse(apiData: any): UserModel {
    return new UserModel(apiData);
  }
}