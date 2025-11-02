import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Interfaz para el objeto de respuesta del backend
export interface ProfileRoleResponse {
  apellidos: string;
  correo: string;
  nombre: string;
  role: 'Medico' | 'Paciente' | 'no_profile';
  id_user?: number;
  auth0Id: string;
}

@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);
  private auth = inject(AuthService); // Inyectamos el servicio de Auth0

  private API_URL = 'http://localhost:3000/api/profile'; // URL base para las rutas de perfil

  // 1. Obtiene el rol del usuario autenticado
  getRole(): Observable<ProfileRoleResponse | null> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        // Añadimos el token como cabecera de autorización Bearer
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<ProfileRoleResponse>(`${this.API_URL}/get-role`, { headers });
      }),
      catchError(error => {
        console.error('Error al obtener el rol o token no disponible:', error);
        // Si hay error (ej. token expira o no hay token), devolvemos null
        return of(null);
      })
    );
  }

  // 2. Registra los datos del perfil (Onboarding)
  registerProfile(rol: 'Medico' | 'Paciente', data: any): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        const payload = { rol, data };
        return this.http.post(`${this.API_URL}/register`, payload, { headers });
      })
    );
  }

  // Puedes mantener otras rutas de prueba si quieres
  getServidorStatus(): Observable<any> {
    return this.http.get(`http://localhost:3000/`);
  }

  getTablas(): Observable<any> {
    return this.http.get(`http://localhost:3000/test-db`);
  }
}
