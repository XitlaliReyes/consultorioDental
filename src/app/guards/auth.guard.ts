import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Api } from '../services/api';
import { Observable, of, map, catchError, switchMap, take } from 'rxjs';

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

        // Si está autenticado, validamos que devuelve un rol correcto
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
        this.router.navigate(['/home']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/home']);
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
        this.router.navigate(['/home']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}
