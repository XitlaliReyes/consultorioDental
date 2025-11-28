import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 
import { AuthService } from '@auth0/auth0-angular'; 

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true 
})
export class Login {
  
  

  // 1. Inyectamos AuthService de Auth0
  constructor(public auth: AuthService, private router: Router) {}

  /**
   * Inicia el flujo de autenticación, redirigiendo al Login Universal de Auth0.
   */
  onLogin() {
    this.auth.loginWithRedirect({
      authorizationParams: {
        prompt: 'login'   // 👈 fuerza a Auth0 a pedir correo siempre
      }
    });
  }
  /**
   * Inicia el flujo de registro, redirigiendo al Login Universal y pidiéndole 
   * a Auth0 que muestre la pestaña de 'Sign Up' por defecto.
   */
  onRegister() {
    this.auth.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  }

  
}
