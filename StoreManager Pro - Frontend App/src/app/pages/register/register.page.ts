import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  name: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private loadingController: LoadingController,
    private notificationService: NotificationService
  ) {}

  async registerAsAdmin() {
    // Validaciones
    const validationError = this.validateFields();
    if (validationError) {
      await this.notificationService.showWarning(validationError);
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando cuenta de administrador...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      await this.authService.register(this.email, this.password, this.name, 'admin');
      await loading.dismiss();

      await this.notificationService.showSuccess(
        `¡Hola ${this.name}! Tu cuenta de administrador ha sido creada correctamente. Ahora puedes iniciar sesión.`
      );

      this.clearForm();
      this.router.navigate(['/login']);
    } catch (err: any) {
      await loading.dismiss();
      const mensaje = this.getErrorMessage(err.code || err.message || err.error?.message);
      await this.notificationService.showError(mensaje);
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
      // Errores de Firebase (compatibilidad)
      'auth/email-already-in-use': 'Ya existe una cuenta con este email. ¿Quizás ya tienes una cuenta creada? Intenta iniciar sesión.',
      'auth/invalid-email': 'El formato del email no es válido. Por favor verifica que esté escrito correctamente.',
      'auth/weak-password': 'La contraseña es muy débil. Usa al menos 6 caracteres con una combinación de letras y números.',
      'auth/operation-not-allowed': 'El registro con email está deshabilitado. Contacta al soporte técnico.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.',
      'auth/internal-error': 'Error interno del servidor. Por favor inténtalo de nuevo en unos minutos.',
      
      // Errores del backend API
      'El email ya está registrado': 'Ya existe una cuenta con este email. ¿Quizás ya tienes una cuenta creada? Intenta iniciar sesión.',
      'Formato de email inválido': 'El formato del email no es válido. Por favor verifica que esté escrito correctamente.',
      'La contraseña debe tener al menos 6 caracteres': 'La contraseña es muy débil. Usa al menos 6 caracteres.',
      'Email, contraseña y nombre son requeridos': 'Todos los campos son obligatorios. Por favor completa la información.',
      'Error registrando usuario': 'Error al crear la cuenta. Por favor inténtalo de nuevo.',
      'Error interno del servidor': 'Error del servidor. Por favor inténtalo más tarde.',
      'Http failure response': 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.'
    };

    // Si el mensaje contiene alguna de las claves, usar el mensaje personalizado
    for (const key in errorMessages) {
      if (errorCode && errorCode.includes(key)) {
        return errorMessages[key];
      }
    }

    return errorCode || 'Ha ocurrido un error inesperado al crear la cuenta. Por favor inténtalo de nuevo.';
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