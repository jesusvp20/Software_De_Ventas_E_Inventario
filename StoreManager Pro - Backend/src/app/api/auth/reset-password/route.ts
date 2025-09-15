import { NextRequest } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { ApiResponseUtil } from '@/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar email requerido
    if (!body.email) {
      return ApiResponseUtil.error('Email es requerido', 400);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return ApiResponseUtil.error('Formato de email inválido', 400);
    }

    // Generar enlace de reseteo
    const resetLink = await AuthService.resetPassword(body.email);

    return ApiResponseUtil.success(
      { resetLink },
      'Enlace de reseteo de contraseña generado exitosamente'
    );
  } catch (error: any) {
    console.error('Error en reset password:', error);
    
    if (error.message.includes('user-not-found') || 
        error.message.includes('There is no user record')) {
      return ApiResponseUtil.error('Usuario no encontrado', 404);
    }
    
    return ApiResponseUtil.serverError('Error interno del servidor');
  }
}

// Manejar preflight requests para CORS
export async function OPTIONS() {
  
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:8100',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}