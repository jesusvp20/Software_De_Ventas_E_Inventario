import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-olvidar-contrasena',
  templateUrl: './olvidar-contrasena.component.html',
  styleUrls: ['./olvidar-contrasena.component.scss']
})
export class OlvidarContrasenaComponent implements OnInit {
  email: string = '';

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
  }

  resetPassword() {
    if (!this.email) {
      alert('Por favor ingresa tu correo');
      return;
    }

    this.auth.resetPassword(this.email)
      .then(() => {
        alert('Hemos enviado un correo para restablecer tu contraseña, revisa tu bandeja de entrada y spam ');
        this.router.navigate(['/login']);
      })
      .catch((err: any) => alert(err.message));
  }
}
