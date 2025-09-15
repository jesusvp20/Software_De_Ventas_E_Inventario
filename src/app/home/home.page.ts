import { Component } from '@angular/core';
import { AutService } from '../aut.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
})
export class HomePage {
  nameUsuario: string = '';

  constructor(private auth: AutService, private router: Router) {

    this.auth.getAuthState().subscribe(user => {
    if (user) {
    this.nameUsuario = user.displayName || ''; 
    }
  })
  }

  logout() {
    this.auth.logout().then(() => this.router.navigate(['/login']));
  }
}
