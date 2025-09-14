import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { DecodedToken, User } from '@/types';
import { ApiResponseUtil } from '@/utils/api-response';

export class AuthMiddleware {
  static async verifyToken(request: NextRequest): Promise<{ user: User | null; error: any }> {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: ApiResponseUtil.unauthorized('Token de autorización requerido') };
      }

      const token = authHeader.substring(7);
      
      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      
      // Obtener usuario de Firestore
      const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
      
      if (!userDoc.exists) {
        return { user: null, error: ApiResponseUtil.unauthorized('Usuario no encontrado') };
      }

      const userData = userDoc.data() as User;
      
      return { user: userData, error: null };
    } catch (error) {
      console.error('Error verificando token:', error);
      return { user: null, error: ApiResponseUtil.unauthorized('Token inválido') };
    }
  }

  static async verifyAdmin(request: NextRequest): Promise<{ user: User | null; error: any }> {
    const { user, error } = await this.verifyToken(request);
    
    if (error) {
      return { user: null, error };
    }

    if (user?.role !== 'admin') {
      return { user: null, error: ApiResponseUtil.forbidden('Se requieren permisos de administrador') };
    }

    return { user, error: null };
  }

  static async verifyFirebaseToken(idToken: string): Promise<{ uid: string | null; error: any }> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return { uid: decodedToken.uid, error: null };
    } catch (error) {
      console.error('Error verificando token de Firebase:', error);
      return { uid: null, error: ApiResponseUtil.unauthorized('Token de Firebase inválido') };
    }
  }
}