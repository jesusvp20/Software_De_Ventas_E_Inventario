import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AutService } from '../aut.service';
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private auth: AutService, 
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async login() {
    // Validaciones básicas
    if (!this.email || !this.password) {
      await this.showAlert('Campos requeridos', 'Por favor ingresa tu email y contraseña');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      const cred = await this.auth.login(this.email, this.password);
      
      if (cred.user) {
        // Verificar el rol del usuario
        const isAdmin = await this.auth.isAdmin(cred.user.uid);

        if (isAdmin) {
          await loading.dismiss();
          await this.showAlert('¡Bienvenido!', 'Acceso concedido como administrador', 'success');
          this.router.navigate(['/home']);
        } else {
          await this.auth.logout();
          await loading.dismiss();
          await this.showAlert(
            'Acceso denegado', 
            'Solo los administradores pueden acceder a este sistema. Si crees que esto es un error, contacta al soporte técnico.',
            'warning'
          );
        }
       }
     } catch (err: any) {
       await loading.dismiss();
       const mensaje = this.getErrorMessage(err.code);
       await this.showAlert('Error de acceso', mensaje, 'error');
     }
  }
 
  //manejo de errores
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': 'El formato del email no es válido. Por favor verifica que esté escrito correctamente.',
      'auth/user-not-found': 'No existe una cuenta registrada con este email. Verifica que esté escrito correctamente.',
      'auth/wrong-password': 'La contraseña es incorrecta. Por favor inténtalo de nuevo.',
      'auth/invalid-credential': 'El email o la contraseña son incorrectos. Por favor verifica tus datos.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor espera unos minutos antes de intentar de nuevo.',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta al administrador.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.'
    };

    return errorMessages[errorCode] || 'Ha ocurrido un error inesperado. Por favor inténtalo de nuevo.';
  }

 //mostrar alertas
  private async showAlert(header: string, message: string, type: 'success' | 'error' | 'warning' = 'error') {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Entendido'],
      cssClass: `alert-${type}`
    });
    await alert.present();
  }

  resetPassword() {
    this.router.navigate(['/olvidar-contraseña']);
  }

  register() {
    this.router.navigate(['/register']);
  }
}