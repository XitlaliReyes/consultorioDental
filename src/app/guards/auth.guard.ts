import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Api } from '../services/api';
import { Observable, of, map, catchError, switchMap, take, tap } from 'rxjs';

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
          this.router.navigate(['/login'], { replaceUrl: true });
          return of(false);
        }

        // Si está autenticado, validamos que devuelve un rol correcto
        return this.api.getRole().pipe(
          map(response => {
            if (!response) {
              this.router.navigate(['/login'], { replaceUrl: true });
              return false;
            }
            return true;
          }),
          catchError(() => {
            this.router.navigate(['/login'], { replaceUrl: true });
            return of(false);
          })
        );
      })
    );
  }
}

// ========================================================================================
// GUARD MÉDICO – SOLO PERMITE ACCESO A USUARIOS CON ROLE = "Medico"
// ========================================================================================
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
        if (response?.role === 'Medico') {
          return true;
        }
        // Si no es médico, redirigir según su rol
        if (response?.role === 'Paciente') {
          this.router.navigate(['/home'], { replaceUrl: true });
        } else {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login'], { replaceUrl: true });
        return of(false);
      })
    );
  }
}

// ========================================================================================
// GUARD PACIENTE – SOLO PERMITE ACCESO A USUARIOS CON ROLE = "Paciente"
// ========================================================================================
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
        if (response?.role === 'Paciente') {
          return true;
        }
        // Si no es paciente, redirigir según su rol
        if (response?.role === 'Medico') {
          this.router.navigate(['/dashboard-medico'], { replaceUrl: true });
        } else {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login'], { replaceUrl: true });
        return of(false);
      })
    );
  }
}