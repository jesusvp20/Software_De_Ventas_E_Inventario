import { Injectable, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, BehaviorSubject } from 'rxjs';

// Interfaces y modelos
import {
  User,
  AuthResponse,
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from '../interfaces';
import { UserModel } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private injector: Injector = inject(Injector);
  private http: HttpClient = inject(HttpClient);

  // URL del backend API
  private readonly API_URL = 'http://localhost:3001/api';

  // Usar endpoints de desarrollo temporalmente
  private readonly USE_DEV_ENDPOINTS = true;

  // Estado de autenticación para compatibilidad
  private authStateSubject = new BehaviorSubject<any>(null);
  private currentUserData: User | null = null;

  // Registrar usuario usando backend API
  async register(email: string, password: string, name: string, role: string = 'admin') {
    try {
      const endpoint = this.USE_DEV_ENDPOINTS ? '/auth/dev-register' : '/auth/register';
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}${endpoint}`, {
          email,
          password,
          name,
          role
        }, { withCredentials: true })
      );

      if (response.success && response.data) {
        // Guardar solo datos del usuario en memoria
        this.currentUserData = response.data.user;
        this.authStateSubject.next(this.currentUserData);

        return {
          user: {
            uid: response.data.user.uid,
            email: response.data.user.email,
            displayName: response.data.user.name
          }
        };
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Iniciar sesión usando backend API
  async login(email: string, password: string) {
    try {
      const endpoint = this.USE_DEV_ENDPOINTS ? '/auth/dev-login' : '/auth/login';
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}${endpoint}`, {
          email,
          password
        }, { withCredentials: true })
      );

      if (response.success && response.data) {
        // Guardar solo datos del usuario en memoria
        this.currentUserData = response.data.user;
        this.authStateSubject.next(this.currentUserData);

        return {
          user: {
            uid: response.data.user.uid,
            email: response.data.user.email,
            displayName: response.data.user.name
          }
        };
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      this.currentUserData = null;
      this.authStateSubject.next(null);
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  }

  // Resetear contraseña usando backend API
  async resetPassword(email: string) {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.API_URL}/auth/reset-password`, {
          email
        }, { withCredentials: true })
      );

      if (response.success) {
        return Promise.resolve();
      } else {
        throw new Error(response.message || 'Error al resetear contraseña');
      }
    } catch (error: any) {
      console.error('Error en reset password:', error);
      throw error;
    }
  }

  // Verificar si está logueado
  isAuthenticated(): boolean {
    return this.currentUserData !== null;
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUserData ? {
      uid: this.currentUserData.uid,
      email: this.currentUserData.email,
      displayName: this.currentUserData.name
    } : null;
  }

  // Escuchar cambios en el estado de autenticación
  getAuthState(): Observable<any> {
    return this.authStateSubject.asObservable();
  }

  // Verificar si el usuario es administrador
  async isAdmin(uid: string): Promise<boolean> {
    try {
      if (this.currentUserData && this.currentUserData.uid === uid) {
        return this.currentUserData.role === 'admin';
      }
      // Petición protegida, usa withCredentials
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ user: User }>>(`${this.API_URL}/users/${uid}`, { withCredentials: true })
      );
      if (response.success && response.data) {
        return response.data.user.role === 'admin';
      }
      return false;
    } catch (error) {
      console.error('Error verificando rol:', error);
      return false;
    }
  }
}