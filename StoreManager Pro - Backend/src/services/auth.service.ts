import { adminAuth, adminDb, isFirebaseConfigured } from '@/lib/firebase-admin';
import { User, RegisterRequest, AuthRequest } from '@/types';
import jwt from 'jsonwebtoken';
export class AuthService {
  // Registrar nuevo usuario
  static async registerUser(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    try {
      // Verificar si Firebase está configurado
      if (!isFirebaseConfigured() || !adminAuth || !adminDb) {
        throw new Error('Firebase Admin SDK no está configurado. Use los endpoints de desarrollo.');
      }

      // Crear usuario en Firebase Auth
      const userRecord = await adminAuth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.name,
      });

      // Crear documento de usuario en Firestore
      const user: User = {
        uid: userRecord.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await adminDb.collection('users').doc(userRecord.uid).set(user);

      // Generar token JWT
      const token = jwt.sign(
        { uid: user.uid, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return { user, token };
    } catch (error: any) {
      throw new Error(`Error registrando usuario: ${error.message}`);
    }
  }

  // Iniciar sesión
  static async loginUser(credentials: AuthRequest): Promise<{ user: User; token: string }> {
    try {
      // Verificar si Firebase está configurado
      if (!isFirebaseConfigured() || !adminAuth || !adminDb) {
        throw new Error('Firebase Admin SDK no está configurado. Use los endpoints de desarrollo.');
      }

      // Obtener usuario por email
      const userRecord = await adminAuth.getUserByEmail(credentials.email);
      
      // Obtener datos del usuario de Firestore
      const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      const user = userDoc.data() as User;

      // Generar token JWT
      const token = jwt.sign(
        { uid: user.uid, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return { user, token };
    } catch (error: any) {
      throw new Error(`Error iniciando sesión: ${error.message}`);
    }
  }

  // Obtener usuario por UID
  static async getUserByUid(uid: string): Promise<User | null> {
    try {
      // Verificar si Firebase está configurado
      if (!isFirebaseConfigured() || !adminDb) {
        throw new Error('Firebase Admin SDK no está configurado.');
      }

      const userDoc = await adminDb.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(`Error obteniendo usuario: ${error.message}`);
    }
  }

  // Resetear contraseña
  static async resetPassword(email: string): Promise<string> {
    try {
      // Verificar si Firebase está configurado
      if (!isFirebaseConfigured() || !adminAuth) {
        throw new Error('Firebase Admin SDK no está configurado.');
      }

      const link = await adminAuth.generatePasswordResetLink(email);
      return link;
    } catch (error: any) {
      throw new Error(`Error generando enlace de reseteo: ${error.message}`);
    }
  }

  // Verificar si el usuario es administrador
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const user = await this.getUserByUid(uid);
      return user?.role === 'admin' || false;
    } catch (error) {
      return false;
    }
  }

  // Actualizar perfil de usuario
  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
    try {
      // Verificar si Firebase está configurado
      if (!isFirebaseConfigured() || !adminDb) {
        throw new Error('Firebase Admin SDK no está configurado.');
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await adminDb.collection('users').doc(uid).update(updateData);
      
      const updatedUser = await this.getUserByUid(uid);
      if (!updatedUser) {
        throw new Error('Usuario no encontrado después de la actualización');
      }

      return updatedUser;
    } catch (error: any) {
      throw new Error(`Error actualizando perfil: ${error.message}`);
    }
  }

  // Eliminar usuario
  static async deleteUser(uid: string): Promise<void> {
    try {
      // Verificar si Firebase está configurado
      if (!isFirebaseConfigured() || !adminAuth || !adminDb) {
        throw new Error('Firebase Admin SDK no está configurado.');
      }

      // Eliminar de Firebase Auth
      await adminAuth.deleteUser(uid);
      
      // Eliminar de Firestore
      await adminDb.collection('users').doc(uid).delete();
    } catch (error: any) {
      throw new Error(`Error eliminando usuario: ${error.message}`);
    }
  }

  // Listar todos los usuarios (solo admin)
  static async getAllUsers(): Promise<User[]> {
    try {
      // Verificar si Firebase está configurado
      if (!isFirebaseConfigured() || !adminDb) {
        throw new Error('Firebase Admin SDK no está configurado.');
      }

      const usersSnapshot = await adminDb.collection('users').get();
      const users: User[] = [];
      
      usersSnapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        users.push(doc.data() as User);
      });

      return users;
    } catch (error: any) {
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }
  }
}