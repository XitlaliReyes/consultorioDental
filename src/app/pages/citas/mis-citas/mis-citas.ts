import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Cita {
  ID_Cita: number;
  Fecha_Cita: string; 
  Hora_Cita: string;
  Estado: 'Agendada' | 'Confirmada' | 'Cancelada';
  Servicio: string;
  Nombre_Medico: string;
  Apellidos_Medico: string;
  Notas?: string;
}

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DatePipe],
  templateUrl: './mis-citas.html',
  styleUrls: ['./mis-citas.css']
})
export class MisCitasComponent implements OnInit {
  
  private apiUrl = 'http://localhost:3000';
  citas: Cita[] = [];
  loading = true;
  error: string | null = null;
  
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { } 

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading = true;
    this.error = null;
    
    // Obtener el token de Auth0 y hacer la petición autenticada
    this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<Cita[]>(`${this.apiUrl}/api/citas/mis-citas`, { headers });
      }),
      catchError(err => {
        console.error('Error al cargar citas:', err);
        this.error = 'No se pudieron cargar las citas. Asegúrate de estar logueado y tener un perfil de Paciente.';
        this.loading = false;
        return of([]);
      })
    ).subscribe({
      next: (data) => {
        this.citas = data;
        this.loading = false;
      }
    });
  }
  
  // Función para determinar si la cita se puede cancelar (más de 7 días de antelación)
  canCancel(cita: Cita): boolean {
    if (cita.Estado === 'Cancelada') return false;

    const fechaCita = new Date(cita.Fecha_Cita);
    fechaCita.setHours(0, 0, 0, 0);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const diffTime = fechaCita.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Se puede cancelar si faltan más de 7 días
    return diffDays > 7; 
  }

  cancelarCita(idCita: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    // Obtener el token y hacer la petición autenticada
    this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post(`${this.apiUrl}/api/citas/cancelar/${idCita}`, {}, { headers });
      }),
      catchError(err => {
        console.error('Error al cancelar:', err);
        alert('Error al cancelar la cita: ' + (err.error?.error || 'No se pudo cancelar.'));
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response) {
          alert(response.message);
          this.cargarCitas(); // Recargar la lista
        }
      }
    });
  }
}