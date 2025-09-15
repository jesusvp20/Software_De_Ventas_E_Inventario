import { NextRequest, NextResponse } from 'next/server';
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

    //Proteccion contra Ataques XSS 

    // Crear respuesta y setear cookie httpOnly
    const response = NextResponse.json(
      { user }, // No envíes el token en el body
      { status: 200 }
    );
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
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
      'Access-Control-Allow-Origin': 'http://localhost:8100',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}