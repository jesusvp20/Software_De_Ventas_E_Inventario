import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export class ApiResponseUtil {
  static success<T>(data: T, message: string = 'Success', status: number = 200): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return NextResponse.json(response, { status });
  }

  static error(message: string, status: number = 400, error?: string): NextResponse {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    return NextResponse.json(response, { status });
  }

  static unauthorized(message: string = 'No autorizado'): NextResponse {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Acceso denegado'): NextResponse {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Recurso no encontrado'): NextResponse {
    return this.error(message, 404);
  }

  static serverError(message: string = 'Error interno del servidor'): NextResponse {
    return this.error(message, 500);
  }
}