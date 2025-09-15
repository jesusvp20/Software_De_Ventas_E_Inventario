import { NextRequest } from 'next/server';
import { AuthMiddleware } from '@/middleware/auth';
import { AuthService } from '@/services/auth.service';
import { ApiResponseUtil } from '@/utils/api-response';
import { User } from '@/types';

// Obtener usuario por UID
export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    // Verificar autenticación
    const { user: currentUser, error } = await AuthMiddleware.verifyToken(request);
    
    if (error) {
      return error;
    }

    const { uid } = params;

    // Solo admin puede ver otros usuarios, o el usuario puede ver su propio perfil
    if (currentUser!.role !== 'admin' && currentUser!.uid !== uid) {
      return ApiResponseUtil.forbidden('No tienes permisos para ver este usuario');
    }

    // Obtener usuario
    const user = await AuthService.getUserByUid(uid);
    
    if (!user) {
      return ApiResponseUtil.notFound('Usuario no encontrado');
    }

    return ApiResponseUtil.success(
      { user },
      'Usuario obtenido exitosamente'
    );
  } catch (error: any) {
    console.error('Error obteniendo usuario:', error);
    return ApiResponseUtil.serverError('Error interno del servidor');
  }
}

// Actualizar usuario
export async function PUT(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    // Verificar autenticación
    const { user: currentUser, error } = await AuthMiddleware.verifyToken(request);
    
    if (error) {
      return error;
    }

    const { uid } = params;
    const body = await request.json();

    // Solo admin puede actualizar otros usuarios, o el usuario puede actualizar su propio perfil
    if (currentUser!.role !== 'admin' && currentUser!.uid !== uid) {
      return ApiResponseUtil.forbidden('No tienes permisos para actualizar este usuario');
    }

    // Si no es admin, no puede cambiar el rol
    if (currentUser!.role !== 'admin' && body.role) {
      delete body.role;
    }

    // Actualizar usuario
    const updatedUser = await AuthService.updateUserProfile(uid, body);

    return ApiResponseUtil.success(
      { user: updatedUser },
      'Usuario actualizado exitosamente'
    );
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    return ApiResponseUtil.serverError('Error interno del servidor');
  }
}

// Eliminar usuario (solo admin)
export async function DELETE(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    // Verificar que el usuario sea administrador
    const { user, error } = await AuthMiddleware.verifyAdmin(request);
    
    if (error) {
      return error;
    }

    const { uid } = params;

    // No permitir que el admin se elimine a sí mismo
    if (user!.uid === uid) {
      return ApiResponseUtil.error('No puedes eliminar tu propia cuenta', 400);
    }

    // Eliminar usuario
    await AuthService.deleteUser(uid);

    return ApiResponseUtil.success(
      null,
      'Usuario eliminado exitosamente'
    );
  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    return ApiResponseUtil.serverError('Error interno del servidor');
  }
}

// Manejar preflight requests para CORS
export async function OPTIONS() {
    const allowedOrigin = "http://localhost:8100"

  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin  ,
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}