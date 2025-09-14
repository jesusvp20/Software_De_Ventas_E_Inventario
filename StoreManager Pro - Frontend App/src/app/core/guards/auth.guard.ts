import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(): Observable<boolean> {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean> {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean> {
    return this.authService.getAuthState().pipe(
      take(1),
      map(user => {
        if (user && this.authService.isAuthenticated()) {
          return true;
        } else {
          this.notificationService.showWarning(
            'Debes iniciar sesión para acceder a esta página'
          );
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}