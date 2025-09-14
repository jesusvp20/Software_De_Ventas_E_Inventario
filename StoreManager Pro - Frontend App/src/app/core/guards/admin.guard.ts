import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(): Observable<boolean> {
    return this.checkAdminAccess();
  }

  canActivateChild(): Observable<boolean> {
    return this.checkAdminAccess();
  }

  private checkAdminAccess(): Observable<boolean> {
    return this.authService.getAuthState().pipe(
      take(1),
      switchMap(user => {
        if (!user || !this.authService.isAuthenticated()) {
          this.notificationService.showWarning(
            'Debes iniciar sesión para acceder a esta página'
          );
          this.router.navigate(['/login']);
          return [false];
        }

        // Verificar si es administrador
        return this.authService.isAdmin(user.uid).then(isAdmin => {
          if (isAdmin) {
            return true;
          } else {
            this.notificationService.showError(
              'No tienes permisos de administrador para acceder a esta página'
            );
            this.router.navigate(['/home']);
            return false;
          }
        }).catch(() => {
          this.notificationService.showError(
            'Error verificando permisos de administrador'
          );
          this.router.navigate(['/home']);
          return false;
        });
      })
    );
  }
}