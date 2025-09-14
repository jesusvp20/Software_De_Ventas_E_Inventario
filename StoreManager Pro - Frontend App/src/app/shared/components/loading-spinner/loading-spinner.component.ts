import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Cargando...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = 'primary';
  @Input() overlay: boolean = false;

  constructor() { }
}