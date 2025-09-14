import { NextRequest } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { ApiResponseUtil } from '@/utils/api-response';
import { AuthRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json();
    
    // Validar datos requeridos
    if (!body.email || !body.password) {
      return ApiResponseUtil.error('Email y contraseña son requeridos', 400);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return ApiResponseUtil.error('Formato de email inválido', 400);
    }

    // Iniciar sesión
    const { user, token } = await AuthService.loginUser(body);

    return ApiResponseUtil.success(
      { user, token },
      'Inicio de sesión exitoso'
    );
  } catch (error: any) {
    console.error('Error en login:', error);
    
    if (error.message.includes('user-not-found') || 
        error.message.includes('There is no user record')) {
      return ApiResponseUtil.error('Usuario no encontrado', 404);
    }
    
    if (error.message.includes('wrong-password') || 
        error.message.includes('invalid-password')) {
      return ApiResponseUtil.error('Contraseña incorrecta', 401);
    }
    
    return ApiResponseUtil.serverError('Error interno del servidor');
  }
}

// Manejar preflight requests para CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}