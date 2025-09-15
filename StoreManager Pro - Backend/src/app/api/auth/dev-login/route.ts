import { NextRequest } from 'next/server';
import { ApiResponseUtil } from '@/utils/api-response';
import jwt from 'jsonwebtoken';
import { AuthRequest, User } from '@/types';

// Endpoint temporal para desarrollo sin Firebase Admin SDK
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

    // Usuario de desarrollo temporal
    const devUser: User = {
      uid: 'dev-user-' + Date.now(),
      email: body.email,
      name: 'Usuario de Desarrollo',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generar token JWT
    const token = jwt.sign(
      { uid: devUser.uid, email: devUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return ApiResponseUtil.success(
      { user: devUser, token },
      'Inicio de sesión exitoso (modo desarrollo)'
    );
  } catch (error: any) {
    console.error('Error en dev-login:', error);
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
