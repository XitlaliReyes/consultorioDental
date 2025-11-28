import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  isAuthenticated$ = this.auth.isAuthenticated$;

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  }

  showAlert = false;

  navegarACitas() {
    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/citas']);
      } else {
        this.showAlert = true;
      }
    });
  }

  cerrarAlerta() {
    this.showAlert = false;
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

}