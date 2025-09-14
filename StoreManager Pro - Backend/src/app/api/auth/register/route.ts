import { NextRequest } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { ApiResponseUtil } from '@/utils/api-response';
import { RegisterRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    
    // Validar datos requeridos
    if (!body.email || !body.password || !body.name) {
      return ApiResponseUtil.error('Email, contraseña y nombre son requeridos', 400);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return ApiResponseUtil.error('Formato de email inválido', 400);
    }

    // Validar longitud de contraseña
    if (body.password.length < 6) {
      return ApiResponseUtil.error('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Registrar usuario
    const { user, token } = await AuthService.registerUser(body);

    return ApiResponseUtil.success(
      { user, token },
      'Usuario registrado exitosamente',
      201
    );
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    if (error.message.includes('email-already-exists')) {
      return ApiResponseUtil.error('El email ya está registrado', 409);
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