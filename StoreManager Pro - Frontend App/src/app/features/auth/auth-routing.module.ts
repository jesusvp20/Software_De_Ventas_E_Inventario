import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NoAuthGuard } from '../../core/guards/no-auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('../../pages/login/login.module').then(m => m.LoginPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('../../pages/register/register.module').then(m => m.RegisterPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('../../pages/olvidar-contrasena/olvidar-contrasena.module').then(m => m.OlvidarContrasenaPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }