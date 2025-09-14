import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Componentes compartidos
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';

// Directivas
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AutofocusDirective } from './directives/autofocus.directive';

// Pipes
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

const COMPONENTS = [
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ConfirmationModalComponent
];

const DIRECTIVES = [
  ClickOutsideDirective,
  AutofocusDirective
];

const PIPES = [
  SafeHtmlPipe,
  TimeAgoPipe,
  TruncatePipe
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ]
})
export class SharedModule { }