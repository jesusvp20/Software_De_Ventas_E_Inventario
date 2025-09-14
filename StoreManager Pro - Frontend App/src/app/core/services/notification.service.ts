import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  // Toast notifications
  async showToast(config: NotificationConfig): Promise<void> {
    const toast = await this.toastController.create({
      message: config.message,
      duration: config.duration || 3000,
      position: 'bottom',
      color: this.getToastColor(config.type),
      buttons: config.showCloseButton ? [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ] : undefined
    });
    await toast.present();
  }

  // Success toast
  async showSuccess(message: string, duration: number = 3000): Promise<void> {
    await this.showToast({
      type: 'success',
      title: 'Éxito',
      message,
      duration
    });
  }

  // Error toast
  async showError(message: string, duration: number = 5000): Promise<void> {
    await this.showToast({
      type: 'error',
      title: 'Error',
      message,
      duration
    });
  }

  // Warning toast
  async showWarning(message: string, duration: number = 4000): Promise<void> {
    await this.showToast({
      type: 'warning',
      title: 'Advertencia',
      message,
      duration
    });
  }

  // Info toast
  async showInfo(message: string, duration: number = 3000): Promise<void> {
    await this.showToast({
      type: 'info',
      title: 'Información',
      message,
      duration
    });
  }

  // Alert dialogs
  async showAlert(
    header: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Entendido'],
      cssClass: `alert-${type}`
    });
    await alert.present();
  }

  // Confirmation dialog
  async showConfirmation(
    header: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }

  // Loading spinner
  async showLoading(message: string = 'Cargando...'): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message,
      spinner: 'dots'
    });
    await loading.present();
    return loading;
  }

  // Dismiss all loading
  async dismissLoading(): Promise<void> {
    try {
      await this.loadingController.dismiss();
    } catch (error) {
      // Loading might already be dismissed
    }
  }

  // Prompt dialog
  async showPrompt(
    header: string,
    message: string,
    placeholder: string = '',
    inputType: string = 'text'
  ): Promise<string | null> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        inputs: [
          {
            name: 'input',
            type: inputType as any,
            placeholder
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: 'Aceptar',
            handler: (data) => resolve(data.input || null)
          }
        ]
      });
      await alert.present();
    });
  }

  // Helper method to get toast color
  private getToastColor(type: 'success' | 'error' | 'warning' | 'info'): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'primary';
    }
  }

  // Network error handler
  async handleNetworkError(): Promise<void> {
    await this.showError(
      'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.',
      5000
    );
  }

  // Server error handler
  async handleServerError(): Promise<void> {
    await this.showError(
      'Error del servidor. Por favor inténtalo más tarde.',
      5000
    );
  }

  // Validation error handler
  async handleValidationError(errors: string[]): Promise<void> {
    const message = errors.join('\n');
    await this.showError(message, 5000);
  }
}