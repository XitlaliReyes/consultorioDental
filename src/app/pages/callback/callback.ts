import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';

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
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.checkUserRoleAndRedirect();
      }
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

        switch (response.role) {
          case 'Medico':
            this.router.navigate(['/dashboard-medico']);
            break;
          case 'Paciente':
            this.router.navigate(['/home']);
            break;
          case 'no_profile':
            this.router.navigate(['/onboarding']);
            break;
          default:
            this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Error al verificar el rol:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
