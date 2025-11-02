import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular'; // Asegúrate de importar esto

@Component({
  selector: 'app-navbar',
  standalone: true, // Si es standalone
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private auth = inject(AuthService); 
  
  // Propiedad para mostrar/ocultar el botón en el HTML
  isAuthenticated$ = this.auth.isAuthenticated$;

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  }
}