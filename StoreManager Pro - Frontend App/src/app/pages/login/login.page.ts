import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private loadingController: LoadingController,
    private notificationService: NotificationService
  ) {}

  async login() {
    // Validaciones básicas
    if (!this.email || !this.password) {
      await this.notificationService.showWarning('Por favor ingresa tu email y contraseña');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      const cred = await this.authService.login(this.email, this.password);
      
      if (cred.user) {
        // Verificar el rol del usuario
        const isAdmin = await this.authService.isAdmin(cred.user.uid);

        if (isAdmin) {
          await loading.dismiss();
          await this.notificationService.showSuccess('¡Bienvenido! Acceso concedido como administrador');
          this.router.navigate(['/home']);
        } else {
          await this.authService.logout();
          await loading.dismiss();
          await this.notificationService.showError(
            'Solo los administradores pueden acceder a este sistema. Si crees que esto es un error, contacta al soporte técnico.'
          );
        }
       }
     } catch (err: any) {
       await loading.dismiss();
       const mensaje = this.getErrorMessage(err.code || err.message || err.error?.message);
       await this.notificationService.showError(mensaje);
     }
  }
 
  //manejo de errores
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      // Errores de Firebase (compatibilidad)
      'auth/invalid-email': 'El formato del email no es válido. Por favor verifica que esté escrito correctamente.',
      'auth/user-not-found': 'No existe una cuenta registrada con este email. Verifica que esté escrito correctamente.',
      'auth/wrong-password': 'La contraseña es incorrecta. Por favor inténtalo de nuevo.',
      'auth/invalid-credential': 'El email o la contraseña son incorrectos. Por favor verifica tus datos.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor espera unos minutos antes de intentar de nuevo.',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta al administrador.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.',
      
      // Errores del backend API
      'Usuario no encontrado': 'No existe una cuenta registrada con este email. Verifica que esté escrito correctamente.',
      'Contraseña incorrecta': 'La contraseña es incorrecta. Por favor inténtalo de nuevo.',
      'Formato de email inválido': 'El formato del email no es válido. Por favor verifica que esté escrito correctamente.',
      'Error en el login': 'Error al iniciar sesión. Por favor verifica tus credenciales.',
      'Error interno del servidor': 'Error del servidor. Por favor inténtalo más tarde.',
      'Http failure response': 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.'
    };

    // Si el mensaje contiene alguna de las claves, usar el mensaje personalizado
    for (const key in errorMessages) {
      if (errorCode && errorCode.includes(key)) {
        return errorMessages[key];
      }
    }

    return errorCode || 'Ha ocurrido un error inesperado. Por favor inténtalo de nuevo.';
  }



  resetPassword() {
    this.router.navigate(['/olvidar-contraseña']);
  }

  register() {
    this.router.navigate(['/register']);
  }
}