import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile 
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  docData 
} from '@angular/fire/firestore';
import { authState } from '@angular/fire/auth';
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

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private injector: Injector = inject(Injector);
  private http: HttpClient = inject(HttpClient);
  
  // URL del backend API
  private readonly API_URL = 'http://localhost:3001/api';
  
  // Usar endpoints de desarrollo temporalmente
  private readonly USE_DEV_ENDPOINTS = true;
  
  // Estado de autenticación para compatibilidad
  private authStateSubject = new BehaviorSubject<any>(null);
  private currentToken: string | null = null;
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
        })
      );

      if (response.success && response.data) {
        // Guardar token y datos del usuario
        this.currentToken = response.data.token;
        this.currentUserData = response.data.user;
        if (this.currentToken) {
          localStorage.setItem('authToken', this.currentToken);
        }
        localStorage.setItem('userData', JSON.stringify(this.currentUserData));
        
        // Actualizar estado de autenticación
        this.authStateSubject.next(this.currentUserData);
        
        // Retornar formato compatible con Firebase
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
        })
      );

      if (response.success && response.data) {
        // Guardar token y datos del usuario
        this.currentToken = response.data.token;
        this.currentUserData = response.data.user;
        if (this.currentToken) {
          localStorage.setItem('authToken', this.currentToken);
        }
        localStorage.setItem('userData', JSON.stringify(this.currentUserData));
        
        // Actualizar estado de autenticación
        this.authStateSubject.next(this.currentUserData);
        
        // Retornar formato compatible con Firebase
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
      // Limpiar datos locales
      this.currentToken = null;
      this.currentUserData = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Actualizar estado de autenticación
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
        })
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
    if (!this.currentUserData) {
      // Intentar cargar desde localStorage
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      if (userData && token) {
        this.currentUserData = JSON.parse(userData);
        this.currentToken = token;
        this.authStateSubject.next(this.currentUserData);
        return true;
      }
    }
    return this.currentUserData !== null;
  }

  // Obtener usuario actual
  getCurrentUser() {
    if (!this.currentUserData) {
      // Intentar cargar desde localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        this.currentUserData = JSON.parse(userData);
      }
    }
    
    return this.currentUserData ? {
      uid: this.currentUserData.uid,
      email: this.currentUserData.email,
      displayName: this.currentUserData.name
    } : null;
  }

  // Escuchar cambios en el estado de autenticación
  getAuthState(): Observable<any> {
    // Inicializar con datos del localStorage si existen
    if (!this.currentUserData) {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      if (userData && token) {
        this.currentUserData = JSON.parse(userData);
        this.currentToken = token;
        this.authStateSubject.next(this.currentUserData);
      }
    }
    
    return this.authStateSubject.asObservable();
  }

  // Verificar si el usuario es administrador
  async isAdmin(uid: string): Promise<boolean> {
    try {
      // Si tenemos los datos del usuario actual y coincide el UID
      if (this.currentUserData && this.currentUserData.uid === uid) {
        return this.currentUserData.role === 'admin';
      }
      
      // Si no, hacer petición al backend
      if (this.currentToken) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.currentToken}`
        });
        
        const response = await firstValueFrom(
          this.http.get<ApiResponse<{ user: User }>>(`${this.API_URL}/users/${uid}`, { headers })
        );
        
        if (response.success && response.data) {
          return response.data.user.role === 'admin';
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando rol:', error);
      return false;
    }
  }
  
  // Método para obtener el token actual
  getToken(): string | null {
    if (!this.currentToken) {
      this.currentToken = localStorage.getItem('authToken');
    }
    return this.currentToken;
  }
  
  // Método para verificar token con el backend
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ user: User }>>(`${this.API_URL}/auth/verify`, { headers })
      );
      
      if (response.success && response.data) {
        this.currentUserData = response.data.user;
        this.authStateSubject.next(this.currentUserData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }
}
