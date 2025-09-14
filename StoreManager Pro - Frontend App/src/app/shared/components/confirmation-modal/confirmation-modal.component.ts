import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Confirmar acción';
  @Input() message: string = '¿Estás seguro de que deseas continuar?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmColor: string = 'primary';
  @Input() icon: string = 'help-circle-outline';
  @Input() type: 'info' | 'warning' | 'danger' = 'info';

  constructor(private modalController: ModalController) { }

  async confirm(): Promise<void> {
    await this.modalController.dismiss(true);
  }

  async cancel(): Promise<void> {
    await this.modalController.dismiss(false);
  }

  get iconColor(): string {
    switch (this.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      default:
        return 'primary';
    }
  }

  get buttonColor(): string {
    switch (this.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      default:
        return this.confirmColor;
    }
  }
}