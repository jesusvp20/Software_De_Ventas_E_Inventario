import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.getAuthState().pipe(
      take(1),
      map(user => {
        if (user && this.authService.isAuthenticated()) {
          // Si ya está autenticado, redirigir al home
          this.router.navigate(['/home']);
          return false;
        } else {
          // Si no está autenticado, permitir acceso
          return true;
        }
      })
    );
  }
}