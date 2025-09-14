import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon: string = 'document-outline';
  @Input() title: string = 'No hay datos';
  @Input() message: string = 'No se encontraron elementos para mostrar';
  @Input() actionText: string = '';
  @Input() showAction: boolean = false;
  
  @Output() actionClick = new EventEmitter<void>();

  constructor() { }

  onActionClick(): void {
    this.actionClick.emit();
  }
}