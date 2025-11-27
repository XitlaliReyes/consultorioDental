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

export interface CitaPendiente {
  id_cita: number;
  fecha: string;
  hora: string;
  estado: string;
  notas: string;
  paciente: {
    nombre: string;
    telefono: string;
    correo: string;
  };
}

export interface ServicioConCitas {
  id_servicio: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  citas: CitaPendiente[];
}

export interface CitaMedico {
  ID_Cita: number;
  Fecha: string;
  Hora: string;
  Estado: string;
  Notas: string;
  Servicio: string;
  Paciente_Nombre: string;
  Paciente_Telefono: string;
  Paciente_Correo: string;
}

export interface PacienteBasico {
  ID_Paciente: number;
  Nombre: string;
}

export interface PacienteDetalle extends PacienteBasico {
  Sexo: string;
  FechaNacimiento: string;
  Direccion: string;
  Codigo_Postal: string;
  Ciudad: string;
  Ocupacion: string;
  Telefono: string;
  Correo: string;
}
@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private API_URL = 'http://localhost:3000/api'; // URL base general

  // 1. Obtiene el rol del usuario autenticado
  getRole(): Observable<ProfileRoleResponse | null> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<ProfileRoleResponse>(`${this.API_URL}/profile/get-role`, { headers });
      }),
      catchError(error => {
        console.error('Error al obtener el rol o token no disponible:', error);
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
        return this.http.post(`${this.API_URL}/profile/register`, payload, { headers });
      })
    );
  }

  // 3. Obtiene todas las citas pendientes agrupadas por servicio (para médicos)
  getCitasPendientes(): Observable<ServicioConCitas[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<ServicioConCitas[]>(`${this.API_URL}/citas/pendientes`, { headers });
      }),
      catchError(error => {
        console.error('Error al obtener citas pendientes:', error);
        return of([]);
      })
    );
  }

  // 4. Permite al médico aceptar una cita
  aceptarCita(idCita: number): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post(`${this.API_URL}/citas/aceptar/${idCita}`, {}, { headers });
      })
    );
  }

  // 5. Obtiene las citas asignadas al médico
  getMisCitasMedico(): Observable<CitaMedico[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<CitaMedico[]>(`${this.API_URL}/citas/mis-citas-medico`, { headers });
      }),
      catchError(error => {
        console.error('Error al obtener citas del médico:', error);
        return of([]);
      })
    );
  }


  // 6. Obtiene la lista de pacientes únicos del médico
  getMisPacientes(): Observable<PacienteBasico[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<PacienteBasico[]>(`${this.API_URL}/medico/mis-pacientes`, { headers });
      }),
      catchError(error => {
        console.error('Error al obtener lista de pacientes del médico:', error);
        return of([]);
      })
    );
  }

  // 7. Obtiene la información detallada de un paciente
  getPacienteDetalle(idPaciente: number): Observable<PacienteDetalle | null> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        // Usar <PacienteDetalle | null> en el get para manejar la posibilidad de un error 404/500
        return this.http.get<PacienteDetalle>(`${this.API_URL}/paciente/${idPaciente}`, { headers });
      }),
      catchError(error => {
        console.error('Error al obtener detalle del paciente:', error);
        return of(null); // Devolver null si hay un error
      })
    );
  }
  
  //8. el medico confirma la cita asignada 
  confirmarCita(idCita: number): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        // Llama a la nueva ruta
        return this.http.post(`${this.API_URL}/citas/confirmar/${idCita}`, {}, { headers });
      })
    );
  }
  // Rutas de prueba
  getServidorStatus(): Observable<any> {
    return this.http.get(`http://localhost:3000/`);
  }

  getTablas(): Observable<any> {
    return this.http.get(`http://localhost:3000/test-db`);
  }
}