import { NextRequest } from 'next/server';
import { AuthMiddleware } from '@/middleware/auth';
import { ApiResponseUtil } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    // Verificar token de autorización
    const { user, error } = await AuthMiddleware.verifyToken(request);
    
    if (error) {
      return error;
    }

    return ApiResponseUtil.success(
      { user },
      'Token válido'
    );
  } catch (error: any) {
    console.error('Error verificando token:', error);
    return ApiResponseUtil.serverError('Error interno del servidor');
  }
}

// Manejar preflight requests para CORS
"http://localhost:8100"
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin':"http://localhost:8100" ,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}