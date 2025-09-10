import { Injectable, inject } from '@angular/core';
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
  getDoc 
} from '@angular/fire/firestore';
import { authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutService {

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  // Registrar usuario
  async register(email: string, password: string, name: string, role: string = 'admin') {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);

      if (cred.user) {
        // Guardar nombre en el perfil de Firebase Auth
        await updateProfile(cred.user, { displayName: name });

        // Guardar datos en Firestore
        await setDoc(doc(this.firestore, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email,
          name,
          role
        });
      }

      return cred;
    } catch (error) {
      throw error;
    }
  }

  // Iniciar sesión
  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  // Cerrar sesión
  async logout() {
    return await signOut(this.auth);
  }

  // Resetear contraseña
  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  // Verificar si está logueado
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Escuchar cambios en el estado de autenticación
  getAuthState(): Observable<any> {
    return authState(this.auth);
  }

  // Verificar si el usuario es administrador
  async isAdmin(uid: string): Promise<boolean> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as any;
        return userData.role === 'admin';
      }

      return false;
    } catch (error) {
      console.error('Error verificando rol:', error);
      return false;
    }
  }
}
