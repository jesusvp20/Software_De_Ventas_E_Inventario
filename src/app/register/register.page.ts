import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AutService } from '../aut.service';
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
})
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  name: string = '';

  constructor(
    private auth: AutService, 
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async registerAsAdmin() {
    // Validaciones
    const validationError = this.validateFields();
    if (validationError) {
      await this.showAlert('Datos incompletos', validationError, 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando cuenta de administrador...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      await this.auth.register(this.email, this.password, this.name, 'admin');
      await loading.dismiss();

      await this.showAlert(
        '¡Cuenta creada exitosamente!', 
        `Hola ${this.name}, tu cuenta de administrador ha sido creada correctamente. Ahora puedes iniciar sesión.`,
        'success'
      );

      this.clearForm();
      this.router.navigate(['/login']);
    } catch (err: any) {
      await loading.dismiss();
      const mensaje = this.getErrorMessage(err.code);
      await this.showAlert('Error al crear cuenta', mensaje, 'error');
    }
  }

  private validateFields(): string | null {
    if (!this.email?.trim()) {
      return 'El email es obligatorio.';
    }

    if (!this.name?.trim()) {
      return 'El nombre es obligatorio.';
    }

    if (!this.password) {
      return 'La contraseña es obligatoria.';
    }

    if (!this.confirmPassword) {
      return 'Debes confirmar tu contraseña.';
    }

    // Validación de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return 'El formato del email no es válido.';
    }

    // Validación de longitud del nombre
    if (this.name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }

    // Validación de contraseña
    if (this.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    // Verificar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      return 'Las contraseñas no coinciden. Por favor verifica que sean idénticas.';
    }

    return null;
  }


  // Manejo de errores
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Ya existe una cuenta con este email. ¿Quizás ya tienes una cuenta creada? Intenta iniciar sesión.',
      'auth/invalid-email': 'El formato del email no es válido. Por favor verifica que esté escrito correctamente.',
      'auth/weak-password': 'La contraseña es muy débil. Usa al menos 6 caracteres con una combinación de letras y números.',
      'auth/operation-not-allowed': 'El registro con email está deshabilitado. Contacta al soporte técnico.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.',
      'auth/internal-error': 'Error interno del servidor. Por favor inténtalo de nuevo en unos minutos.'
    };

    return errorMessages[errorCode] || 'Ha ocurrido un error inesperado al crear la cuenta. Por favor inténtalo de nuevo.';
  }

  private async showAlert(header: string, message: string, type: 'success' | 'error' | 'warning' = 'error') {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Entendido'],
      cssClass: `alert-${type}`
    });
    await alert.present();
  }

  private clearForm() {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.name = '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}