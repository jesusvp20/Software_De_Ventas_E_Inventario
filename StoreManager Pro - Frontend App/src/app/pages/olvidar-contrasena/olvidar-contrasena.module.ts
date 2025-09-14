import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { OlvidarContrasenaComponent } from './olvidar-contrasena.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: OlvidarContrasenaComponent }])
  ],
  declarations: [OlvidarContrasenaComponent]
})
export class OlvidarContrasenaPageModule {}