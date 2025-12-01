import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.html',
  styleUrls: ['./callback.css']
})
export class CallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(Api);

  ngOnInit() {
    // Esperamos a que Auth0 termine de autenticar
    this.auth.isLoading$.pipe(
      filter(loading => !loading), // Esperar a que termine de cargar
      take(1)
    ).subscribe(() => {
      this.auth.isAuthenticated$.pipe(take(1)).subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.checkUserRoleAndRedirect();
        } else {
          // Si no está autenticado después de cargar, ir a login
          this.router.navigate(['/login']);
        }
      });
    });
  }

  private checkUserRoleAndRedirect() {
    this.api.getRole().subscribe({
      next: (response) => {
        if (!response) {
          console.error('No se pudo obtener el rol del usuario');
          this.router.navigate(['/login']);
          return;
        }

        console.log('Rol del usuario:', response.role);

        // Navegación con skipLocationChange para evitar parpadeos
        switch (response.role) {
          case 'Medico':
            this.router.navigate(['/dashboard-medico'], { replaceUrl: true });
            break;
          case 'Paciente':
            this.router.navigate(['/home'], { replaceUrl: true });
            break;
          case 'no_profile':
            this.router.navigate(['/onboarding'], { replaceUrl: true });
            break;
          default:
            this.router.navigate(['/login'], { replaceUrl: true });
        }
      },
      error: (error) => {
        console.error('Error al verificar el rol:', error);
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}