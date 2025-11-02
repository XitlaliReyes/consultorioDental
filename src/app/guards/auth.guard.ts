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