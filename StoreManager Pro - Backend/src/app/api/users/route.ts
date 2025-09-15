import { NextRequest } from 'next/server';
import { AuthMiddleware } from '@/middleware/auth';
import { AuthService } from '@/services/auth.service';
import { ApiResponseUtil } from '@/utils/api-response';

// Obtener todos los usuarios (solo admin)
export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea administrador
    const { user, error } = await AuthMiddleware.verifyAdmin(request);
    
    if (error) {
      return error;
    }

    // Obtener todos los usuarios
    const users = await AuthService.getAllUsers();

    return ApiResponseUtil.success(
      { users },
      'Usuarios obtenidos exitosamente'
    );
  } catch (error: any) {
    console.error('Error obteniendo usuarios:', error);
    return ApiResponseUtil.serverError('Error interno del servidor');
  }
}

// Manejar preflight requests para CORS
export async function OPTIONS() {
  const allowedOrigin = "http://localhost:8100"
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,

      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}