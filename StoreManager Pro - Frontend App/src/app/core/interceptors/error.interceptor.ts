import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
          this.notificationService.handleNetworkError();
          break;

        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;

        case 401:
          errorMessage = 'No autorizado. Tu sesión ha expirado.';
          this.handleUnauthorized();
          break;

        case 403:
          errorMessage = 'Acceso denegado. No tienes permisos para esta acción.';
          break;

        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;

        case 409:
          errorMessage = error.error?.message || 'Conflicto en la solicitud';
          break;

        case 422:
          errorMessage = 'Datos de entrada inválidos.';
          if (error.error?.errors) {
            this.notificationService.handleValidationError(error.error.errors);
            return;
          }
          break;

        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          this.notificationService.handleServerError();
          break;

        case 502:
        case 503:
        case 504:
          errorMessage = 'Servicio no disponible. Inténtalo más tarde.';
          this.notificationService.handleServerError();
          break;

        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
          break;
      }
    }

    // Mostrar error si no se ha manejado específicamente
    if (error.status !== 0 && error.status !== 500 && error.status !== 502 && error.status !== 503 && error.status !== 504) {
      this.notificationService.showError(errorMessage);
    }

    console.error('HTTP Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error
    });
  }

  private handleUnauthorized(): void {
    // Limpiar datos de autenticación
    this.authService.logout();
    
    // Redirigir al login
    this.router.navigate(['/login']);
    
    // Mostrar mensaje
    this.notificationService.showWarning(
      'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
    );
  }
}