import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';


// Interfaz 
// src/app/services/models.ts
export interface Paciente {
  ID_Paciente: number;
  Nombre: string;
  Apellidos?: string;
  Sexo?: 'M' | 'F' | string;
  FechaNacimiento?: string;
  Direccion?: string;
  Codigo_Postal?: string;
  Ciudad?: string;
  Ocupacion?: string;
  Telefono?: string;
  Correo?: string;
  ID_Usuario_Auth?: number;
}

export interface AntecedenteTipo {
  ID_Tipo: number;
  Nombre: string;
}

export interface PacienteAntecedente {
  ID_Paciente: number;
  ID_Tipo: number;
  Valor: boolean | number;
  Nombre?: string; // Nombre del tipo (join)
}

export interface AntecedentesOdontologicos {
  ID_Odontologico?: number;
  ID_Paciente: number;
  Ultima_Visita?: string;
  Motivo_Consulta?: string;
  Experiencia?: string;
  Molestias_Boca?: number;
  Sangrado_Encias?: number;
  Movilidad_Dental?: number;
  Rechina_Dientes?: number;
  Cepillado_Dia?: number;
}

export interface Odontograma {
  ID_Odontograma?: number;
  ID_Paciente: number;
  Ruta_Imagen?: string;
  Observaciones?: string;
  Fecha_Creacion?: string;
}

export interface Evolucion {
  ID_Evolucion?: number;
  ID_Paciente: number;
  ID_Cita?: number | null;
  Fecha?: string;
  OD?: string; // diagnóstico/clave de diente
  Tratamiento?: string;
  Costo?: number;
  Firma?: string; // ruta o base64
}

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
  HistorialCitas?: CitaHistorial[]; // NUEVA PROPIEDAD
}

export interface CitaHistorial {
  ID_Cita: number;
  Fecha: string;
  Hora: string;
  Estado: string;
  Notas?: string;
  Servicio: string;
  ServicioDescripcion: string;
}
@Injectable({
  providedIn: 'root'
})
export class Api {
  
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private API_URL = 'https://consultorio-backend-production-9816.up.railway.app/api'; // URL base general

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
  getPacienteDetalle(idPaciente: number): Observable<PacienteDetalle> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap((token: string) => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<PacienteDetalle>(
          `${this.API_URL}/paciente/${idPaciente}`,
          { headers }
        ).pipe(
          catchError((error) => {
            if (error.status === 403) {
              console.error('Acceso denegado: Paciente no asignado a este médico');
            } else if (error.status === 404) {
              console.error('Paciente no encontrado');
            }
            throw error;
          })
        );
      })
    );
  }
  
  // 8. Permite al médico cancelar una cita (INCLUYE TOKEN DE AUTH0)
  cancelarCita(idCita: number): Observable<any> {
    // 🔥 CAMBIO DE URL: Ahora apunta a la ruta específica del médico
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        
        // La nueva ruta que creaste en el backend
        return this.http.post(`${this.API_URL}/citas/cancelar-medico/${idCita}`, {}, { headers });
      })
    );
  }


  // -----------------------
  //  HISTORIAL CLINICO API
  // -----------------------

  // Tipos de antecedente (tipo_antecedente)
  getTiposAntecedente(): Observable<AntecedenteTipo[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<AntecedenteTipo[]>(`${this.API_URL}/antecedente/tipos`, { headers });
      }),
      tap(tipos => console.log('Tipos obtenidos (tap):', tipos)), // <--- aquí ves los datos
      catchError(err => {
        console.error('Error al obtener tipos de antecedente:', err);
        return of([]);
      })
    );
  }


  // Antecedentes médicos del paciente (paciente_antecedente)
  getAntecedentesMedicos(idPaciente: number): Observable<PacienteAntecedente[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<PacienteAntecedente[]>(
          `${this.API_URL}/paciente/${idPaciente}/antecedentes`, { headers }
        );
      }),
      catchError(err => {
        console.error('Error al obtener antecedentes médicos:', err);
        return of([]); // devolver array vacío en fallo
      })
    );
  }

  // Actualizar antecedentes médicos (envía un array { ID_Tipo, Valor })
  updateAntecedentesMedicos(idPaciente: number, payload: { ID_Tipo: number; Valor: number | boolean }[]): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post(`${this.API_URL}/paciente/${idPaciente}/antecedentes`, { antecedentes: payload }, { headers });
      }),
      catchError(err => {
        console.error('Error al actualizar antecedentes médicos:', err);
        return of({ ok: false, error: err });
      })
    );
  }

  // Antecedentes odontológicos (tabla antecedentes_odontologicos)
  getAntecedentesOdonto(idPaciente: number): Observable<AntecedentesOdontologicos | null> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<AntecedentesOdontologicos>(`${this.API_URL}/paciente/${idPaciente}/antecedentes-odontologicos`, { headers });
      }),
      catchError(err => {
        console.error('Error al obtener antecedentes odontológicos:', err);
        return of(null);
      })
    );
  }

  updateAntecedentesOdonto(idPaciente: number, payload: AntecedentesOdontologicos): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.put(`${this.API_URL}/paciente/${idPaciente}/antecedentes-odontologicos`, payload, { headers });
      }),
      catchError(err => {
        console.error('Error al actualizar antecedentes odontológicos:', err);
        return of({ ok: false, error: err });
      })
    );
  }

  // Odontogramas (listar)
  getOdontograma(idPaciente: number): Observable<Odontograma[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<Odontograma[]>(`${this.API_URL}/paciente/${idPaciente}/odontogramas`, { headers });
      }),
      catchError(err => {
        console.error('Error al obtener odontogramas:', err);
        return of([]);
      })
    );
  }

  // Subir odontograma (file upload)
  uploadOdontograma(idPaciente: number, file: File, observaciones?: string): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` }; // headers normales; no poner Content-Type para que HttpClient gestione el multipart
        const form = new FormData();
        form.append('file', file);
        if (observaciones) form.append('observaciones', observaciones);
        return this.http.post(`${this.API_URL}/paciente/${idPaciente}/odontograma`, form, { headers });
      }),
      catchError(err => {
        console.error('Error al subir odontograma:', err);
        return of({ ok: false, error: err });
      })
    );
  }

  // Evolución (listar)
  getEvolucion(idPaciente: number): Observable<Evolucion[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<Evolucion[]>(`${this.API_URL}/paciente/${idPaciente}/evolucion`, { headers });
      }),
      catchError(err => {
        console.error('Error al obtener evolución:', err);
        return of([]);
      })
    );
  }

  // Agregar evolución
  addEvolucion(idPaciente: number, evo: Partial<Evolucion>): Observable<Evolucion | null> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        // Asegúrate que el payload incluya los campos que espera el backend
        return this.http.post<Evolucion>(`${this.API_URL}/paciente/${idPaciente}/evolucion`, evo, { headers });
      }),
      catchError(err => {
        console.error('Error al agregar evolución:', err);
        return of(null);
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