import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, take } from 'rxjs/operators';
import { Api } from '../services/api';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(Api);

  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated$.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return of(false);
        }

        return this.api.getRole().pipe(
          map(response => {
            if (!response) {
              this.router.navigate(['/login']);
              return false;
            }
            return true;
          }),
          catchError(() => {
            this.router.navigate(['/login']);
            return of(false);
          })
        );
      })
    );
  }
}

// ============================================
// GUARD MÉDICO: Verifica rol de médico
// ============================================
@Injectable({
  providedIn: 'root'
})
export class MedicoGuard {
  private api = inject(Api);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.api.getRole().pipe(
      take(1),
      map(response => {
        // Verificar que exista respuesta y que el rol sea Medico
        if (response && response.role === 'Medico') {
          return true;
        }
        
        // Si no es médico, redirigir al home de paciente
        console.warn('Acceso denegado: Usuario no es médico');
        this.router.navigate(['/home']);
        return false;
      }),
      catchError(error => {
        console.error('Error al verificar rol de médico:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}

// ============================================
// GUARD PACIENTE: Verifica rol de paciente
// ============================================
@Injectable({
  providedIn: 'root'
})
export class PacienteGuard {
  private api = inject(Api);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.api.getRole().pipe(
      take(1),
      map(response => {
        // Verificar que exista respuesta y que el rol sea Paciente
        if (response && response.role === 'Paciente') {
          return true;
        }
        
        // Si no es paciente, redirigir al dashboard de médico
        if (response && response.role === 'Medico') {
          console.warn('Acceso denegado: Usuario es médico, no paciente');
          this.router.navigate(['/dashboard-medico']);
          return false;
        }
        
        this.router.navigate(['/login']);
        return false;
      }),
      catchError(error => {
        console.error('Error al verificar rol de paciente:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}