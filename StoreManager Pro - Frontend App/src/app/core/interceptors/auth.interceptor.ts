import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StorageService } from '../services/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private storageService: StorageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token de autenticación
    const authToken = this.storageService.getAuthToken();

    // Si hay token y la request es a nuestro API, agregar el header de autorización
    if (authToken && this.isApiRequest(req.url)) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return next.handle(authReq);
    }

    // Si no hay token o no es una request a nuestro API, continuar sin modificar
    return next.handle(req);
  }

  private isApiRequest(url: string): boolean {
    // Verificar si la URL es de nuestro backend API
    return url.includes('localhost:3001/api') || 
           url.includes('your-production-api.com/api');
  }
}